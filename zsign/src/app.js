const express = require('express');
const { exec } = require('child_process');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const app = express();
const port = 3000;

// Set up file upload storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // Add a timestamp to avoid name collisions
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

// Handle the file upload and zsign execution
app.post('/upload', upload.fields([
  { name: 'ipaFile', maxCount: 1 },
  { name: 'p12File', maxCount: 1 },
  { name: 'mobileprovisionFile', maxCount: 1 }
]), (req, res) => {
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
  exec(command, (error, stdout, stderr) => {
    if (error) {
      return res.send(`Error: ${error.message}`);
    }
    if (stderr) {
      return res.send(`stderr: ${stderr}`);
    }

    // Provide download link for the signed IPA
    res.send(`
      <h2>IPA Signed Successfully!</h2>
      <p>Click below to download the signed IPA:</p>
      <a href="/download/${path.basename(signedFile)}" download>Download Signed IPA</a>
    `);
  });
});

// Serve signed IPA files
app.get('/download/:fileName', (req, res) => {
  const fileName = req.params.fileName;
  const filePath = path.join(__dirname, 'uploads', fileName);
  res.download(filePath);
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
