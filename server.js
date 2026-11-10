const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");
const { Server } = require("socket.io");

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = parseInt(process.env.PORT || "3000", 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error("Error occurred handling", req.url, err);
      res.statusCode = 500;
      res.end("internal server error");
    }
  });

  // Attach Socket.IO
  const io = new Server(server, {
    path: "/api/socket/io",
    addTrailingSlash: false,
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  // Attach to global for API route handlers to emit events
  global.io = io;

  io.on("connection", (socket) => {
    // Join match room
    socket.on("join-match", (matchId) => {
      socket.join(`match:${matchId}`);
    });

    socket.on("leave-match", (matchId) => {
      socket.leave(`match:${matchId}`);
    });

    // Join tournament room
    socket.on("join-tournament", (tournamentId) => {
      socket.join(`tournament:${tournamentId}`);
    });

    socket.on("disconnect", () => {
      // Disconnected
    });
  });

  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`> CricScore Server Ready on http://${hostname}:${port}`);
    console.log(`> Socket.IO attached on path /api/socket/io`);
  });
});

