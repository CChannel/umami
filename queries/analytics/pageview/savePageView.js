import { URL_LENGTH } from 'lib/constants';
import { CLICKHOUSE, PRISMA, runQuery } from 'lib/db';
import kafka from 'lib/kafka';
import prisma from 'lib/prisma';
import { putRecordToKinesisFirehose, PAGEVIEW_STREAM } from 'lib/firehose';

export async function savePageView(...args) {
  return runQuery({
    [PRISMA]: () => relationalQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  });
}

async function relationalQuery(website_id, { session_id, url, referrer }) {
  const data = {
    website_id,
    session_id,
    url: url?.substring(0, URL_LENGTH),
    referrer: referrer?.substring(0, URL_LENGTH),
  };

  const pageViewData = await prisma.client.pageview.create({
    data,
  });

  const pageview = Object.assign({}, data);
  pageview.created_at = new Date();
  await putRecordToKinesisFirehose({ pageview }, PAGEVIEW_STREAM);

  return pageViewData;
}

async function clickhouseQuery(website_id, { session_uuid, url, referrer }) {
  const { getDateFormat, sendMessage } = kafka;
  const params = {
    website_id: website_id,
    session_uuid: session_uuid,
    created_at: getDateFormat(new Date()),
    url: url?.substring(0, URL_LENGTH),
    referrer: referrer?.substring(0, URL_LENGTH),
  };

  await sendMessage(params, 'pageview');
}
