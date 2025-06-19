import { useState, useEffect } from "react";
import { useSocket } from "../lib/socketContext";
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
import type { Player } from "@/lib/types";

interface GameSetupProps {
  roomId: string;
}

export default function GameSetup({ roomId }: GameSetupProps) {
  const socket = useSocket();
  const [numPlayers, setNumPlayers] = useState(2);
  const [playerNames, setPlayerNames] = useState<string[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [isFirstPlayer, setIsFirstPlayer] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedName, setSelectedName] = useState<string>("");
  const { toast } = useToast();

  // Debug log for component render
  console.log("GameSetup rendering:", {
    socket: !!socket,
    roomId,
    isFirstPlayer,
    players,
  });

  useEffect(() => {
    if (!socket) {
      console.log("No socket available yet");
      return;
    }

    console.log("Setting up socket listeners");

    // Check if we're the first player
    socket.emit("checkFirstPlayer", roomId);
    console.log("Emitted checkFirstPlayer event");

    socket.on("isFirstPlayer", (isFirst: boolean) => {
      console.log("Received isFirstPlayer response:", isFirst);
      setIsFirstPlayer(isFirst);
      setIsLoading(false);
    });

    socket.on("playersUpdate", (updatedPlayers: Player[]) => {
      console.log("Received playersUpdate:", updatedPlayers);
      setPlayers(updatedPlayers);
    });

    socket.on("gameStarting", () => {
      console.log("Received gameStarting event");
      // TODO: Transition to game page
    });

    return () => {
      console.log("Cleaning up socket listeners");
      socket.off("isFirstPlayer");
      socket.off("playersUpdate");
      socket.off("gameStarting");
    };
  }, [socket, roomId]);

  const handleSetupGame = () => {
    if (!socket || playerNames.some((name) => !name.trim())) return;

    console.log("Setting up game with names:", playerNames);
    socket.emit("setupGame", roomId, playerNames);
  };

  const handleNameSelect = (name: string) => {
    if (!socket) return;

    console.log("Selecting name:", name);
    socket.emit("selectName", roomId, name);
    setSelectedName(name);
  };

  if (!socket) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <Loader2 className="animate-spin w-8 h-8 text-blue-500" />
      </div>
    );
  }

  if (isLoading) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Connecting...</CardTitle>
          <CardDescription>
            Establishing connection to the game server...
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Loader2 className="animate-spin w-8 h-8 text-blue-500" />
        </CardContent>
      </Card>
    );
  }

  // First player setup view
  if (isFirstPlayer) {
    console.log("Rendering first player setup view");
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Setup Game</CardTitle>
          <CardDescription>
            Choose the number of players and enter their names
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Number of Players</Label>
            <select
              className="w-full p-2 border rounded mt-1"
              value={numPlayers}
              onChange={(e) => {
                const num = parseInt(e.target.value);
                setNumPlayers(num);
                setPlayerNames(Array(num).fill(""));
              }}
            >
              <option value={2}>2 Players</option>
              <option value={3}>3 Players</option>
              <option value={4}>4 Players</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label>Player Names</Label>
            {Array(numPlayers)
              .fill(0)
              .map((_, i) => (
                <Input
                  key={i}
                  placeholder={`Player ${i + 1}`}
                  value={playerNames[i] || ""}
                  onChange={(e) => {
                    const newNames = [...playerNames];
                    newNames[i] = e.target.value;
                    setPlayerNames(newNames);
                  }}
                />
              ))}
          </div>

          <Button
            className="w-full"
            onClick={handleSetupGame}
            disabled={playerNames.some((name) => !name.trim())}
          >
            Start Game Setup
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Name selection view (for all players)
  if (players.length > 0) {
    console.log("Rendering name selection view");
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Select Your Name</CardTitle>
          <CardDescription>Choose your name from the list</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            {players.map((player) => (
              <Button
                key={player.name}
                onClick={() => handleNameSelect(player.name)}
                disabled={player.isClaimed || selectedName !== ""}
                variant={player.isClaimed ? "outline" : "default"}
                className={`w-full ${player.isClaimed ? "bg-gray-100" : ""}`}
              >
                {player.name}
                {player.isClaimed && " (Taken)"}
              </Button>
            ))}
          </div>

          {players.every((p) => p.isClaimed) && (
            <div className="text-center text-green-600 font-semibold">
              All players ready! Game starting...
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Waiting for first player to setup
  console.log("Rendering waiting view");
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Waiting for Setup</CardTitle>
        <CardDescription>
          Waiting for the first player to setup the game...
        </CardDescription>
      </CardHeader>
      <CardContent className="flex justify-center">
        <Loader2 className="animate-spin w-8 h-8 text-blue-500" />
      </CardContent>
    </Card>
  );
}
