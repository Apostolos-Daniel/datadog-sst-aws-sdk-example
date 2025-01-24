// lambda/sendMetric.ts
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';
import { sendDistributionMetric } from 'datadog-lambda-js';

const s3Client = new S3Client({});
const sqsClient = new SQSClient({});

export const handler = async (event: any) => {
  const metricName = "custom.test.metric.sendDistributionMetric";
  const metricValue = 100;  // Example metric value
  const tags = ["env:production", "service:my-cdk-app"];

  console.log(`Sending metric ${metricName} with value ${metricValue}`);

  try {
    // Send the custom metric to Datadog
    sendDistributionMetric(metricName, metricValue, ...tags);
    console.log("Metric sent successfully. Hello world");
  } catch (error) {
    console.error("Failed to send metric", error);
  }

  // Upload "Hello World" file to S3
  const bucketName = process.env.BUCKET_NAME; // Ensure this matches the bucket name in your stack
  const objectKey = 'hello.txt';
  const fileContent = 'Hello, World!';

  try {
    await s3Client.send(new PutObjectCommand({
      Bucket: bucketName,
      Key: objectKey,
      Body: fileContent,
      ContentType: 'text/plain'
    }));
    console.log(`File uploaded successfully to ${bucketName}/${objectKey}`);
  } catch (error) {
    console.error("Failed to upload file to S3", error);
  }

  // Send a message to the SQS queue
  const queueUrl = process.env.QUEUE_URL;
  const messageBody = 'Hello from Lambda!';

  try {
    await sqsClient.send(new SendMessageCommand({
      QueueUrl: queueUrl!,
      MessageBody: messageBody,
    }));
    console.log(`Message sent successfully to SQS queue: ${queueUrl}`);
  } catch (error) {
    console.error("Failed to send message to SQS", error);
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ 'my-cdk-app': `Hello world. Metrics sent, file uploaded, and message sent to SQS successfully: ${metricName}` }),
  };
};
