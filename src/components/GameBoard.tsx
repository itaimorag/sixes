"use client";

import type { Player, GameState as GameStatusType } from '@/lib/types';
import { useState, useEffect } from 'react';
import { Scoreboard } from './Scoreboard';
import { RoundScoreForm } from './RoundScoreForm';
import { StopAdvisorDialog } from './StopAdvisorDialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { calculateNewTotalScore, applyStopBonusesAndPenalties } from '@/lib/game-logic';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Hand, Brain, RotateCcw, PartyPopper, Users, CheckSquare } from 'lucide-react';

interface GameBoardProps {
  initialPlayers: Player[];
  onNewGame: () => void;
}

export function GameBoard({ initialPlayers, onNewGame }: GameBoardProps) {
  const [players, setPlayers] = useState<Player[]>(initialPlayers);
  const [currentRound, setCurrentRound] = useState(1);
  const [gameStatus, setGameStatus] = useState<GameStatusType>('playing');
  const [stopperId, setStopperId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    setPlayers(initialPlayers);
    setCurrentRound(1);
    setGameStatus('playing');
    setStopperId(null);
  }, [initialPlayers]);


  const handleScoresSubmit = (roundScores: Record<string, number>) => {
    const updatedPlayers = players.map(player => {
      const scoreForRound = roundScores[player.id];
      if (scoreForRound === undefined) return player; // Should not happen if form validates

      const newScoresByRound = [...player.scoresByRound, scoreForRound];
      // Calculate total score iteratively applying 50 point rule
      let updatedTotalScore = 0;
      newScoresByRound.forEach(rs => {
        updatedTotalScore = calculateNewTotalScore(updatedTotalScore, rs);
      });
      
      return {
        ...player,
        scoresByRound: newScoresByRound,
        totalScore: updatedTotalScore,
      };
    });

    if (gameStatus === 'final_round') {
      const finalPlayersWithBonuses = applyStopBonusesAndPenalties(updatedPlayers, stopperId);
      setPlayers(finalPlayersWithBonuses);
      setGameStatus('game_over');
      // Determine winner
      const winner = finalPlayersWithBonuses.reduce((prev, curr) => (curr.totalScore < prev.totalScore ? curr : prev));
      toast({
        title: "Game Over!",
        description: `${winner.name} wins with a score of ${winner.totalScore}!`,
        duration: 5000,
      });
    } else {
      setPlayers(updatedPlayers);
      setCurrentRound(prev => prev + 1);
      toast({
        title: `Round ${currentRound} Complete!`,
        description: `Scores updated. Moving to Round ${currentRound + 1}.`,
      });
    }
  };

  const handleCallStop = (playerId: string) => {
    if (gameStatus === 'playing') {
      setPlayers(prevPlayers => prevPlayers.map(p => p.id === playerId ? {...p, isStopper: true} : p));
      setStopperId(playerId);
      setGameStatus('final_round');
      const player = players.find(p => p.id === playerId);
      toast({
        title: `${player?.name} called STOP!`,
        description: "The next round will be the final round.",
        variant: 'default',
        className: 'bg-accent text-accent-foreground',
      });
    }
  };
  
  const getOtherPlayers = (currentPlayerId: string) => {
    return players.filter(p => p.id !== currentPlayerId);
  };

  if (gameStatus === 'game_over') {
    const winner = players.reduce((prev, curr) => (curr.totalScore < prev.totalScore ? curr : prev), players[0]);
    return (
      <div className="space-y-6">
        <Scoreboard players={players} currentRound={currentRound -1} />
        <Card className="text-center shadow-xl bg-gradient-to-r from-primary to-accent text-primary-foreground">
          <CardHeader>
            <CardTitle className="text-4xl flex items-center justify-center">
              <PartyPopper className="mr-3 h-10 w-10" /> Game Over!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-2xl font-semibold">
              {winner ? `${winner.name} is the winner with ${winner.totalScore} points!` : 'Scores are final!'}
            </p>
            <Button onClick={onNewGame} size="lg" variant="secondary" className="text-lg">
              <RotateCcw className="mr-2 h-5 w-5" /> Start New Game
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Scoreboard players={players} currentRound={currentRound} />

      {gameStatus !== 'game_over' && (
        <RoundScoreForm
          players={players}
          currentRound={currentRound}
          onSubmitScores={handleScoresSubmit}
          isFinalRound={gameStatus === 'final_round'}
        />
      )}
      
      {gameStatus === 'playing' && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center"><CheckSquare className="mr-2 h-7 w-7 text-primary" />Player Actions</CardTitle>
            <CardDescription>Each player can choose to call STOP or get AI advice.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {players.map(player => (
              <Card key={player.id} className="p-4 space-y-3 bg-background">
                <h3 className="text-lg font-semibold font-headline text-primary">{player.name}</h3>
                <div className="flex flex-col sm:flex-row gap-2">
                <Button 
                  onClick={() => handleCallStop(player.id)} 
                  variant="destructive" 
                  className="flex-grow"
                  disabled={gameStatus !== 'playing'}
                >
                  <Hand className="mr-2 h-4 w-4" /> Call STOP
                </Button>
                <StopAdvisorDialog 
                  currentPlayer={player} 
                  otherPlayers={getOtherPlayers(player.id)} 
                  triggerButton={
                     <Button variant="outline" className="flex-grow">
                        <Brain className="mr-2 h-4 w-4" /> AI Advice
                     </Button>
                  }
                />
                </div>
              </Card>
            ))}
          </CardContent>
        </Card>
      )}
       <Button onClick={onNewGame} variant="outline" className="mt-8">
          <RotateCcw className="mr-2 h-5 w-5" /> Start New Game
        </Button>
    </div>
  );
}
