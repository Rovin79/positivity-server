io.on("connection", (socket) => {
  const username = socket.handshake.query.username;

  if (!username) return;

  onlineUsers[socket.id] = username;
  console.log("User joined:", username);

  io.emit("users", Object.values(onlineUsers));

  // 🔐 PRIVATE MESSAGE
  socket.on("private_message", ({ to, text }) => {
    const from = onlineUsers[socket.id];
    if (!from) return;

    const targetSocketId = Object.keys(onlineUsers).find(
      (id) => onlineUsers[id] === to
    );

    if (targetSocketId) {
      io.to(targetSocketId).emit("private_message", {
        from,
        text,
      });
    }
  });

  socket.on("disconnect", () => {
    delete onlineUsers[socket.id];
    io.emit("users", Object.values(onlineUsers));
  });
});
