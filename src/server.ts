import { createServer } from "http";
import { registerGameHandlers } from "./server/gameSocketHandlers";
import { Server } from "socket.io";
import type { Socket } from "socket.io";
import type { ClientToServerEvents, ServerToClientEvents } from "./lib/types";

const port = parseInt(process.env.PORT || "3001", 10);
const server = createServer();

console.log("Initializing socket.io server...");

const io = new Server(server, {
  cors: {
    origin: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["websocket", "polling"],
  pingTimeout: 60000,
  pingInterval: 25000,
});

type GameSocket = Socket<ClientToServerEvents, ServerToClientEvents>;
type GameServer = Server<ClientToServerEvents, ServerToClientEvents>;

io.on("connection", (socket: GameSocket) => {
  console.log("Socket.IO connection established:", socket.id);
  registerGameHandlers(io, socket);
});

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log("Socket.IO server is ready to accept connections");
});
