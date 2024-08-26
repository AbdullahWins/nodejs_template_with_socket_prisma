const { Server } = require("socket.io");
const { allowedOrigins } = require("../../cors/cors.config");
const {
  handleIndividualMessage,
} = require("../../../src/chats/IndividualChatModule");
const { handleGroupMessage } = require("../../../src/chats/GroupChatModule");
const { setIoInstance } = require("./socket");

let io;

const initializeSocket = (server) => {
  // Initialize Socket.IO with the HTTP server
  io = new Server(server, {
    cors: {
      origin: allowedOrigins,
      methods: ["GET", "POST"],
    },
  });

  // Set up Socket.IO event handlers here if needed
  io.on("connection", (socket) => {
    // Get the user id from the query
    const { userId } = socket.handshake.query;
    console.log("A user connected with User ID:", userId);
    socket.join(userId);

    // Disconnect user
    socket.on("disconnect", () => {
      console.log("User disconnected with User ID:", userId);
    });

    // Socket events
    socket.on("individual", (data) => handleIndividualMessage(io, data));
    socket.on("group", (data) => handleGroupMessage(io, data));
  });

  setIoInstance(io);

  return io;
};

module.exports = { initializeSocket };
