/* eslint-disable no-console */
import { parseToken } from 'next-basics';
import { validate } from 'uuid';
import { uuid } from 'lib/crypto';
import redis, { DELETED } from 'lib/redis';
import { getClientInfo, getJsonBody } from 'lib/request';
import { createSession, getSessionByUuid, getWebsiteByUuid } from 'queries';
import { putRecordToKinesisFirehose, SESSION_STREAM } from 'lib/firehose';
import { insertBigQueryData, BIGQUERY_SESSION_TABLE_ID } from 'lib/bigquery';

export async function getSession(req) {
  const { payload } = getJsonBody(req);

  if (!payload) {
    throw new Error('Invalid request');
  }

  const cache = req.headers['x-umami-cache'];

  if (cache) {
    const result = await parseToken(cache);

    if (result) {
      return result;
    }
  }

  const { website: website_uuid, hostname, screen, language } = payload;

  if (!validate(website_uuid)) {
    return null;
  }

  let websiteId = null;
  let websiteDomain = null;

  // Check if website exists
  if (redis.client) {
    websiteId = await redis.client.get(`website:${website_uuid}`);
  }

  // Check database if redis does not have
  if (!websiteId) {
    const website = await getWebsiteByUuid(website_uuid);
    websiteId = website ? website.website_id : null;
    websiteDomain = website ? website.domain : null;
  }

  if (!websiteId || websiteId === DELETED) {
    throw new Error(`Website not found: ${website_uuid}`);
  }

  // const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  // const { userAgent, browser, os, ip, country, prefecture, city, device } = await getClientInfo(
  const { userAgent, browser, os, ip, country, device } = await getClientInfo(req, payload);

  let session_uuid = uuid(websiteId, hostname, ip, userAgent);
  if (process.env.CROSSDOMAIN_TRACKING) {
    session_uuid = uuid(websiteId, ip);
  }

  let sessionCreated = false;
  let sessionId = null;
  let session = null;

  // Check if session exists
  if (redis.client) {
    sessionCreated = !!(await redis.client.get(`session:${session_uuid}`));
  }

  // Check database if redis does not have
  if (!sessionCreated) {
    session = await getSessionByUuid(session_uuid);
    sessionCreated = !!session;
    sessionId = session ? session.session_id : null;
  }

  if (!sessionCreated) {
    try {
      session = await createSession(websiteId, {
        session_uuid,
        hostname,
        browser,
        os,
        screen,
        language,
        country,
        // prefecture,
        // city,
        device,
        ip,
        user_agent: userAgent,
      });

      sessionId = session ? session.session_id : null;

      await putRecordToKinesisFirehose(
        {
          session_id: sessionId,
          website_id: websiteId,
          session_uuid,
          hostname,
          browser,
          os,
          screen,
          language,
          country,
          device,
          ip,
          user_agent: userAgent,
          created_at: new Date().toISOString().replace('Z', ''),
        },
        SESSION_STREAM,
      );
    } catch (e) {
      if (!e.message.toLowerCase().includes('unique constraint')) {
        throw e;
      }
    }
    try {
      await insertBigQueryData(
        {
          session_id: sessionId,
          website_id: websiteId,
          session_uuid,
          hostname,
          browser,
          os,
          screen,
          language,
          country,
          device,
          ip,
          user_agent: userAgent,
          created_at: new Date().toISOString().replace('Z', ''),
        },
        BIGQUERY_SESSION_TABLE_ID,
      );
    } catch (e) {
      console.error('Error inserting session into BigQuery:', e);
    }
  }

  return {
    website_id: websiteId,
    session_id: sessionId,
    session_uuid,
    website_domain: websiteDomain,
  };
}
