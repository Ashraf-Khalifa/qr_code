const mysql = require("mysql");
const qr = require("qrcode");
const fs = require("fs/promises");
const path = require("path"); // Add this line

// Create a MySQL connection
const dbConnection = mysql.createConnection({
  host: "db-mysql-nyc1-44248-do-user-14618823-0.b.db.ondigitalocean.com",
  port: "25060",
  user: "doadmin",
  password: "123.123.",
  database: "qr",
  ssl: true,
});

// Directory paths for storing audio and video files
const audioDir = path.join(__dirname, "audio"); // Adjust the path as needed
const videoDir = path.join(__dirname, "video"); // Adjust the path as needed

// Create the directories if they don't exist
fs.mkdir(audioDir, { recursive: true });
fs.mkdir(videoDir, { recursive: true });

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

    

    // ...

// SQL query to insert data into the qr_code table, including the image, text, and image path
const query = `
INSERT INTO qr_code (id, logo, title, description, image, audio_path, video_path, qr_code_url)
VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`;

// Execute the query with the provided data
const result = await dbConnection.query(query, [
data.id,
data.logo, // Provide the logo value
data.title,
data.description,
data.image, // Provide the image buffer
data.audio_path, // Provide the audio path
data.video_path_, // Provide the video path
data.qr_code_url,
]);

// ...

    

    console.log("QR code and data inserted successfully:", result[0]);
  } catch (error) {
    console.error("An error occurred:", error);
    throw error;
  }
}

// Rest of the code remains the same...

async function main() {
  try {
    // Example data to insert into the qr_code table, including the URL and image path
    const dataToInsert = {
      id: 35,
      logo: "./qrcodes/RTM Logo Final Jan 2018.png",
      title: "Title 3",
      description: "Description for QR Code 3",
      imagePath: "./qrcodes/RTM Logo Final Jan 2018.png", // Replace with the actual image path
      image: "./qrcodes/RTM Logo Final Jan 2018.png",
      audio_path: "answering-machine-107318.mp3", // Add the audio file name
      video_path_: "production_id 5211959 (2160p).mp4", // Add the video file name
      qr_code_url: "http://localhost:3000/qr_code_1.png",
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
