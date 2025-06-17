"use strict";
"use client";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = SocketTest;
const react_1 = require("react");
const socket_1 = require("@/socket");
function SocketTest() {
    const [pongMsg, setPongMsg] = (0, react_1.useState)("");
    (0, react_1.useEffect)(() => {
        socket_1.socket.on("pong", (msg) => setPongMsg(msg));
        return () => {
            socket_1.socket.off("pong");
        };
    }, []);
    return (<div>
      <button onClick={() => {
            socket_1.socket.emit("ping", "hello from client");
        }} className="p-2 bg-blue-500 text-white rounded">
        Send Ping
      </button>
      <div>Server response: {pongMsg}</div>
    </div>);
}
