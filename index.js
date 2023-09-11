const mysql = require("mysql2/promise");
const qr = require("qrcode");
const fs = require("fs/promises");

// Create a MySQL connection pool
const dbConnection = mysql.createConnection({
    host: "db-mysql-nyc1-44248-do-user-14618823-0.b.db.ondigitalocean.com",
    port: "25060",
    user: "doadmin",
    password: "123.123.",
    database: "qr",
    ssl: true,
  });

async function fetchDataFromDatabase() {
  try {
    // Get a connection from the pool
    const connection = await pool.getConnection();

    // Query your database to retrieve the data you need
    const [rows, fields] = await connection.query("SELECT * FROM qr_code");

    // Release the connection back to the pool
    connection.release();

    // Return the data
    return rows;
  } catch (error) {
    console.error("Error fetching data from the database:", error);
    throw error;
  }
}

async function insertDataIntoDatabase(data) {
  try {
    // Get a connection from the pool
    const connection = await pool.getConnection();

    // Read the image file as a buffer
    const imageBuffer = await fs.readFile("qrcodes/qr_1.png"); // Change the path to your image

    // SQL query to insert data into the qr_code table, including the image
    const query =
      "INSERT INTO qr_code (id, name, tank, description, qr_code_url, image) VALUES (?, ?, ?, ?, ?, ?)";

    // Execute the query with the provided data
    const [result] = await connection.query(query, [
      data.id,
      data.name,
      data.tank,
      data.description,
      data.qr_code_url,
      imageBuffer, // Add the image buffer to the data object
    ]);

    // Release the connection back to the pool
    connection.release();

    // Return the result
    return result;
  } catch (error) {
    console.error("Error inserting data into the database:", error);
    throw error;
  }
}

async function generateQRCode(description, filename) {
  try {
    // Generate the QR code with the description text
    const qrCode = await qr.toFile(`qrcodes/${filename}`, description);

    console.log("QR code generated successfully!");
  } catch (error) {
    console.error("Error generating QR code:", error);
    throw error;
  }
}

async function main() {
  try {
    // Example data to insert into the qr_code table, including the URL
    const dataToInsert = {
      id: 1,
      name: "QR Code 1",
      tank: "Tank A",
      description: "Description for QR Code 1",
      qr_code_url: "http://localhost:3000/qr_code_1.png", // Use your port number
    };

    // Call the function to insert data into the database
    const insertionResult = await insertDataIntoDatabase(dataToInsert);

    console.log("Data inserted successfully:", insertionResult);

    // Fetch data from the database after insertion
    const databaseData = await fetchDataFromDatabase();
    console.log("Data retrieved from the database:", databaseData);

    // Generate QR codes for descriptions
    for (const row of databaseData) {
      await generateQRCode(row.description, `qr_${row.id}.png`);
    }

    // Optionally, you can display or serve the generated QR codes here
  } catch (error) {
    console.error("An error occurred:", error);
  } finally {
    // Close the MySQL connection pool when done
    pool.end();
  }
}

main();
