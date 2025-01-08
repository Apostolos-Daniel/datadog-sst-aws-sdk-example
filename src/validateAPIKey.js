const https = require('https');

const DATADOG_API_KEY = process.env.DD_API_KEY; // Ensure your API key is set as an environment variable

function validateApiKey() {
    const options = {
        hostname: 'api.us3.datadoghq.com',
        path: '/api/v1/validate',
        method: 'GET',
        headers: {
            'DD-API-KEY': DATADOG_API_KEY
        }
    };

    const req = https.request(options, (res) => {
        let data = '';

        res.on('data', (chunk) => {
            data += chunk;
        });

        res.on('end', () => {
            if (res.statusCode === 200) {
                console.log('API Key is valid:', JSON.parse(data));
            } else {
                console.error('Failed to validate API Key:', JSON.parse(data));
            }
        });
    });

    req.on('error', (error) => {
        console.error('Request error:', error.message);
    });

    req.end();
}

validateApiKey();