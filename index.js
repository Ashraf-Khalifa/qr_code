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
const logoDir = path.join(__dirname, "logo");
const imageDir = path.join(__dirname, "image");


// Create the directories if they don't exist
fs.mkdir(audioDir, { recursive: true });
fs.mkdir(videoDir, { recursive: true });
fs.mkdir(logoDir, { recursive: true });
fs.mkdir(imageDir, { recursive: true });


async function generateQRCodeWithImageAndText(data) {
  try {
    // Check if the image file exists by attempting to read it
    await fs.readFile(data.imagePath);

    // Generate the QR code with the description text
const qrCodeText = data.description;
const qrCodeImageName = `qr_${data.id}.png`;
await qr.toFile(`qrcodes/${qrCodeImageName}`, qrCodeText);

// Use path.join to get absolute paths
const logoAbsolutePath = path.join(__dirname, data.logo);
const imageAbsolutePath = path.join(__dirname, data.image);
const audioAbsolutePath = path.join(__dirname, data.audio_path);
const videoAbsolutePath = path.join(__dirname, data.video_path);

// SQL query to insert data into the qr_code table, including the absolute image, audio, and video paths
const query = `
INSERT INTO qr_code (id, logo, title, description, image, audio_path, video_path, qr_code_url)
VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`;

// Execute the query with the provided data
const result = await dbConnection.query(query, [
  data.id,
  data.logo,
  data.title,
  data.description,
  data.image, // Use relative path
  data.audio_path, // Use relative path
  data.video_path, // Use relative path
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
      id: 3,
      logo: "./logo/RTM Logo Final Jan 2018.png",
      title: "Title 11",
      description: "A tank is a large, armored military vehicle designed for land warfare. It is characterized by its heavy armor, powerful weaponry, and caterpillar tracks, which allow it to move across various terrains. Tanks play a crucial role on the battlefield, providing both offensive and defensive capabilities. They are equipped with cannons, machine guns, and sometimes missile systems, making them formidable adversaries. Tanks have been a symbol of modern mechanized warfare and have evolved significantly since their inception during the early 20th century, continuing to be a key asset in the arsenal of armed forces worldwide.",
      imagePath: "./image/Untitled.png", // Replace with the actual image path
      image: "./image/Untitled.png",
      audio_path: "./audio/answering-machine-107318.mp3", // Use absolute URL
      video_path: "./video/production_id 5211959 (2160p).mp4", // Use absolute URL
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
