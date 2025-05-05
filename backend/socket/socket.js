const { Server } = require("socket.io");

const setupSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL, // Client-side URL
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("Socket connected: ", socket.id);

    socket.on("message", (data) => {
      console.log(data);
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log("Socket disconnected: ", socket.id);
    });
  });

  return io;
};

module.exports = setupSocket;
