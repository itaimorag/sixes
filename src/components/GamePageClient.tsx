"use client";

import type { Player, GameState } from '@/lib/types';
import { useState, useEffect } from 'react';
import { PlayerSetup } from './PlayerSetup';
import { GameBoard } from './GameBoard';
import { SixesIcon } from './icons/SixesIcon';

export function GamePageClient() {
  const [gameState, setGameState] = useState<GameState>('setup');
  const [players, setPlayers] = useState<Player[]>([]);
  // Used to force re-mount GameBoard for a new game
  const [gameId, setGameId] = useState(1); 

  const handleSetupComplete = (newPlayers: Player[]) => {
    setPlayers(newPlayers);
    setGameState('playing');
    setGameId(prevId => prevId + 1); // Increment gameId to trigger new game
  };

  const handleNewGame = () => {
    setGameState('setup');
    setPlayers([]);
    // gameId will be incremented when setup completes
  };
  
  // Effect to log state changes for debugging
  useEffect(() => {
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      console.log("Game State Change:", { gameState, players, gameId });
    }
  }, [gameState, players, gameId]);


  return (
    <div className="container mx-auto p-4 md:p-8 flex flex-col items-center">
      <header className="mb-8 text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-primary flex items-center justify-center">
          <SixesIcon className="h-12 w-12 md:h-16 md:w-16 mr-3 fill-current text-primary" />
          Sixes Scorecard
        </h1>
        <p className="text-muted-foreground text-lg mt-2 font-body">Track your Shishiyot game scores with ease!</p>
      </header>

      <main className="w-full max-w-3xl">
        {gameState === 'setup' && (
          <PlayerSetup onSetupComplete={handleSetupComplete} />
        )}
        {(gameState === 'playing' || gameState === 'final_round' || gameState === 'game_over') && players.length > 0 && (
          <GameBoard key={gameId} initialPlayers={players} onNewGame={handleNewGame} />
        )}
      </main>
      
      <footer className="mt-12 text-center text-muted-foreground text-sm">
        <p>&copy; {new Date().getFullYear()} Sixes Scorecard. Enjoy the game!</p>
      </footer>
    </div>
  );
}
