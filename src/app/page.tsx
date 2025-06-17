"use client";

import { useState } from "react";
import { GameSetup } from "@/components/GameSetup";
import { GameBoard } from "@/components/GameBoard";
import type { Player } from "@/lib/types";

export default function Home() {
  const [gameStarted, setGameStarted] = useState(false);
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentPlayerId, setCurrentPlayerId] = useState<string | null>(null);
  const roomId = "game-1"; // In a real app, this would be dynamic or from URL

  const handleGameStart = (initialPlayers: Player[]) => {
    setPlayers(initialPlayers);
    setGameStarted(true);
    // Set the current player ID (in a real app, this would be based on the logged-in user)
    setCurrentPlayerId(initialPlayers[0].id);
  };

  if (!gameStarted || !currentPlayerId) {
    return <GameSetup roomId={roomId} onGameStart={handleGameStart} />;
  }

  return (
    <main className="container mx-auto p-4">
      <GameBoard
        initialPlayers={players}
        onNewGame={() => setGameStarted(false)}
        currentPlayerId={currentPlayerId}
      />
    </main>
  );
}
