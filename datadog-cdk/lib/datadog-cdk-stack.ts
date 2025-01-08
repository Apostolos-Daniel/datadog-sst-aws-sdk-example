import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as path from "path";
import { DatadogLambda } from "datadog-cdk-constructs-v2";

export class DatadogCdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const env = "test";
    const service = "my-cdk-app";
    const version = "v1";

    // Create a Lambda function
    const sendMetricFunction = new lambda.Function(this, "SendMetricFunction", {
      runtime: lambda.Runtime.NODEJS_20_X, // Choose a runtime
      handler: "sendMetric.handler", // Refers to the sendMetric.ts handler
      code: lambda.Code.fromAsset(path.join(__dirname, "./lambda")),
      environment: {
        DD_LOG_LEVEL: "DEBUG",
      },
      timeout: cdk.Duration.seconds(10),  // Increase timeout to 10 seconds or more
    });

    const datadogLambda = new DatadogLambda(this, "datadogLambda", {
      nodeLayerVersion: 108,
      addLayers: true,
      captureLambdaPayload: true,
      extensionLayerVersion: 56,
      site: "datadoghq.eu",
      //apiKeySecret: secretData,
      apiKey: process.env.DD_API_KEY,
      enableDatadogTracing: true,
      enableMergeXrayTraces: false,
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
