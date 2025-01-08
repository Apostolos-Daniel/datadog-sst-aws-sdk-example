import { StackContext, Api } from "sst/constructs";
import { LogFormat, ApplicationLogLevel } from 'aws-cdk-lib/aws-lambda';

export function API({ stack }: StackContext) {
  stack.setDefaultFunctionProps({
    logFormat: LogFormat.JSON,
    applicationLogLevel: ApplicationLogLevel.DEBUG,
    runtime: 'nodejs20.x',
    environment: {
      DD_TRACE_DISABLED_PLUGINS: 'dns',
      NODE_OPTIONS: '--enable-source-maps',
      DD_LOG_LEVEL: 'DEBUG',
    },
    nodejs: {
      sourcemap: true,
    },
  });

  const api = new Api(stack, "api", {
    routes: {
      "GET /": "packages/functions/src/lambda.handler",
    },
  });
  stack.addOutputs({
    ApiEndpoint: api.url,
  });
}
