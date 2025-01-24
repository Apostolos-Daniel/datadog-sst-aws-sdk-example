import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as path from "path";
import { DatadogLambda } from "datadog-cdk-constructs-v2";
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as sqs from 'aws-cdk-lib/aws-sqs';

export class DatadogCdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    
    const env = "test";
    const service = "my-cdk-app";
    const version = "v1";

    // Set a tag for the service
    cdk.Tags.of(this).add('service', service);

    // Create an S3 bucket
    const bucket = new s3.Bucket(this, 'ToliHelloWorldBucket', {
      versioned: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY, // NOT recommended for production code
      autoDeleteObjects: true, // NOT recommended for production code
    });

    // Create an SQS queue
    const queue = new sqs.Queue(this, 'MyQueue', {
      visibilityTimeout: cdk.Duration.seconds(30),
    });

    // Create a Lambda function
    const sendMetricFunction = new lambda.Function(this, "SendMetricFunction", {
      runtime: lambda.Runtime.NODEJS_20_X, // Choose a runtime
      handler: "sendMetric.handler", // Refers to the sendMetric.ts handler
      code: lambda.Code.fromAsset(path.join(__dirname, "./lambda")),
      environment: {
        DD_LOG_LEVEL: "DEBUG",
        QUEUE_URL: queue.queueUrl,
        BUCKET_NAME: bucket.bucketName,
      },
      timeout: cdk.Duration.seconds(10),  // Increase timeout to 10 seconds or more
    });

    // Grant the Lambda function permissions to send messages to the SQS queue
    queue.grantSendMessages(sendMetricFunction);

    // Grant the Lambda function permissions to write to the S3 bucket
    bucket.grantPut(sendMetricFunction);

    const datadogLambda = new DatadogLambda(this, "datadogLambda", {
      nodeLayerVersion: 118,
      addLayers: true,
      captureLambdaPayload: true,
      extensionLayerVersion: 68,
      site: "datadoghq.eu",
      //apiKeySecret: secretData,
      apiKey: process.env.DD_API_KEY,
      enableDatadogTracing: true,
      enableMergeXrayTraces: true,
      enableDatadogLogs: true,
      injectLogContext: true,
      env,
      service,
      version,
    });

    datadogLambda.addLambdaFunctions([sendMetricFunction]);

    // Create an API Gateway to trigger the Lambda function
    const api = new apigateway.RestApi(this, "Api", {
      restApiName: "Datadog API Service",
      description: "API for sending custom metrics to Datadog",
    });

    const sendMetricIntegration = new apigateway.LambdaIntegration(
      sendMetricFunction
    );

    // Create a route that invokes the Lambda
    api.root.addMethod("GET", sendMetricIntegration);
  }
}
