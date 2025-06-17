"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerGameHandlers = registerGameHandlers;
function registerGameHandlers(io, socket) {
    // Handle join game event with proper typing
    socket.on("joinGame", (roomId, player) => {
        console.log("Player joining game:", player.name, "Room:", roomId);
        socket.join(roomId);
        socket.emit("playerJoined", [player]); // Send initial player list
    });
    // Add a ping-pong test event
    socket.on("ping", (msg) => {
        socket.emit("pong", "pong: " + msg);
    });
    // Add more event handlers as needed
    // socket.on("startGame", ...);
    // socket.on("drawCard", ...);
}
