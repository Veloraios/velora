const express = require('express');
const axios = require('axios');

const app = express();
const port = 3000;

// Serve static HTML file
app.use(express.static('public'));

// Route to check URL redirection
app.get('/check-redirect', async (req, res) => {
    const { url } = req.query;

    if (!url) {
        return res.status(400).json({ error: 'URL is required' });
    }

    try {
        // Send the GET request to the provided URL
        const response = await axios.get(url, {
            maxRedirects: 5,  // Limit the number of redirects to avoid infinite loops
        });

        // Send back the status and final URL
        res.json({
            status: response.status,
            redirectedUrl: response.request.res.responseUrl,
        });
    } catch (error) {
        // Handle errors (e.g., invalid URL, failed request)
        if (error.response) {
            res.json({
                status: error.response.status,
                redirectedUrl: error.response.request.res.responseUrl,
            });
        } else {
            res.status(500).json({ error: 'An error occurred while checking the URL' });
        }
    }
});

// Start server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
