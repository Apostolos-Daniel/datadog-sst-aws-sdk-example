import { StackContext, Api, Bucket, Queue } from "sst/constructs";
import { LogFormat, ApplicationLogLevel } from 'aws-cdk-lib/aws-lambda';

export function API({ stack }: StackContext) {
  stack.setDefaultFunctionProps({
    logFormat: LogFormat.JSON,
    applicationLogLevel: ApplicationLogLevel.DEBUG,
    runtime: 'nodejs20.x',
    environment: {
      // DD_TRACE_DISABLED_PLUGINS: 'dns',
      NODE_OPTIONS: '--enable-source-maps',
      DD_LOG_LEVEL: 'DEBUG',
    },
    nodejs: {
      sourcemap: true,
      esbuild: {
        external: [
          "sst/constructs",
          "datadog-cdk-constructs-v2",
          "aws-cdk-lib/aws-lambda",
          "dd-trace",
          "datadog-lambda-js"
        ],
      },
    },
  });

  stack.tags.setTag('service', 'my-sst-app');

  // Create an S3 bucket
  const bucket = new Bucket(stack, "ToliHelloWorldBucket");

  // Create an SQS queue
  const queue = new Queue(stack, "MyQueue");

  const api = new Api(stack, "api", {
    routes: {
      "GET /": {
        function: {
          handler: "packages/functions/src/lambda.handler",
          bind: [bucket, queue]
        },
      },
    },
  });
  stack.addOutputs({
    ApiEndpoint: api.url,
  });
}
