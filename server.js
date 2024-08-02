const express = require("express");
const next = require("next");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

const PORT = process.env.PORT || 3001;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:3000";

const allowedOrigins = [process.env.NEXT_PUBLIC_CLIENT_URL];

app.prepare().then(() => {
  const server = express();
  server.use(
    cors({
      origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps, curl requests)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
          const msg =
            "The CORS policy for this site does not allow access from the specified Origin.";
          return callback(new Error(msg), false);
        }
        return callback(null, true);
      },
      credentials: true,
    })
  );

  const httpServer = http.createServer(server);
  const io = socketIo(httpServer, {
    cors: {
      origin: process.env.NEXT_PUBLIC_CLIENT_URL,
      methods: ["GET", "POST"],
      credentials: true,
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

  httpServer.listen(PORT, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${PORT}`);
  });
});
