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

  console.log("Connected:", socket.id, username);

  if (username) {
    users[username] = socket.id;
    io.emit("users", Object.keys(users));
  }

  // ✅ PRIVATE MESSAGE HANDLER
  socket.on("private_message", ({ to, message }) => {
    const from = username;
    const targetSocket = users[to];

    console.log("Private message:", { to, from, message });

    if (targetSocket) {
      io.to(targetSocket).emit("private_message", {
        from,
        message,
      });
    }
  });

  socket.on("disconnect", () => {
    if (username) {
      delete users[username];
      io.emit("users", Object.keys(users));
    }
  });
});

server.listen(3000, () => {
  console.log("Server running on port 3000");
});
