import { useState, useEffect } from "react";
import { useSocket } from "@/hooks/useSocket";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import type {
  Player,
  ServerToClientEvents,
  ClientToServerEvents,
} from "@/lib/types";
import type { Socket } from "socket.io-client";

interface GameSetupProps {
  roomId: string;
  onGameStart: (players: Player[]) => void;
}

export function GameSetup({ roomId, onGameStart }: GameSetupProps) {
  const [isHost, setIsHost] = useState(false);
  const [playerName, setPlayerName] = useState("");
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Initialize socket connection
  const { socket, startGame } = useSocket(roomId, {
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
  const typedSocket = socket as Socket<
    ServerToClientEvents,
    ClientToServerEvents
  > | null;

  useEffect(() => {
    if (!typedSocket) return;

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

    const newPlayer: Player = {
      id: Math.random().toString(36).substring(7),
      name: playerName,
      scoresByRound: [],
      totalScore: 0,
      isStopper: false,
      hand: [],
      hasSwappedTopRow: false,
      hasViewedBottomRow: false,
    };

    typedSocket?.emit("addPlayer", roomId, newPlayer);
    setPlayerName("");
  };

  const handleSelectPlayer = (playerId: string) => {
    if (!selectedPlayerId) {
      typedSocket?.emit("claimPlayer", roomId, playerId);
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
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="text-muted-foreground">
            Waiting for host to set up the game...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Game Setup</CardTitle>
          <CardDescription>
            {isHost
              ? "You are the host. Add players and start the game."
              : "Select your player name from the list."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {isHost ? (
            // Host view
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Add New Player</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter player name"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddPlayer()}
                  />
                  <Button onClick={handleAddPlayer}>Add Player</Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Players ({players.length})</Label>
                <div className="space-y-2">
                  {players.map((player) => (
                    <div
                      key={player.id}
                      className="p-2 border rounded-md bg-muted/50"
                    >
                      {player.name}
                    </div>
                  ))}
                </div>
              </div>

              <Button
                onClick={handleStartGame}
                disabled={players.length < 2}
                className="w-full"
              >
                Start Game
              </Button>
            </div>
          ) : (
            // Player view
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Select Your Player</Label>
                <div className="space-y-2">
                  {players.map((player) => (
                    <div
                      key={player.id}
                      className={`p-2 border rounded-md cursor-pointer ${
                        player.id === selectedPlayerId
                          ? "bg-primary text-primary-foreground"
                          : player.isClaimed
                          ? "bg-muted/50 cursor-not-allowed opacity-50"
                          : "bg-muted/50 hover:bg-muted"
                      }`}
                      onClick={() =>
                        !player.isClaimed && handleSelectPlayer(player.id)
                      }
                    >
                      {player.name}
                      {player.isClaimed && " (Claimed)"}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
