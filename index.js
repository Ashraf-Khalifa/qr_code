const mysql = require("mysql");
const qr = require("qrcode");
const fs = require("fs/promises");

// Create a MySQL connection
const dbConnection = mysql.createConnection({
  host: "db-mysql-nyc1-44248-do-user-14618823-0.b.db.ondigitalocean.com",
  port: "25060",
  user: "doadmin",
  password: "123.123.",
  database: "qr",
  ssl: true,
});

// const dbConnection = mysql.createConnection({
//   host: "localhost",
//   user: "root",
//   password: "",
//   database: "tanks",
// });

async function fetchDataForDisplay() {
  try {
    // Connect to the database
    await dbConnection.connect();

    // Query the database to retrieve id, qr_code_url, and qr_code_image columns
    const [rows, fields] = await dbConnection.query(
      "SELECT id, qr_code_url, qr_code_image FROM qr_code"
    );

    // Disconnect from the database
    dbConnection.end();

    // Return the data
    return rows;
  } catch (error) {
    console.error("Error fetching data from the database:", error);
    throw error;
  }
}


async function insertDataIntoDatabase(data) {
  try {
    // Connect to the database
    await dbConnection.connect();

    // Read the image file as a buffer
    const imageBuffer = await fs.readFile("qrcodes/qr_1.png"); // Change the path to your image

    // SQL query to insert data into the qr_code table, including the image
    const query =
      "INSERT INTO qr_code (id, name, tank, description, qr_code_url, image) VALUES (?, ?, ?, ?, ?, ?)";

    // Execute the query with the provided data
    const result = await dbConnection.query(query, [
      data.id,
      data.name,
      data.tank,
      data.description,
      data.qr_code_url,
      imageBuffer, // Add the image buffer to the data object
    ]);

    // Disconnect from the database
    dbConnection.end();

    // Return the result
    return result[0]; // Access the first element of the result array
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
  let connection; // Declare the connection variable outside the try-catch block

  try {
    // Example data to insert into the qr_code table, including the URL
    const dataToInsert = {
      id: 1,
      name: "QR Code 1",
      tank: "Tank A",
      description: "Description for QR Code 1",
      qr_code_url: "http://localhost:3000/qr_code_1.png",
    };

    // Call the function to insert data into the database
    const insertionResult = await insertDataIntoDatabase(dataToInsert);

    console.log("Data inserted successfully:", insertionResult);

    // Fetch data from the database after insertion
    connection = await dbConnection.getConnection(); // Get a new connection
    const databaseData = await fetchDataFromDatabase();
    console.log("Data retrieved from the database:", databaseData);
  } catch (error) {
    console.error("An error occurred:", error);
  } finally {
    if (connection) {
      connection.release(); // Release the connection to the pool
    }
  }
  
}

main();

