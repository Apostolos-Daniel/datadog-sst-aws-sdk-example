# Reproduction notes

1. `cd datadog-cdk`
2. `npm run build`
3. `npx cdk deploy`
4. `cd ..`
5. `cd my-sst-app`
6. `npm sst deploy -stage test`
7. Hit the two endpoints, e.g. `curl https://<your-api-id>.execute-api.eu-west-1.amazonaws.com/prod/` for CDK and `curl https://<your-api-id>.execute-api.eu-west-1.amazonaws.com` for SST

![alt text](image-1.png)

![alt text](image-2.png)

Metrics should be sent to Datadog. Only the cdk app is sending metrics. The SST app is not.

![alt text](image.png)