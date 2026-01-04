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
  console.log("User connected:", socket.id);

  socket.on("join", (username) => {
    onlineUsers[socket.id] = username;
    console.log("User joined:", username);

    io.emit("users", Object.values(onlineUsers));
  });

  socket.on("private_message", (data) => {
    socket.broadcast.emit("private_message", {
      from: onlineUsers[socket.id],
      message: data.message,
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
