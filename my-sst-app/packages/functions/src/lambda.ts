// import { ApiHandler } from 'sst/node/api';
import { sendDistributionMetric } from "datadog-lambda-js";

export const handler = async (event: any) => {
  const metricName = "custom.test.metric.sendDistributionMetric";
  const metricValue = 100;  // Example metric value
  const tags = ["env:production", "service:my-cdk-app"];

  console.log(`Sending metric ${metricName} with value ${metricValue}`);

  try {
    // Send the custom metric to Datadog
    sendDistributionMetric(metricName, metricValue, ...tags);
    console.log("Metric sent successfully");
  } catch (error) {
    console.error("Failed to send metric", error);
  }
  // try {
  //   // Send the custom metric to Datadog
  //   sendDistributionMetricWithDate(metricName + "WithDate", metricValue, new Date(), ...tags);
  //   console.log("Metric with date sent successfully");
  // } catch (error) {
  //   console.error("Failed with date to send metric", error);
  // }

  return {
    statusCode: 200,
    body: JSON.stringify({ 'my-sst-app': `Metrics sent successfully: ${metricName}` }),
  };
};
