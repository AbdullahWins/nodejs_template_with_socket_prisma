const fs = require("fs").promises;
const path = require("path");
const { URL } = require("url");

const handleFileDelete = async (fileUrl) => {
  try {
    // Parse the URL to extract the filename
    const parsedUrl = new URL(fileUrl);
    const filename = path.basename(parsedUrl.pathname);

    // Construct the file path
    const filePath = path.join(__dirname, "../../../uploads", filename);

    // Check if the file exists
    await fs.access(filePath, fs.constants.F_OK);

    // Delete the file
    await fs.unlink(filePath);

    console.log(`File deleted: ${filePath}`);
    return true; // Indicate successful deletion
  } catch (error) {
    console.error(`Error deleting file: ${error}`);
    return false; // Indicate failure to delete
  }
};

module.exports = { handleFileDelete };
