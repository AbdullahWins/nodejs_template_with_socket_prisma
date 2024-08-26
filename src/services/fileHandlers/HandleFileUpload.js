const fs = require("fs").promises; // Using the promises version of fs
const path = require("path");
const mime = require("mime-types");
const { UniqueNaam } = require("uniquenaam/uniquenaam");
const getServerBaseUrl = require("../urlHandlers/HandleBaseUrl");
const {
  compressImage,
} = require("../fileModificationHandlers/HandleCompression");
const { CustomError } = require("../responseHandlers/HandleResponse");

const handleFileUpload = async ({ req, files, folderName }) => {
  try {
    // Define the destination directory relative to the root directory
    const destinationDir = path.join(process.cwd(), "uploads", folderName);
    const baseUrl = getServerBaseUrl(req);

    // Create the destination directory if it doesn't exist
    await fs.mkdir(destinationDir, { recursive: true });

    const uploadedUrls = [];
    for (const file of files) {
      const uniqueFilename = UniqueNaam(file?.originalname);
      const source = file?.path;
      const destination = path.join(destinationDir, uniqueFilename);

      // Check if the uploaded file is an image
      const mimeType = mime.lookup(file.originalname);
      if (mimeType && mimeType.startsWith("image/")) {
        
        //compress only image files
        const compressedSource = await compressImage(source);

        // Ensure the source file exists before moving
        try {
          await fs.access(compressedSource, fs.constants.F_OK);
          await fs.rename(compressedSource, destination);

          // Construct the file URL
          const fileUrl = `${baseUrl}/uploads/${folderName}/${uniqueFilename}`;
          uploadedUrls.push(fileUrl);
        } catch (error) {
          console.error(`Error moving file: ${error}`);
        }
      } else {
        // If the file is not an image, directly move it to destination
        try {
          await fs.rename(source, destination);

          // Construct the file URL
          const fileUrl = `${baseUrl}/uploads/${folderName}/${uniqueFilename}`;
          uploadedUrls.push(fileUrl);
        } catch (error) {
          console.error(`Error moving file: ${error}`);
        }
      }
    }
    return uploadedUrls;
  } catch (error) {
    throw new CustomError(500, "Error uploading file");
  }
};

module.exports = { handleFileUpload };
