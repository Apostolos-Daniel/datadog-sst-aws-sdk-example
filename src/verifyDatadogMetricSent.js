const axios = require('axios');

async function verifyMetricSent() {
  const start = Math.floor(Date.now() / 1000) - 3600; // 1 hour ago
  const end = Math.floor(Date.now() / 1000); // current time
  
  try {
    const response = await axios.get('https://us3.datadoghq.com/metric/metric_metadata', {
      params: {
        start,
        end,
        query: 'custom.test.metric{*}'
      },
      headers: {
        'DD-API-KEY': process.env.DD_API_KEY,
        'DD-APPLICATION-KEY': process.env.DD_APP_KEY
      }
    });

    if (response.data.series.length > 0) {
      console.log('Metric found:', response.data.series);
    } else {
      console.log('No data found for metric.');
    }
  } catch (error) {
    console.error('Error verifying metric:', error);
  }
}

// Call this function after sending the metric
verifyMetricSent();
