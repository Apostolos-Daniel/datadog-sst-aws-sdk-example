// src/metrics.js

const { sendDistributionMetric } = require("datadog-lambda-js");

// Configure the library with your Datadog API key and us3 site
process.env.DD_SITE = "datadoghq.com"; // us3 site endpoint
process.env.DD_ENV = "dev";
process.env.DD_SERVICE = "delivery-enablement";
process.env.DD_VERSION = "1.0.0";


// Define your custom metric details
const metricName = "custom.test.metric.sendDistributionMetric";
const metricValue = 100; // Example valu
const defaultTags = [
    `env:${process.env.DD_ENV}`,
    `service:${process.env.DD_SERVICE}`,
    `version:${process.env.DD_VERSION}`,
    'team:delivery-enablement',
  ];

console.log(`Sending distribution metric '${metricName}' with value ${metricValue} and tags ${defaultTags.join(", ")}...`);

try {
    sendDistributionMetric(metricName, metricValue, defaultTags);
    console.log(`Distribution metric '${metricName}' with value ${metricValue} sent successfully`);
} catch (error) {
    console.error(`Failed to send distribution metric '${metricName}' with value ${metricValue}:`, error);
}