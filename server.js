const express = require("express");
const mysql = require("mysql2/promise");

const app = express();
const port = 3000;

// Create a MySQL connection pool
const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "qr",
});

// Define a route to fetch data from the database and display only id, qr_code_url, and image columns
app.get("/qr_code", async (req, res) => {
  try {
    // Get a connection from the pool
    const connection = await pool.getConnection();

    // Query the database to retrieve id, qr_code_url, and image columns from the qr_code table
    const [rows] = await connection.query(
      "SELECT id, qr_code_url FROM qr_code"
    );

    // Release the connection back to the pool
    connection.release();

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
          ${rows
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

    res.send(html);
  } catch (error) {
    console.error("Error fetching data from the database:", error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

// Define a route to fetch and display the description for a specific qr_code_url
app.get("/qr_code_url/:qr_code_url", async (req, res) => {
  try {
    const { qr_code_url } = req.params;

    // Get a connection from the pool
    const connection = await pool.getConnection();

    // Query the database to retrieve the description for the specified qr_code_url
    const [rows] = await connection.query(
      "SELECT description FROM qr_code WHERE qr_code_url = ?",
      [qr_code_url]
    );

    // Release the connection back to the pool
    connection.release();

    if (rows.length === 0) {
      // If no matching QR code URL is found, return a 404 response
      res.status(404).json({ error: "QR code URL not found" });
    } else {
      // Render an HTML page to display the description
      const html = `
        <html>
        <head>
          <title>QR Code Description</title>
        </head>
        <body>
          <h1>QR Code Description</h1>
          <p>${rows[0].description}</p>
        </body>
        </html>
      `;

      res.send(html);
    }
  } catch (error) {
    console.error("Error fetching data from the database:", error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

// Define a route to display images
app.get("/image/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Get a connection from the pool
    const connection = await pool.getConnection();

    // Query the database to retrieve the image data for the specified ID
    const [rows] = await connection.query(
      "SELECT image FROM qr_code WHERE id = ?",
      [id]
    );

    // Release the connection back to the pool
    connection.release();

    if (rows.length === 0 || !rows[0].image) {
      // If no image data is found, return a 404 response
      res.status(404).json({ error: "Image not found" });
    } else {
      // Send the image data as a response with the appropriate content type
      res.setHeader("Content-Type", "image/jpeg"); // Change the content type as needed
      res.send(rows[0].image);
    }
  } catch (error) {
    console.error("Error fetching image data from the database:", error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching image data" });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is listening at http://localhost:${port}`);
});
