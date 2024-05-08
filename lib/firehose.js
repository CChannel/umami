import { Firehose } from 'aws-sdk';
import debug from 'debug';

// Configure AWS SDK with your credentials and region
const firehose = new Firehose({
  region: process.env.AWS_LS_REGION,
  accessKey: process.env.AWS_LS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_LS_SECRET_ACCESS_KEY,
});

// Define the Kinesis stream name
export const PAGEVIEW_STREAM = process.env.KINESIS_FIREHOSE_PAGEVIEW_STREAM_NAME;
export const EVENT_STREAM = process.env.KINESIS_FIREHOSE_EVENT_STREAM_NAME;
export const SESSION_STREAM = process.env.KINESIS_FIREHOSE_SESSION_STREAM_NAME;

const log = debug('umami:firehose');

// Function to put a record into the Kinesis stream
async function putRecordToKinesisFirehose(recordData, streamName) {
  const params = {
    DeliveryStreamName: streamName,
    Record: {
      Data: recordData,
    },
  };

  // Put record into Firehose
  firehose.putRecord(params, (err, data) => {
    if (err) {
      log('Error putting record:', err);
    } else {
      log('Record put successfully:', data);
    }
  });
}

export default {
  putRecordToKinesisFirehose,
};
