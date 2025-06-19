"use client";

import { useEffect, useState } from "react";
import { SocketProvider } from "@/lib/socketContext";
import GameSetup from "@/components/GameSetup";

export default function Home() {
  const [roomId, setRoomId] = useState("");

  useEffect(() => {
    // Generate a random room ID if one doesn't exist
    if (!roomId) {
      setRoomId(Math.random().toString(36).substring(7));
    }
  }, [roomId]);

  return (
    <main className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Sixes Card Game</h1>
        <SocketProvider>
          <GameSetup roomId={roomId} />
        </SocketProvider>
      </div>
    </main>
  );
}
