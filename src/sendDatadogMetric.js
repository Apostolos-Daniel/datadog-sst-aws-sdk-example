// sendDatadogMetric.js

const https = require('https');

/**
 * Sends a custom metric to Datadog using the HTTPS module.
 *
 * @param {string} apiKey - Your Datadog API key.
 * @param {string} metricName - The name of the custom metric.
 * @param {number} metricValue - The value of the metric.
 * @param {Array<string>} tags - An array of tags to associate with the metric.
 * @param {string} type - The type of metric ('gauge', 'count', 'rate').
 */
function sendCustomMetric(apiKey, metricName, metricValue, tags = [], type = 'gauge') {
    const data = JSON.stringify({
        series: [
            {
                metric: metricName,
                points: [
                    [Math.floor(Date.now() / 1000), metricValue]
                ],
                type: type,
                tags: tags
            }
        ]
    });

    const options = {
        hostname: 'api.us3.datadoghq.com',
        path: '/api/v1/series',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(data),
            'DD-API-KEY': apiKey
        }
    };

    const req = https.request(options, (res) => {
        let responseBody = '';

        console.log(`Status Code: ${res.statusCode}`);

        res.on('data', (chunk) => {
            responseBody += chunk;
        });

        res.on('end', () => {
            if (res.statusCode === 202) {
                console.log(`Successfully sent metric '${metricName}' with value ${metricValue}`);
            } else {
                console.error(`Failed to send metric. Response: ${responseBody}`);
            }
        });
    });

    req.on('error', (error) => {
        console.error(`Error sending metric: ${error.message}`);
    });

    req.write(data);
    req.end();
}

/**
 * Main function to execute the script.
 */
function main() {
    const apiKey = process.env.DD_API_KEY;

    if (!apiKey) {
        console.error('Error: DD_API_KEY environment variable not set.');
        process.exit(1);
    }

    // Define your custom metric details
    const metricName = 'custom.test.metric';
    const metricValue = 100; // Example value
    const tags = ['environment:test', 'application:demo']; // Optional tags
    const type = 'gauge'; // Options: 'gauge', 'count', 'rate'

    sendCustomMetric(apiKey, metricName, metricValue, tags, type);
}

// Execute the main function
main();
