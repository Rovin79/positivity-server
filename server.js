const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

let connectedUsers = {}; // socketId -> username

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("set_username", (username) => {
    connectedUsers[socket.id] = username;
    io.emit("users", Object.entries(connectedUsers).map(([id, name]) => ({ id, name })));
  });

  socket.on("send_message", (data) => {
    // data: { to, fromId, fromName, message }
    io.to(data.to).emit("receive_message", data);
  });

  socket.on("disconnect", () => {
    delete connectedUsers[socket.id];
    io.emit("users", Object.entries(connectedUsers).map(([id, name]) => ({ id, name })));
  });
});

server.listen(3000, () => {
  console.log("Server running on port 3000");
});
