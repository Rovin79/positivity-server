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

  socket.on("disconnect", () => {
    delete onlineUsers[socket.id];
    io.emit("users", Object.values(onlineUsers));
  });
});

server.listen(3000, () => {
  console.log("Server running on port 3000");
});
