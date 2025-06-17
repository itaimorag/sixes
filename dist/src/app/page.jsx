"use strict";
"use client";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Home;
const react_1 = require("react");
const GameSetup_1 = require("@/components/GameSetup");
const GameBoard_1 = require("@/components/GameBoard");
function Home() {
    const [gameStarted, setGameStarted] = (0, react_1.useState)(false);
    const [players, setPlayers] = (0, react_1.useState)([]);
    const [currentPlayerId, setCurrentPlayerId] = (0, react_1.useState)(null);
    const roomId = "game-1"; // In a real app, this would be dynamic or from URL
    const handleGameStart = (initialPlayers) => {
        setPlayers(initialPlayers);
        setGameStarted(true);
        // Set the current player ID (in a real app, this would be based on the logged-in user)
        setCurrentPlayerId(initialPlayers[0].id);
    };
    if (!gameStarted || !currentPlayerId) {
        return <GameSetup_1.GameSetup roomId={roomId} onGameStart={handleGameStart}/>;
    }
    return (<main className="container mx-auto p-4">
      <GameBoard_1.GameBoard initialPlayers={players} onNewGame={() => setGameStarted(false)} currentPlayerId={currentPlayerId}/>
    </main>);
}
