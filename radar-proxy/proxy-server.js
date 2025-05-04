const express = require('express');
const axios = require('axios');
const app = express();

// Setup the proxy route
app.get('/proxy/radar/:site/:product/:timestamp.png', async (req, res) => {
    const { site, product, timestamp } = req.params;
    const url = `https://radar.weather.gov/ridge/standard/${site}/${product}_${timestamp}.png`;

    try {
        // Fetch the image from the radar server
        const response = await axios.get(url, { responseType: 'arraybuffer' });

        // Set headers to handle the image type correctly
        res.set('Content-Type', 'image/png');
        res.send(response.data);
    } catch (error) {
        console.error('Error fetching radar image:', error);
        res.status(500).send('Failed to fetch radar image');
    }
});

// Start the server
app.listen(3000, () => {
    console.log('Proxy server running on http://localhost:3000');
});

