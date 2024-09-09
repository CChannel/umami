import debug from 'debug';

// Import the BigQuery client
import { BigQuery } from '@google-cloud/bigquery';

const log = debug('umami:bigquery');

// Store the key as base64 encoded string in environment variable
const credential = JSON.parse(
  Buffer.from(process.env.GOOGLE_SERVICE_KEY, 'base64').toString().replace(/\n/g, ''),
);

let bigquery = null;

// Create a client instance
async function createBigQueryClient() {
  const bigquery = new BigQuery({
    projectId: credential.project_id,
    credentials: {
      client_email: credential.client_email,
      private_key: credential.private_key,
    },
  });
  return bigquery;
}

// Set the dataset and table names
export const BIGQUERY_DATASET_ID = process.env.BIGQUERY_DATASET_ID;
export const BIGQUERY_PAGEVIEW_TABLE_ID = process.env.BIGQUERY_PAGEVIEW_TABLE_ID;
export const BIGQUERY_EVENT_TABLE_ID = process.env.BIGQUERY_EVENT_TABLE_ID;
export const BIGQUERY_SESSION_TABLE_ID = process.env.BIGQUERY_SESSION_TABLE_ID;

// Function to insert data into BigQuery
export async function insertBigQueryData(data, table) {
  try {
    // Create a new client if it does not exist
    if (!bigquery) {
      bigquery = await createBigQueryClient();
    }
    // Insert the data into the table
    await bigquery.dataset(BIGQUERY_DATASET_ID).table(table).insert(data);
    log('Data inserted successfully.');
  } catch (err) {
    log('Error inserting data:', err);
  }
}
