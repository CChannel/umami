/* eslint-disable no-console */
import { createHash } from 'crypto';
import { parseToken } from 'next-basics';
import { validate } from 'uuid';
import { uuid } from 'lib/crypto';
import redis, { DELETED } from 'lib/redis';
import { getClientInfo, getJsonBody } from 'lib/request';
import { getSessionByUuid, getWebsiteByUuid } from 'queries';
import { putRecordToKinesisFirehose, SESSION_STREAM } from 'lib/firehose';
import { insertBigQueryData, BIGQUERY_SESSION_TABLE_ID } from 'lib/bigquery';

// MySQL no longer assigns session_id. Derive a stable INT64 from session_uuid
// so pageviews and events can still be joined to the session row.
function sessionIdFromUuid(sessionUuid) {
  return createHash('sha256').update(String(sessionUuid)).digest().readUIntBE(0, 6);
}

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
  let cachedSessionId = null;

  // Check if session exists. Legacy cache values are "1" and do not carry an id.
  if (redis.client) {
    cachedSessionId = await redis.client.get(`session:${session_uuid}`);
    if (cachedSessionId) {
      sessionCreated = true;
      if (cachedSessionId !== '1') {
        sessionId = Number(cachedSessionId);
      }
    }
  }

  // Reuse the MySQL id for sessions created before writes were stopped.
  if (!sessionId) {
    const session = await getSessionByUuid(session_uuid);
    if (session) {
      sessionCreated = true;
      sessionId = session.session_id;
    }
  }

  if (!sessionCreated) {
    sessionId = sessionIdFromUuid(session_uuid);
    const createdAt = new Date();

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
        created_at: createdAt.toISOString(),
      },
      SESSION_STREAM,
    );

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
        created_at: createdAt.toISOString().replace('Z', ''),
      },
      BIGQUERY_SESSION_TABLE_ID,
    );
  }

  if (redis.client && sessionId && cachedSessionId !== String(sessionId)) {
    await redis.client.set(`session:${session_uuid}`, sessionId);
  }

  return {
    website_id: websiteId,
    session_id: sessionId,
    session_uuid,
    website_domain: websiteDomain,
  };
}
