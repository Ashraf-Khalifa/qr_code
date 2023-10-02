const express = require('express');
const multer = require('multer');
const mysql = require('mysql');
const path = require('path');
const ejs = require('ejs');

const app = express();
const port = process.env.PORT || 3001;

// Serve static audio and video files
app.use('/audio', express.static(path.join(__dirname, 'audio')));
app.use('/video', express.static(path.join(__dirname, 'video')));
app.use('/logo', express.static(path.join(__dirname, 'logo')));
app.use('/image', express.static(path.join(__dirname, 'image')));


// Create a database connection
const dbConnection = mysql.createConnection({
  host: "db-mysql-nyc1-44248-do-user-14618823-0.b.db.ondigitalocean.com",
  port: "25060",
  user: "doadmin",
  password: "123.123.",
  database: "qr",
  ssl: true,
});

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}${ext}`);
  },
});

const upload = multer({ storage });

// Set up views
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Define routes

// Route for uploading video and audio files
app.post('/upload', upload.fields([{ name: 'video' }, { name: 'audio' }]), (req, res) => {
  // Process the uploaded files and insert data into the database
  const { logo, title, description, image, qr_code_url } = req.body;
  const videoPath = req.files['video'][0].filename;
  const audioPath = req.files['audio'][0].filename;

  // Insert data into the database
  const sql = 'INSERT INTO qr_code (logo, title, description, image, audio_path, video_path, qr_code_url) VALUES (?, ?, ?, ?, ?, ?, ?)';
  const values = [logo, title, description, image, audioPath, videoPath, qr_code_url];

  dbConnection.query(sql, values, (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error uploading data to the database.');
    } else {
      res.redirect('/');
    }
  });
});

// ...

// Route for displaying uploaded data
app.get('/', (req, res) => {
    // Fetch data from the database
    const sql = 'SELECT * FROM qr_code';
    dbConnection.query(sql, (err, results) => {
      if (err) {
        console.error(err);
        res.status(500).send('Error fetching data from the database.');
      } else {
        // Create an HTML string using JavaScript template literals
        let html = `
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Uploaded Data</title>
            <style>
              /* Center content vertically and horizontally */
              body {
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 100vh;
                margin: 0;
              }
              .content {
                text-align: center;
              }
            </style>
          </head>
          <body>
            <div class="content">
              <h1>Digital passport</h1>
              <ul>
        `;
  
        // Loop through the results and append data to the HTML string
        for (const qrCode of results) {
            html += `
              <li>
              <img src="${qrCode.logo}" alt="Logo Image"><br>
                <h2>${qrCode.title}</h2><br>
                <p style="padding-left: 400px; padding-right: 400px;">${qrCode.description}</p><br>
                <img src="${qrCode.image}" alt="QR Code Image"><br>
                <video controls width="300" height="200">
                  <source src="${qrCode.video_path}" type="video/mp4">
                  Your browser does not support the video tag.
                </video><br>
                <audio controls>
                  <source src="${qrCode.audio_path}" type="audio/mpeg">
                  Your browser does not support the audio element.
                </audio><br>
              </li>
            `;
          }
        // Close the HTML string
        html += `
              </ul>
            </div>
          </body>
          </html>
        `;
  
        // Send the generated HTML as the response
        res.send(html);
      }
    });
  });
  
  // ...
  

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
