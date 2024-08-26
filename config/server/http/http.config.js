const { createServer } = require("http");
const { configureApp } = require("../express/express.config");
const { initializeSocket } = require("../socket/socket.config");

const app = configureApp();

//http server for express and socket.io
const httpServer = createServer(app);

// Initialize Socket.IO with the HTTP server
initializeSocket(httpServer);

// Export the HTTP server and Socket.IO instance
module.exports = { httpServer };
