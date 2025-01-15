const express = require('express');
const { exec } = require('child_process');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const axios = require('axios'); // Add axios for HTTP requests
const app = express();
const port = 3000;

// Set up file upload storage (temporary local storage for upload to file.io)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Temporary storage for uploads
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // Add timestamp for uniqueness
  }
});

const upload = multer({ storage: storage });

// Middleware to parse form data
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Serve the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

// Helper function to upload files to file.io
async function uploadToFileIO(filePath) {
  const fileData = fs.readFileSync(filePath); // Read file data
  const formData = new FormData();
  formData.append('file', fileData, path.basename(filePath));

  try {
    const response = await axios.post('https://file.io', formData, {
      headers: formData.getHeaders(),
    });
    return response.data.link; // Return the file.io link
  } catch (error) {
    throw new Error('Error uploading to file.io: ' + error.message);
  }
}

// Handle the file upload and zsign execution
app.post('/upload', upload.fields([
  { name: 'ipaFile', maxCount: 1 },
  { name: 'p12File', maxCount: 1 },
  { name: 'mobileprovisionFile', maxCount: 1 }
]), async (req, res) => {
  if (!req.files.ipaFile || !req.files.p12File || !req.files.mobileprovisionFile) {
    return res.status(400).send('Please upload all required files: IPA, .p12, and .mobileprovision');
  }

  const ipaFilePath = req.files.ipaFile[0].path;
  const p12FilePath = req.files.p12File[0].path;
  const mobileprovisionFilePath = req.files.mobileprovisionFile[0].path;
  const p12Password = req.body.p12Password; // Password for the .p12 file

  const signedFile = path.join('uploads', Date.now() + '_signed.ipa'); // Output file path

  // Construct zsign command with user options
  let command = `zsign -in "${ipaFilePath}" -out "${signedFile}" -k "${p12FilePath}" -p "${p12Password}" -m "${mobileprovisionFilePath}"`;

  // Optional arguments
  if (req.body.force) command += ' -f';

  // Execute the zsign command
  exec(command, async (error, stdout, stderr) => {
    if (error) {
      return res.send(`Error: ${error.message}`);
    }
    if (stderr) {
      return res.send(`stderr: ${stderr}`);
    }

    try {
      // Upload signed IPA to file.io
      const downloadLink = await uploadToFileIO(signedFile);
      res.send(`
        <h2>IPA Signed Successfully!</h2>
        <p>Click below to download the signed IPA:</p>
        <a href="${downloadLink}" target="_blank">Download Signed IPA</a>
      `);
    } catch (uploadError) {
      res.send(`Error uploading signed IPA to file.io: ${uploadError.message}`);
    }
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
