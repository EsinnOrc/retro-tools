const express = require("express");
const next = require("next");
const http = require("http");
const socketIo = require("socket.io");

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = express();
  const httpServer = http.createServer(server);
  const io = socketIo(httpServer, {
    cors: {
      origin: "http://localhost:3001", // Next.js uygulamanızın çalıştığı port
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("a user connected");

    socket.on("disconnect", () => {
      console.log("user disconnected");
    });

    socket.on("sendMessage", (message) => {
      socket.broadcast.emit("receiveMessage", message);
    });

    socket.on("finalize", () => {
      io.emit("finalizeComments");
    });
  });

  server.all("*", (req, res) => {
    return handle(req, res);
  });

  httpServer.listen(3001, (err) => {
    if (err) throw err;
    console.log("> Ready on http://localhost:3001");
  });
});
