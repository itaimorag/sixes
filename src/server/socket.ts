import { Server } from "socket.io";
import type { Server as HTTPServer } from "http";
import type { Socket as NetSocket } from "net";
import type { GameState, Player, Card, GameStatusType } from "@/lib/types";

interface SocketWithIO extends NetSocket {
  server: HTTPServer & {
    io?: Server;
  };
}

interface GameRoom {
  players: Player[];
  deck: Card[];
  discardPile: Card[];
  currentPlayerId: string | null;
  gameStatus: GameStatusType;
  stopperId: string | null;
}

const gameRooms = new Map<string, GameRoom>();

export function initializeSocketServer(httpServer: HTTPServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    // Join a game room
    socket.on("joinGame", (roomId: string, player: Player) => {
      socket.join(roomId);

      if (!gameRooms.has(roomId)) {
        gameRooms.set(roomId, {
          players: [],
          deck: [],
          discardPile: [],
          currentPlayerId: null,
          gameStatus: "waiting",
          stopperId: null,
        });
      }

      const room = gameRooms.get(roomId)!;
      room.players.push(player);

      // Notify all players in the room about the new player
      io.to(roomId).emit("playerJoined", room.players);

      // If this is the first player, make them the current player
      if (room.players.length === 1) {
        room.currentPlayerId = player.id;
        io.to(roomId).emit("currentPlayerChanged", player.id);
      }
    });

    // Handle adding new player (host only)
    socket.on("addPlayer", (roomId: string, player: Player) => {
      const room = gameRooms.get(roomId);
      if (room && room.players.length > 0 && room.players[0].id === socket.id) {
        room.players.push(player);
        io.to(roomId).emit("playerJoined", room.players);
      }
    });

    // Handle player claiming
    socket.on("claimPlayer", (roomId: string, playerId: string) => {
      const room = gameRooms.get(roomId);
      if (room) {
        const player = room.players.find((p) => p.id === playerId);
        if (player && !player.isClaimed) {
          player.isClaimed = true;
          io.to(roomId).emit("playerClaimed", room.players);
        }
      }
    });

    // Start the game
    socket.on("startGame", (roomId: string) => {
      const room = gameRooms.get(roomId);
      if (!room) return;

      room.gameStatus = "playing";
      // Initialize deck, deal cards, etc.
      io.to(roomId).emit("gameStarted", room);
    });

    // View bottom row cards
    socket.on("viewBottomRow", (roomId: string, playerId: string) => {
      const room = gameRooms.get(roomId);
      if (!room) return;

      const player = room.players.find((p) => p.id === playerId);
      if (player) {
        player.hasViewedBottomRow = true;
        io.to(roomId).emit("playerUpdated", player);
      }
    });

    // Draw card from deck
    socket.on("drawFromDeck", (roomId: string, playerId: string) => {
      const room = gameRooms.get(roomId);
      if (!room || room.currentPlayerId !== playerId) return;

      if (room.deck.length > 0) {
        const card = room.deck.pop()!;
        const player = room.players.find((p) => p.id === playerId);
        if (player) {
          player.drawnCard = card;
          io.to(roomId).emit("cardDrawn", { playerId, card });
        }
      }
    });

    // Draw card from discard pile
    socket.on("drawFromDiscard", (roomId: string, playerId: string) => {
      const room = gameRooms.get(roomId);
      if (!room || room.currentPlayerId !== playerId) return;

      if (room.discardPile.length > 0) {
        const card = room.discardPile.pop()!;
        const player = room.players.find((p) => p.id === playerId);
        if (player) {
          player.drawnCard = card;
          io.to(roomId).emit("cardDrawn", { playerId, card });
        }
      }
    });

    // Swap card
    socket.on(
      "swapCard",
      (roomId: string, playerId: string, cardIndex: number) => {
        const room = gameRooms.get(roomId);
        if (!room || room.currentPlayerId !== playerId) return;

        const player = room.players.find((p) => p.id === playerId);
        if (player && player.drawnCard) {
          const discardedCard = player.hand[cardIndex];
          player.hand[cardIndex] = player.drawnCard;
          room.discardPile.push(discardedCard);
          player.drawnCard = null;

          io.to(roomId).emit("cardSwapped", {
            playerId,
            cardIndex,
            discardedCard,
          });
        }
      }
    );

    // Call stop
    socket.on("callStop", (roomId: string, playerId: string) => {
      const room = gameRooms.get(roomId);
      if (!room) return;

      room.stopperId = playerId;
      room.gameStatus = "final_round";
      io.to(roomId).emit("stopCalled", {
        playerId,
        gameStatus: room.gameStatus,
      });
    });

    // Disconnect handling
    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
      // Handle player disconnection
      gameRooms.forEach((room, roomId) => {
        const playerIndex = room.players.findIndex((p) => p.id === socket.id);
        if (playerIndex !== -1) {
          room.players.splice(playerIndex, 1);
          io.to(roomId).emit("playerLeft", room.players);
        }
      });
    });
  });

  return io;
}
