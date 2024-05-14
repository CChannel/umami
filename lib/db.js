export const PRISMA = 'prisma';
export const PRISMA_RO = 'prisma-ro';
export const POSTGRESQL = 'postgresql';
export const MYSQL = 'mysql';
export const CLICKHOUSE = 'clickhouse';
export const KAFKA = 'kafka';
export const KAFKA_PRODUCER = 'kafka-producer';
export const REDIS = 'redis';
export const KINESIS_FIREHOSE = 'kineis-firehose';

// Fixes issue with converting bigint values
BigInt.prototype.toJSON = function () {
  return Number(this);
};

export function getDatabaseType(url = process.env.DATABASE_URL) {
  const type = process.env.DATABASE_TYPE || (url && url.split(':')[0]);

  if (type === 'postgres') {
    return POSTGRESQL;
  }

  return type;
}

export async function runQuery(queries) {
  const db = getDatabaseType(process.env.CLICKHOUSE_URL || process.env.DATABASE_URL);

  if (db === POSTGRESQL || db === MYSQL) {
    const result = await queries[PRISMA]();
    await queries[KINESIS_FIREHOSE]();
    return result;
  }

  if (db === CLICKHOUSE) {
    if (queries[KAFKA]) {
      return queries[KAFKA]();
    }

    return queries[CLICKHOUSE]();
  }
}
