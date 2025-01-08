import { SSTConfig } from "sst";
import { API } from "./stacks/MyStack";
import { FunctionProps, Stack } from 'sst/constructs';
import { SecretsManager } from '@aws-sdk/client-secrets-manager';
import { DatadogLambda, Datadog } from "datadog-cdk-constructs-v2";


// export const DefaultFunctionProps: FunctionProps = {
//   nodejs: {
//     esbuild: {
//       external: ['datadog-lambda-js', 'dd-trace'],
//     },
//   },
//   runtime: 'nodejs20.x',
//   memorySize: 512,
// };

export default {
  config(_input) {
    return {
      name: "my-sst-app",
      region: "eu-west-1",
    };
  },
  async stacks(app) {
    // Exclude from the function bundle
    // since they'll be loaded from the Layer

    app.setDefaultFunctionProps({
      nodejs: {
        esbuild: {
          external: ["datadog-lambda-js", "dd-trace"],
        },
      }
    });
    app.stack(API);

    await app.finish();

    const env = app.stage;
    const service = "my-sst-app";
    const version = "v1";

    let apiKeySecretValue: string | undefined;

    const secretsManager = new SecretsManager({
      region: 'eu-west-1',
    });

    let secretData: any;
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

    // Attach the Datadog construct to each stack
    app.node.children.forEach((stack) => {
      if (stack instanceof Stack) {
        const datadogLambda = new DatadogLambda(stack, "datadogLambda", {
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

        datadogLambda.addLambdaFunctions(stack.getAllFunctions());
      }
    });
  }

  
} satisfies SSTConfig;
