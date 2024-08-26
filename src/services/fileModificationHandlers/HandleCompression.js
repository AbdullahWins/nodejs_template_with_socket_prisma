const sharp = require("sharp");
const fs = require("fs").promises;
const path = require("path");
const { CustomError } = require("../responseHandlers/HandleResponse");

// Initial quality setting for image compression (1-100)
const quality = 60;
// Target file size in bytes for compression (in KB)
const targetFileSize = 150 * 1024;
// File size threshold to trigger compression (in KB)
const compressionTriggerSize = 200 * 1024;

// Adjust the compression options based on the desired output file size
function adjustCompressionOptions(fileSize, quality, targetFileSize) {
  const compressionRatio = fileSize / targetFileSize;
  return {
    quality: Math.max(1, Math.min(100, Math.floor(quality / compressionRatio))),
  };
}

// Compress the image file based on the specified compression options
async function compressImage(inputFilePath) {
  try {
    // Determine the output format based on the file extension of the input file
    const outputFormat = path.extname(inputFilePath).slice(1);

    // Get the file stats to determine the file size
    const stats = await fs.stat(inputFilePath);
    const fileSize = stats.size;

    // Check if the file size is larger than the compression trigger size
    if (fileSize > compressionTriggerSize) {
      // Read the uncompressed image data
      const uncompressedData = await fs.readFile(inputFilePath);

      // Compress the image data with initial compression options
      let compressionOptions = { quality: quality };
      let compressedData = await sharp(uncompressedData)
        .toFormat(outputFormat, compressionOptions)
        .toBuffer();

      // Get the size of the compressed data
      const compressedFileSize = compressedData.length;

      // Check if the compressed file size exceeds the target size
      if (compressedFileSize > targetFileSize) {
        // Adjust the compression options based on the compressed file size
        compressionOptions = adjustCompressionOptions(
          compressedFileSize,
          quality,
          targetFileSize
        );

        // Re-compress the image data with adjusted compression options
        compressedData = await sharp(uncompressedData)
          .toFormat(outputFormat, compressionOptions)
          .toBuffer();
      }

      // Verify if the compression is successful and compressed data is available
      if (!compressedData || compressedData.length === 0) {
        throw new CustomError(500, "Error compressing image");
      }

      // Overwrite the original file with the compressed data
      await fs.writeFile(inputFilePath, compressedData);
    }

    // Return the input file path
    return inputFilePath;
  } catch (error) {
    throw new CustomError(500, "Error compressing image");
  }
}

module.exports = { compressImage };
