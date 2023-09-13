require("dotenv").config(); // Load environment variables from .env file
const express = require("express");
const mysql = require("mysql");

const app = express();
const port = process.env.PORT || 3000; // Use the PORT environment variable or default to 3000

// Create a MySQL connection
const dbConnection = mysql.createConnection({
  host: "db-mysql-nyc1-44248-do-user-14618823-0.b.db.ondigitalocean.com",
  port: "25060",
  user: "doadmin",
  password: "123.123.",
  database: "qr",
  ssl: true,
});

// Connect to the database
dbConnection.connect((err) => {
  if (err) {
    console.error("Error connecting to the database:", err);
    process.exit(1);
  }
  console.log("Connected to the database");
});

// Define a route to fetch data from the database and display only id, qr_code_url, and image columns
app.get("/qr_code", (req, res) => {
  // Query the database to retrieve id, qr_code_url, and image columns from the qr_code table
  dbConnection.query(
    "SELECT id, qr_code_url FROM qr_code",
    (error, results) => {
      if (error) {
        console.error("Error fetching data from the database:", error);
        res
          .status(500)
          .json({ error: "An error occurred while fetching data" });
        return;
      }

      // Render an HTML page to display the id, qr_code_url, and image columns
      const html = `
      <html>
      <head>
        <title>qr_code Table</title>
      </head>
      <body>
        <h1>qr_code Table</h1>
        <table>
          <tr>
            <th>ID</th>
            <th>qr_code_url</th>
            <th>Image</th>
          </tr>
          ${results
            .map(
              (row) => `
            <tr>
              <td>${row.id}</td>
              <td><a href="/qr_code_url/${encodeURIComponent(
                row.qr_code_url
              )}">${row.qr_code_url}</a></td>
              <td><img src="/image/${row.id}" alt="Image for ID ${
                row.id
              }" width="100"></td>
            </tr>
          `
            )
            .join("")}
        </table>
      </body>
      </html>
    `;

      res.status(200).send(html); // Add .status(200) here
    }
  );
});

// Define a route to fetch and display the description and qr_code_image for a specific qr_code_url
// Define a route to fetch and display the description and qr_code_image for a specific qr_code_url
app.get("/qr_code_url/:qr_code_url", (req, res) => {
  const { qr_code_url } = req.params;

  // Query the database to retrieve the description and qr_code_image for the specified qr_code_url
  dbConnection.query(
    "SELECT description, qr_code_image FROM qr_code WHERE qr_code_url = ?",
    [qr_code_url],
    (error, results) => {
      if (error) {
        console.error("Error fetching data from the database:", error);
        res
          .status(500)
          .json({ error: "An error occurred while fetching data" });
        return;
      }

      if (results.length === 0) {
        // If no matching QR code URL is found, return a 404 response
        res.status(404).json({ error: "QR code URL not found" });
      } else {
        // Get the description and qr_code_image data from the results
        const description = results[0].description;
        const qrCodeImagePath = results[0].qr_code_image; // Get the image path from the database

        // Read the image file as a buffer
        fs.readFile(qrCodeImagePath, (imageError, imageBuffer) => {
          if (imageError) {
            console.error("Error reading image file:", imageError);
            res
              .status(500)
              .json({ error: "An error occurred while reading image data" });
          } else {
            // Set the appropriate content type for the image
            res.setHeader("Content-Type", "image/jpeg"); // Change the content type as needed

            // Render an HTML page to display the description and qr_code_image
            const html = `
              <html>
              <head>
                <title>QR Code Description</title>
              </head>
              <body>
                <h1>QR Code Description</h1>
                <p>${description}</p>
                <img src="data:image/jpeg;base64,${imageBuffer.toString('base64')}" alt="QR Code Image">
              </body>
              </html>
            `;

            res.status(200).send(html); // Add .status(200) here
          }
        });
      }
    }
  );
});


// Define a route to display images
app.get("/image/:id", (req, res) => {
  const { id } = req.params;

  // Query the database to retrieve the image data for the specified ID
  dbConnection.query(
    "SELECT image FROM qr_code WHERE id = ?",
    [id],
    (error, results) => {
      if (error) {
        console.error("Error fetching image data from the database:", error);
        res
          .status(500)
          .json({ error: "An error occurred while fetching image data" });
        return;
      }

      if (results.length === 0 || !results[0].image) {
        // If no image data is found, return a 404 response
        res.status(404).json({ error: "Image not found" });
      } else {
        // Send the image data as a response with the appropriate content type
        res.setHeader("Content-Type", "image/jpeg"); // Change the content type as needed
        res.status(200).send(results[0].image); // Add .status(200) here
      }
    }
  );
});

// Start the server
app.listen(port, () => {
  console.log(`Server is listening at http://localhost:${port}`);
});
