import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import type { Player, Card, GameState } from "@/lib/types";

interface ServerToClientEvents {
  playerJoined: (players: Player[]) => void;
  currentPlayerChanged: (playerId: string) => void;
  gameStarted: (gameState: any) => void;
  playerUpdated: (player: Player) => void;
  cardDrawn: (data: { playerId: string; card: Card }) => void;
  cardSwapped: (data: {
    playerId: string;
    cardIndex: number;
    discardedCard: Card;
  }) => void;
  stopCalled: (data: { playerId: string; gameStatus: GameState }) => void;
  playerLeft: (players: Player[]) => void;
}

interface ClientToServerEvents {
  joinGame: (roomId: string, player: Player) => void;
  startGame: (roomId: string) => void;
  viewBottomRow: (roomId: string, playerId: string) => void;
  drawFromDeck: (roomId: string, playerId: string) => void;
  drawFromDiscard: (roomId: string, playerId: string) => void;
  swapCard: (roomId: string, playerId: string, cardIndex: number) => void;
  callStop: (roomId: string, playerId: string) => void;
}

export function useSocket(roomId: string, initialPlayer: Player) {
  const socketRef = useRef<Socket<
    ServerToClientEvents,
    ClientToServerEvents
  > | null>(null);

  useEffect(() => {
    // Initialize socket connection with the correct path
    socketRef.current = io({
      path: "/api/socket",
      addTrailingSlash: false,
    });

    // Join game room
    socketRef.current.emit("joinGame", roomId, initialPlayer);

    return () => {
      socketRef.current?.disconnect();
    };
  }, [roomId, initialPlayer]);

  const startGame = () => {
    socketRef.current?.emit("startGame", roomId);
  };

  const viewBottomRow = () => {
    socketRef.current?.emit("viewBottomRow", roomId, initialPlayer.id);
  };

  const drawFromDeck = () => {
    socketRef.current?.emit("drawFromDeck", roomId, initialPlayer.id);
  };

  const drawFromDiscard = () => {
    socketRef.current?.emit("drawFromDiscard", roomId, initialPlayer.id);
  };

  const swapCard = (cardIndex: number) => {
    socketRef.current?.emit("swapCard", roomId, initialPlayer.id, cardIndex);
  };

  const callStop = () => {
    socketRef.current?.emit("callStop", roomId, initialPlayer.id);
  };

  return {
    socket: socketRef.current,
    startGame,
    viewBottomRow,
    drawFromDeck,
    drawFromDiscard,
    swapCard,
    callStop,
  };
}
