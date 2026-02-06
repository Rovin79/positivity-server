const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*" },
});

// username -> socket.id
const users = {};

io.on("connection", (socket) => {
  const username = socket.handshake.query.username;

  console.log("Socket connected:", socket.id, username);

  if (username) {
    users[username] = socket.id;
    io.emit("users", Object.keys(users));
  }

  // 🔐 PRIVATE MESSAGE HANDLER
  socket.on("private_message", ({ to, from, message }) => {
    console.log("Private message:", { to, from, message });

    const targetSocketId = users[to];
    if (targetSocketId) {
      io.to(targetSocketId).emit("private_message", {
        from,
        message,
      });
    }
  });

  socket.on("disconnect", () => {
    for (const user in users) {
      if (users[user] === socket.id) {
        delete users[user];
        break;
      }
    }
    io.emit("users", Object.keys(users));
    console.log("Socket disconnected:", socket.id);
  });
});

server.listen(3000, () => {
  console.log("Server running on port 3000");
});
