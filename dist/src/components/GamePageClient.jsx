"use strict";
"use client";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GamePageClient = GamePageClient;
const react_1 = require("react");
const PlayerSetup_1 = require("./PlayerSetup");
const GameBoard_1 = require("./GameBoard");
const PlayerIdentitySelection_1 = require("./PlayerIdentitySelection");
const SixesIcon_1 = require("./icons/SixesIcon");
const LOCAL_STORAGE_CURRENT_PLAYER_ID = "sixes_currentPlayerId";
function GamePageClient() {
    const [viewState, setViewState] = (0, react_1.useState)("setup");
    const [gameState, setGameState] = (0, react_1.useState)(null);
    const [players, setPlayers] = (0, react_1.useState)([]);
    const [gameId, setGameId] = (0, react_1.useState)(1);
    const [currentPlayerId, setCurrentPlayerId] = (0, react_1.useState)(null);
    (0, react_1.useEffect)(() => {
        const storedPlayerId = localStorage.getItem(LOCAL_STORAGE_CURRENT_PLAYER_ID);
        if (storedPlayerId) {
            setCurrentPlayerId(storedPlayerId);
        }
    }, []);
    const handleSetupComplete = (newPlayers) => {
        setPlayers(newPlayers.map((p) => (Object.assign(Object.assign({}, p), { hand: [] })))); // Initialize with empty hands
        if (newPlayers.length === 1) {
            const newPlayerId = newPlayers[0].id;
            setCurrentPlayerId(newPlayerId);
            localStorage.setItem(LOCAL_STORAGE_CURRENT_PLAYER_ID, newPlayerId);
            setViewState("playing");
            setGameId((prevId) => prevId + 1);
        }
        else if (currentPlayerId &&
            newPlayers.some((p) => p.id === currentPlayerId)) {
            setViewState("playing");
            setGameId((prevId) => prevId + 1);
        }
        else {
            localStorage.removeItem(LOCAL_STORAGE_CURRENT_PLAYER_ID);
            setCurrentPlayerId(null);
            setViewState("player_selection");
        }
    };
    const handlePlayerSelected = (playerId) => {
        setCurrentPlayerId(playerId);
        localStorage.setItem(LOCAL_STORAGE_CURRENT_PLAYER_ID, playerId);
        setViewState("playing");
        setGameId((prevId) => prevId + 1);
    };
    const handleNewGame = () => {
        setViewState("setup");
        setPlayers([]);
    };
    (0, react_1.useEffect)(() => {
        if (typeof window !== "undefined" &&
            process.env.NODE_ENV === "development") {
            console.log("Game State Change:", {
                viewState,
                players,
                gameId,
                currentPlayerId,
            });
        }
    }, [viewState, players, gameId, currentPlayerId]);
    return (<div className="container mx-auto p-4 md:p-8 flex flex-col items-center">
      <header className="mb-8 text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-primary flex items-center justify-center">
          <SixesIcon_1.SixesIcon className="h-12 w-12 md:h-16 md:w-16 mr-3 fill-current text-primary"/>
          Sixes Scorecard
        </h1>
        <p className="text-muted-foreground text-lg mt-2 font-body">
          Track your Shishiyot game scores with ease!
        </p>
      </header>

      <main className="w-full max-w-3xl">
        {viewState === "setup" && (<PlayerSetup_1.PlayerSetup onSetupComplete={handleSetupComplete}/>)}
        {viewState === "player_selection" && players.length > 0 && (<PlayerIdentitySelection_1.PlayerIdentitySelection players={players} onPlayerSelected={handlePlayerSelected}/>)}
        {(viewState === "playing" ||
            viewState === "final_round" ||
            viewState === "game_over") &&
            players.length > 0 &&
            currentPlayerId && (<GameBoard_1.GameBoard key={gameId} initialPlayers={players} onNewGame={handleNewGame} currentPlayerId={currentPlayerId}/>)}
      </main>

      <footer className="mt-12 text-center text-muted-foreground text-sm">
        <p>
          &copy; {new Date().getFullYear()} Sixes Scorecard. Enjoy the game!
        </p>
      </footer>
    </div>);
}
