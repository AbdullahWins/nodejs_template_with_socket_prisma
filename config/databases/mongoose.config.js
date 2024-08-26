const mongoose = require("mongoose");
const { logger } = require("../../src/services/logHandlers/HandleWinston");

const connectToDatabase = async () => {
  const uri = `${process.env.MONGOOSE_URI}/${process.env.DATABASE_NAME}`;

  try {
    await mongoose.connect(uri, {
      // Specify the write concern mode
      writeConcern: { w: "majority" },
    });
    logger.log("info", "Connected to MongoDB using Mongoose!");
  } catch (error) {
    logger.log(
      "error",
      `Error connecting to MongoDB using Mongoose:
    ${error?.message}`
    );
    process.exit(1);
  }
};

module.exports = connectToDatabase;
