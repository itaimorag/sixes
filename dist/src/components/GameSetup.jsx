"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameSetup = GameSetup;
const react_1 = require("react");
const useSocket_1 = require("@/hooks/useSocket");
const button_1 = require("@/components/ui/button");
const input_1 = require("@/components/ui/input");
const label_1 = require("@/components/ui/label");
const card_1 = require("@/components/ui/card");
const use_toast_1 = require("@/hooks/use-toast");
const lucide_react_1 = require("lucide-react");
function GameSetup({ roomId, onGameStart }) {
    const [isHost, setIsHost] = (0, react_1.useState)(false);
    const [playerName, setPlayerName] = (0, react_1.useState)("");
    const [players, setPlayers] = (0, react_1.useState)([]);
    const [selectedPlayerId, setSelectedPlayerId] = (0, react_1.useState)(null);
    const [isLoading, setIsLoading] = (0, react_1.useState)(true);
    const { toast } = (0, use_toast_1.useToast)();
    // Initialize socket connection
    const { socket, startGame } = (0, useSocket_1.useSocket)(roomId, {
        id: "",
        name: playerName,
        scoresByRound: [],
        totalScore: 0,
        isStopper: false,
        hand: [],
        hasSwappedTopRow: false,
        hasViewedBottomRow: false,
    });
    // Cast socket to correct type for custom events
    const typedSocket = socket;
    (0, react_1.useEffect)(() => {
        if (!typedSocket)
            return;
        // If this is the first player (host), show the form immediately
        if (typedSocket.id && players.length === 0) {
            setIsHost(true);
            setIsLoading(false);
        }
        // Listen for player joined event
        typedSocket.on("playerJoined", (updatedPlayers) => {
            setPlayers(updatedPlayers);
            // If this is the first player, make them the host
            if (updatedPlayers.length === 1) {
                setIsHost(true);
            }
            setIsLoading(false);
        });
        // Listen for game started event
        typedSocket.on("gameStarted", (gameState) => {
            onGameStart(gameState.players);
        });
        // Listen for player claimed event
        typedSocket.on("playerClaimed", (updatedPlayers) => {
            setPlayers(updatedPlayers);
        });
        return () => {
            typedSocket.off("playerJoined");
            typedSocket.off("gameStarted");
            typedSocket.off("playerClaimed");
        };
    }, [typedSocket, onGameStart, players.length]);
    const handleAddPlayer = () => {
        if (!playerName.trim()) {
            toast({
                title: "Error",
                description: "Please enter a player name",
                variant: "destructive",
            });
            return;
        }
        const newPlayer = {
            id: Math.random().toString(36).substring(7),
            name: playerName,
            scoresByRound: [],
            totalScore: 0,
            isStopper: false,
            hand: [],
            hasSwappedTopRow: false,
            hasViewedBottomRow: false,
        };
        typedSocket === null || typedSocket === void 0 ? void 0 : typedSocket.emit("addPlayer", roomId, newPlayer);
        setPlayerName("");
    };
    const handleSelectPlayer = (playerId) => {
        if (!selectedPlayerId) {
            typedSocket === null || typedSocket === void 0 ? void 0 : typedSocket.emit("claimPlayer", roomId, playerId);
            setSelectedPlayerId(playerId);
        }
    };
    const handleStartGame = () => {
        if (players.length < 2) {
            toast({
                title: "Error",
                description: "Need at least 2 players to start the game",
                variant: "destructive",
            });
            return;
        }
        startGame();
    };
    if (isLoading) {
        return (<div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <lucide_react_1.Loader2 className="h-8 w-8 animate-spin mx-auto"/>
          <p className="text-muted-foreground">
            Waiting for host to set up the game...
          </p>
        </div>
      </div>);
    }
    return (<div className="max-w-2xl mx-auto p-4">
      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle>Game Setup</card_1.CardTitle>
          <card_1.CardDescription>
            {isHost
            ? "You are the host. Add players and start the game."
            : "Select your player name from the list."}
          </card_1.CardDescription>
        </card_1.CardHeader>
        <card_1.CardContent className="space-y-6">
          {isHost ? (
        // Host view
        <div className="space-y-4">
              <div className="space-y-2">
                <label_1.Label>Add New Player</label_1.Label>
                <div className="flex gap-2">
                  <input_1.Input placeholder="Enter player name" value={playerName} onChange={(e) => setPlayerName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleAddPlayer()}/>
                  <button_1.Button onClick={handleAddPlayer}>Add Player</button_1.Button>
                </div>
              </div>

              <div className="space-y-2">
                <label_1.Label>Players ({players.length})</label_1.Label>
                <div className="space-y-2">
                  {players.map((player) => (<div key={player.id} className="p-2 border rounded-md bg-muted/50">
                      {player.name}
                    </div>))}
                </div>
              </div>

              <button_1.Button onClick={handleStartGame} disabled={players.length < 2} className="w-full">
                Start Game
              </button_1.Button>
            </div>) : (
        // Player view
        <div className="space-y-4">
              <div className="space-y-2">
                <label_1.Label>Select Your Player</label_1.Label>
                <div className="space-y-2">
                  {players.map((player) => (<div key={player.id} className={`p-2 border rounded-md cursor-pointer ${player.id === selectedPlayerId
                    ? "bg-primary text-primary-foreground"
                    : player.isClaimed
                        ? "bg-muted/50 cursor-not-allowed opacity-50"
                        : "bg-muted/50 hover:bg-muted"}`} onClick={() => !player.isClaimed && handleSelectPlayer(player.id)}>
                      {player.name}
                      {player.isClaimed && " (Claimed)"}
                    </div>))}
                </div>
              </div>
            </div>)}
        </card_1.CardContent>
      </card_1.Card>
    </div>);
}
