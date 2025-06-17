"use strict";
"use client";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlayerSetup = PlayerSetup;
const react_1 = require("react");
const button_1 = require("@/components/ui/button");
const input_1 = require("@/components/ui/input");
const label_1 = require("@/components/ui/label");
const card_1 = require("@/components/ui/card");
const select_1 = require("@/components/ui/select");
const lucide_react_1 = require("lucide-react");
const MAX_PLAYERS = 4;
const MIN_PLAYERS = 3;
function PlayerSetup({ onSetupComplete }) {
    const [numPlayers, setNumPlayers] = (0, react_1.useState)(MIN_PLAYERS);
    const [playerNames, setPlayerNames] = (0, react_1.useState)(Array(MIN_PLAYERS).fill(""));
    const handleNumPlayersChange = (value) => {
        const count = parseInt(value, 10);
        setNumPlayers(count);
        setPlayerNames(Array(count)
            .fill("")
            .map((_, i) => playerNames[i] || ""));
    };
    const handleNameChange = (index, name) => {
        const newNames = [...playerNames];
        newNames[index] = name;
        setPlayerNames(newNames);
    };
    const handleSubmit = (e) => {
        e.preventDefault();
        if (playerNames.some((name) => name.trim() === "")) {
            alert("Please enter names for all players.");
            return;
        }
        const newPlayers = playerNames.map((name, index) => ({
            id: `player-${index + 1}-${Date.now()}`,
            name: name.trim(),
            scoresByRound: [],
            totalScore: 0,
            isStopper: false,
            hand: [],
            hasSwappedTopRow: false,
            hasViewedBottomRow: false,
        }));
        onSetupComplete(newPlayers, numPlayers);
    };
    return (<card_1.Card className="w-full max-w-md shadow-xl">
      <card_1.CardHeader>
        <card_1.CardTitle className="text-3xl flex items-center">
          <lucide_react_1.Users className="mr-2 h-8 w-8 text-primary"/> Player Setup
        </card_1.CardTitle>
        <card_1.CardDescription>Enter player names to start the game.</card_1.CardDescription>
      </card_1.CardHeader>
      <card_1.CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label_1.Label htmlFor="numPlayers">Number of Players</label_1.Label>
            <select_1.Select onValueChange={handleNumPlayersChange} defaultValue={String(MIN_PLAYERS)}>
              <select_1.SelectTrigger id="numPlayers" className="w-full">
                <select_1.SelectValue placeholder="Select number of players"/>
              </select_1.SelectTrigger>
              <select_1.SelectContent>
                {Array.from({ length: MAX_PLAYERS - MIN_PLAYERS + 1 }, (_, i) => MIN_PLAYERS + i).map((num) => (<select_1.SelectItem key={num} value={String(num)}>
                    {num} Players
                  </select_1.SelectItem>))}
              </select_1.SelectContent>
            </select_1.Select>
          </div>

          {playerNames.map((name, index) => (<div key={index} className="space-y-2">
              <label_1.Label htmlFor={`player-${index}`}>Player {index + 1} Name</label_1.Label>
              <input_1.Input id={`player-${index}`} type="text" value={name} onChange={(e) => handleNameChange(index, e.target.value)} placeholder={`Enter Player ${index + 1}'s Name`} required className="text-base"/>
            </div>))}
          <button_1.Button type="submit" className="w-full text-lg py-6 bg-primary hover:bg-primary/90">
            <lucide_react_1.Play className="mr-2 h-5 w-5"/> Start Game
          </button_1.Button>
        </form>
      </card_1.CardContent>
    </card_1.Card>);
}
