import { SSTConfig } from "sst";
import { API } from "./stacks/MyStack";
import { Stack } from 'sst/constructs';
import { SecretsManager } from '@aws-sdk/client-secrets-manager';
import { DatadogLambda } from "datadog-cdk-constructs-v2";

export default {
  config(_input) {
    return {
      name: "my-sst-app",
      region: "eu-west-1",
    };
  },
  async stacks(app) {

    app.stack(API);

    await app.finish();

    const env = app.stage;
    const service = "my-sst-app";
    const version = "v1";

    let apiKeySecretValue: string | undefined;

    const secretsManager = new SecretsManager({
      region: 'eu-west-1',
    });

    try {
      const secretData = await secretsManager.getSecretValue({
        SecretId: 'DatadogApiKey',
      });
      if ('SecretString' in secretData) {
        apiKeySecretValue = secretData.SecretString;
      } else if (secretData.SecretBinary instanceof Buffer) {
        apiKeySecretValue = secretData.SecretBinary.toString('ascii');
      }
    } catch (error) {
      console.error('Error retrieving Datadog API key from Secrets Manager:', error);
    }

    app.node.children.forEach((stack) => {
      if (stack instanceof Stack) {
        const datadogLambda = new DatadogLambda(stack, "datadogLambda", {
          nodeLayerVersion: 118,
          addLayers: true,
          captureLambdaPayload: true,
          extensionLayerVersion: 68,
          site: "datadoghq.eu",
          apiKey: process.env.DD_API_KEY,
          enableDatadogTracing: true,
          enableMergeXrayTraces: false,
          enableDatadogLogs: true,
          injectLogContext: true,
          env,
          service,
          version,
        });

        datadogLambda.addLambdaFunctions(stack.getAllFunctions());
      }
    });
  }
} satisfies SSTConfig;
