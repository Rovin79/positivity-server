const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*" },
});

const users = {}; // username -> socket.id

io.on("connection", (socket) => {
  const username = socket.handshake.query.username;

  if (!username) return;

  users[username] = socket.id;
  console.log(`${username} connected`);

  io.emit("users", Object.keys(users));

  socket.on("private_message", ({ to, text }) => {
    const targetSocket = users[to];
    if (targetSocket) {
      io.to(targetSocket).emit("private_message", {
        from: username,
        text,
      });
    }
  });

  socket.on("disconnect", () => {
    delete users[username];
    io.emit("users", Object.keys(users));
    console.log(`${username} disconnected`);
  });
});

server.listen(3000, () =>
  console.log("✅ Server running on port 3000")
);
