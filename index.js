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

async function generateQRCodeWithImageAndText(data) {
  try {
    // Check if the image file exists by attempting to read it
    await fs.readFile(data.imagePath);

    // Generate the QR code with the description text
    const qrCodeText = data.description;
    const qrCodeImageName = `qr_${data.id}.png`;
    await qr.toFile(`qrcodes/${qrCodeImageName}`, qrCodeText);

    // Read the image file as a buffer
    const imageBuffer = await fs.readFile(data.imagePath);

    // SQL query to insert data into the qr_code table, including the image, text, and image path
    const query =
      "INSERT INTO qr_code (id, name, tank, description, qr_code_url, image, qr_code_image) VALUES (?, ?, ?, ?, ?, ?, ?)";

    // Execute the query with the provided data
    const result = await dbConnection.query(query, [
      data.id,
      data.name,
      data.tank,
      data.description,
      data.qr_code_url,
      imageBuffer, // Add the image buffer to the data object
      data.imagePath, // Add the image path to the data object
      data.qr_code_image, // Add qr_code_image to the data object
    ]);

    console.log("QR code and data inserted successfully:", result[0]);
  } catch (error) {
    console.error("An error occurred:", error);
    throw error;
  }
}

async function main() {
  try {
    // Example data to insert into the qr_code table, including the URL and image path
    const dataToInsert = {
      id: 24,
      name: "QR Code 7",
      tank: "Tank 6",
      description: "Description for QR Code 6",
      qr_code_url: "http://localhost:3000/qr_code_6.png",
      imagePath: "./qrcodes/IMG_6182-fotor-2023070321565.jpg", // Replace with the actual image path
      qr_code_image: "./qrcodes/qr_code_with_url.png", // Add the image path to qr_code_image
    };

    // Call the function to generate QR code with image and text and insert data into the database
    await generateQRCodeWithImageAndText(dataToInsert);
  } catch (error) {
    console.error("An error occurred:", error);
  } finally {
    dbConnection.end(); // Close the MySQL connection when done
  }
}

main();
