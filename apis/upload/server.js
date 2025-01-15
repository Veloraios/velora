const express = require('express');
const formidable = require('formidable');
const axios = require('axios');  // Axios for HTTP requests
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// GitHub repository details
const GITHUB_TOKEN = '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';  // Replace with your GitHub personal access token
const OWNER = 'Veloraios';      // Your GitHub username
const REPO = 'ipa-storage';      // Your GitHub repository name
const GITHUB_API_URL = 'https://api.github.com';

// Serve the HTML page for file upload
app.use(express.static(path.join(__dirname, 'public')));

// Function to create a release
async function createRelease(tagName) {
  const releaseData = {
    tag_name: tagName,
    name: tagName,
    body: 'Release created via API with uploaded file.',
    draft: false,
    prerelease: false,
  };

  try {
    const releaseResponse = await axios.post(
      `${GITHUB_API_URL}/repos/${OWNER}/${REPO}/releases`,
      releaseData,
      {
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`,
          Accept: 'application/vnd.github.v3+json',
        },
      }
    );

    const uploadUrl = releaseResponse.data.upload_url.split('{?name,label}')[0];
    return uploadUrl;
  } catch (error) {
    throw new Error('Error creating GitHub release: ' + error.message);
  }
}

// Function to upload file to the release
async function uploadFileToRelease(uploadUrl, fileBuffer, fileName) {
  try {
    const uploadResponse = await axios.post(
      `${uploadUrl}?name=${fileName}`,
      fileBuffer,
      {
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`,
          Accept: 'application/vnd.github.v3+json',
          'Content-Type': 'application/octet-stream',
        },
      }
    );

    return uploadResponse.data;
  } catch (error) {
    throw new Error('Error uploading file to GitHub: ' + error.message);
  }
}

// Handle file uploads (directly to GitHub)
app.post('/upload', (req, res) => {
  const form = new formidable.IncomingForm();
  form.keepExtensions = true;  // Keep file extensions
  form.uploadDir = path.join(__dirname, 'uploads'); // Don't actually need to use this for in-memory handling

  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(500).send('Error parsing form');
    }

    const file = files.file[0];
    const tagName = `v1.0.${Date.now()}`; // Create a unique tag name
    try {
      // Create release on GitHub
      const uploadUrl = await createRelease(tagName);
      
      // Upload file directly to the release (in memory)
      const result = await uploadFileToRelease(uploadUrl, file.file, file.name);

      // Return success response
      res.status(200).json({ message: 'File uploaded and release created!', result });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: error.message });
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
