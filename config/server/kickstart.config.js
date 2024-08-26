const { logger } = require("../../src/services/logHandlers/HandleWinston");
const connectToDatabase = require("../databases/mongoose.config");
const { httpServer } = require("./http/http.config");
const port = process.env.SERVER_PORT || 5000;

//starting the server
async function kickstartServer() {
  try {
    // Connect to MongoDB using Mongoose
    await connectToDatabase();

    // Start the http server
    httpServer.listen(port, () => {
      logger.log("info", `Server is running on port: ${port}`);
    });
  } catch (error) {
    // Log the error and exit the process
    logger.log("error", "Error starting the server: ", error);
    // Gracefully exit the process
    process.exit(1);
  }
}

module.exports = { kickstartServer };
