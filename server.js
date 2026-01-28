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

  if (username) {
    onlineUsers[socket.id] = username;
    console.log("User joined:", username);
    io.emit("users", Object.values(onlineUsers));
  }

  socket.on("global_message", (data) => {
    const from = onlineUsers[socket.id];
    if (!from) return;

    io.emit("global_message", {
      user: from,
      text: data.text,
    });
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
