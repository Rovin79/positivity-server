const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

const onlineUsers = {}; // socket.id -> username

io.on("connection", (socket) => {
  const username = socket.handshake.query.username;

  if (!username) {
    console.log("Connection rejected: no username");
    return;
  }

  onlineUsers[socket.id] = username;
  console.log("User joined:", username);

  // 🔁 broadcast users
  io.emit("users", Object.values(onlineUsers));

  // 🌍 Global message
  socket.on("global_message", (text) => {
    io.emit("global_message", {
      user: username,
      text,
    });
  });

  // 💬 Private message
  socket.on("private_message", ({ to, message }) => {
    const targetSocketId = Object.keys(onlineUsers).find(
      (id) => onlineUsers[id] === to
    );

    if (targetSocketId) {
      io.to(targetSocketId).emit("private_message", {
        from: username,
        message,
      });
    }
  });

  socket.on("disconnect", () => {
    console.log("User left:", username);
    delete onlineUsers[socket.id];
    io.emit("users", Object.values(onlineUsers));
  });
});

server.listen(3000, () => {
  console.log("Server running on port 3000");
});
