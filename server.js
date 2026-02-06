const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*" },
});

const onlineUsers = {}; // socket.id -> username

io.on("connection", (socket) => {
  const username = socket.handshake.query.username;

  console.log("Socket connected:", socket.id, username);

  if (username) {
    onlineUsers[socket.id] = username;
    io.emit("users", Object.values(onlineUsers));
  }

  // ✅ PRIVATE MESSAGE HANDLER
  socket.on("private_message", ({ to, from, message }) => {
    console.log("Private message:", { to, from, message });

    const targetSocketId = Object.keys(onlineUsers).find(
      (id) => onlineUsers[id] === to
    );

    if (targetSocketId) {
      io.to(targetSocketId).emit("private_message", {
        from,
        message,
      });
    }
  });

  // ✅ GLOBAL MESSAGE (optional)
  socket.on("global_message", ({ from, text }) => {
    io.emit("global_message", { user: from, text });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", onlineUsers[socket.id]);
    delete onlineUsers[socket.id];
    io.emit("users", Object.values(onlineUsers));
  });
});

server.listen(3000, () => {
  console.log("Server running on port 3000");
});
