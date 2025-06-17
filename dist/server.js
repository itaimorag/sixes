"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
console.log("Starting server.ts...");
const http_1 = require("http");
const next_1 = __importDefault(require("next"));
const socket_io_1 = require("socket.io");
const gameSocketHandlers_js_1 = require("./src/server/gameSocketHandlers.js");
// import { yourGameLogic } from "./src/server/socket.js"; // If you want to keep game logic separate
const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;
const app = (0, next_1.default)({ dev, hostname, port });
const handler = app.getRequestHandler();
console.log("Before app.prepare()");
app.prepare().then(() => {
    console.log("After app.prepare()");
    const httpServer = (0, http_1.createServer)(handler);
    const io = new socket_io_1.Server(httpServer, {
        cors: {
            origin: "http://localhost:9002",
            methods: ["GET", "POST"],
        },
    });
    io.on("connection", (socket) => {
        (0, gameSocketHandlers_js_1.registerGameHandlers)(io, socket);
        // Add your socket event handlers here
        // Example:
        socket.on("hello", (msg) => {
            console.log("Received:", msg);
            socket.emit("hello", "world");
        });
        // You can import and use your game logic here
        // yourGameLogic(io, socket);
    });
    httpServer.listen(port, () => {
        console.log(`> Ready on http://${hostname}:${port}`);
    });
});
