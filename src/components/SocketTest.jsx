"use client";
import { useEffect, useState } from "react";
import { socket } from "@/socket";
export default function SocketTest() {
    const [pongMsg, setPongMsg] = useState("");
    useEffect(() => {
        socket.on("pong", (msg) => setPongMsg(msg));
        return () => {
            socket.off("pong");
        };
    }, []);
    return (<div>
      <button onClick={() => {
            socket.emit("ping", "hello from client");
        }} className="p-2 bg-blue-500 text-white rounded">
        Send Ping
      </button>
      <div>Server response: {pongMsg}</div>
    </div>);
}
