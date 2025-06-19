const { Server, Socket } = require("socket.io");
const { Player } = require("../lib/types");

type GameSocket = typeof Socket;
type GameServer = typeof Server;
type GamePlayer = typeof Player;

interface GameState {
  players: GamePlayer[];
  firstPlayerId: string | null;
}

// Single game state (only one game at a time)
const gameState: GameState = {
  players: [],
  firstPlayerId: null,
};

export function registerGameHandlers(io: GameServer, socket: GameSocket) {
  console.log("New socket connection:", socket.id);

  // Check if this is the first player
  socket.on("checkFirstPlayer", (roomId: string) => {
    console.log("Checking if first player. Current state:", {
      socketId: socket.id,
      firstPlayerId: gameState.firstPlayerId,
      currentPlayers: gameState.players.length,
    });

    const isFirst = !gameState.firstPlayerId;
    if (isFirst) {
      console.log("This is the first player:", socket.id);
      gameState.firstPlayerId = socket.id;
    }

    socket.emit("isFirstPlayer", isFirst);
  });

  // Setup game with player names
  socket.on("setupGame", (roomId: string, playerNames: string[]) => {
    console.log("Setup game request:", {
      socketId: socket.id,
      firstPlayerId: gameState.firstPlayerId,
      playerNames,
    });

    if (socket.id !== gameState.firstPlayerId) {
      console.log("Setup game rejected - not first player");
      return;
    }

    gameState.players = playerNames.map((name) => ({
      id: Math.random().toString(36).substring(7),
      name,
      isClaimed: false,
      scoresByRound: [],
      totalScore: 0,
      isStopper: false,
      hand: [],
      hasSwappedTopRow: false,
      hasViewedBottomRow: false,
    }));

    console.log("Game setup complete. Players:", gameState.players);
    io.emit("playersUpdate", gameState.players);
  });

  // Select a name
  socket.on("selectName", (roomId: string, name: string) => {
    console.log("Name selection request:", {
      socketId: socket.id,
      name,
      currentPlayers: gameState.players,
    });

    const player = gameState.players.find(
      (p) => p.name === name && !p.isClaimed
    );
    if (!player) {
      console.log("Name selection rejected - name not available");
      return;
    }

    player.isClaimed = true;
    console.log("Name claimed successfully:", name);
    io.emit("playersUpdate", gameState.players);

    // If all players have claimed their names, start the game
    if (gameState.players.every((p) => p.isClaimed)) {
      console.log("All players have claimed names - starting game!");
      io.emit("gameStarting");
    }
  });

  // Clean up when a player disconnects
  socket.on("disconnect", () => {
    console.log("Player disconnected:", socket.id);
    if (socket.id === gameState.firstPlayerId) {
      console.log("First player disconnected - resetting game state");
      gameState.players = [];
      gameState.firstPlayerId = null;
      // Notify all clients that the game has been reset
      io.emit("playersUpdate", []);
    }
  });
}
