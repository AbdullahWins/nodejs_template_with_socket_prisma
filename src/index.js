// Imports
const path = require("path");
const dotenv = require("dotenv");
// Load environment variables from .env file before other imports
dotenv.config({ path: path.join(process.cwd(), ".env") });
// Imports
const { kickstartServer } = require("../config/server/kickstart.config.js");

// Start the server
kickstartServer();
