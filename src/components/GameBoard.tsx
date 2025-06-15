
"use client";

import type { Player, GameState as GameStatusType, Card as CardType } from '@/lib/types';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Scoreboard } from './Scoreboard';
import { RoundScoreForm } from './RoundScoreForm';
import { StopAdvisorDialog } from './StopAdvisorDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { calculateNewTotalScore, applyStopBonusesAndPenalties } from '@/lib/game-logic';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Hand, Brain, RotateCcw, PartyPopper, Users, CheckSquare, Layers, Shuffle, HelpCircle } from 'lucide-react';

interface PlayerHandDisplayProps {
  players: Player[];
  currentPlayerId: string | null;
}

function PlayerHandsDisplay({ players, currentPlayerId }: PlayerHandDisplayProps) {
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center">
          <Shuffle className="mr-2 h-7 w-7 text-primary" />
          Player Hands
        </CardTitle>
        <CardDescription>Each player has 6 cards. Your cards are shown face up.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {players.map(player => (
            <div key={player.id} className="p-4 border rounded-lg bg-card/50">
              <h3 className="text-lg font-semibold text-primary mb-2">{player.name}'s Hand {player.id === currentPlayerId ? "(Your Hand)" : ""}</h3>
              <div className="flex flex-wrap gap-2">
                {(player.hand || []).map((card, i) => {
                  const isCurrentPlayerCard = player.id === currentPlayerId;
                  // Placeholder for card front. For actual game, use card specific images.
                  const cardImageSrc = isCurrentPlayerCard ? "https://placehold.co/60x90/fafafa/333333.png" : "https://placehold.co/60x90.png";
                  const cardAltText = isCurrentPlayerCard ? `Your card ${i + 1} (ID: ${card.id})` : `${player.name}'s face-down card ${i + 1}`;
                  const dataAiHint = isCurrentPlayerCard ? "card front" : "card back";
                  
                  return (
                    <Image 
                      key={card.id} 
                      src={cardImageSrc} 
                      alt={cardAltText}
                      width={60}
                      height={90} 
                      className="rounded shadow-md"
                      data-ai-hint={dataAiHint}
                    />
                  );
                })}
                {(!player.hand || player.hand.length === 0) && Array.from({ length: 6 }).map((_, i) => (
                     <Image 
                        key={`empty-${i}`} 
                        src="https://placehold.co/60x90.png" 
                        alt="Face-down card placeholder" 
                        width={60}
                        height={90} 
                        className="rounded shadow-md opacity-50"
                        data-ai-hint="card back"
                    />
                ))}
              </div>
            </div>
          ))}
        </div>
        {/* Basic instructions for next steps (to be implemented by user with sockets) */}
        <Card className="mt-6 bg-primary/10 border-primary/30">
          <CardHeader>
            <CardTitle className="text-xl flex items-center"><HelpCircle className="mr-2 h-6 w-6 text-primary" />Next Steps (Multiplayer)</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-1">
            <p>The game is now set up for basic multiplayer hand display.</p>
            <p>To continue, you'll need to implement backend WebSocket logic for:</p>
            <ul className="list-disc list-inside pl-4">
              <li>Managing turns.</li>
              <li>Handling card drawing (from deck or discard pile).</li>
              <li>Handling card discarding.</li>
              <li>Synchronizing these actions across all players.</li>
            </ul>
            <p className="mt-2">For now, you can proceed with score entry for rounds.</p>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
}

interface GameBoardProps {
  initialPlayers: Player[];
  onNewGame: () => void;
  currentPlayerId: string | null;
}

// Generates a deck of cards
function createDeck(deckSize: number = 108): CardType[] {
  return Array.from({ length: deckSize }, (_, i) => ({ id: `card-${i + 1}` }));
}

// Shuffles a deck of cards
function shuffleDeck(deck: CardType[]): CardType[] {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}


export function GameBoard({ initialPlayers, onNewGame, currentPlayerId }: GameBoardProps) {
  const [players, setPlayers] = useState<Player[]>(initialPlayers.map(p => ({...p, hand: p.hand || []})));
  const [currentRound, setCurrentRound] = useState(1);
  const [gameStatus, setGameStatus] = useState<GameStatusType>('playing');
  const [stopperId, setStopperId] = useState<string | null>(null);
  const [mainDeck, setMainDeck] = useState<CardType[]>([]);
  const [cardsRemainingInDeck, setCardsRemainingInDeck] = useState(0); // This will be derived from mainDeck.length
  const [cardsInDiscardPile, setCardsInDiscardPile] = useState(0); // This will be its own state, or an array of CardType[]
  const [firstRoundScoresSubmitted, setFirstRoundScoresSubmitted] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Initialize game: deal cards, set up deck
    const initialDeckSize = 108;
    let deck = shuffleDeck(createDeck(initialDeckSize));
    
    const updatedPlayers = initialPlayers.map(player => {
      const hand = deck.splice(0, 6); // Deal 6 cards
      return { ...player, hand: hand, scoresByRound: [], totalScore: 0, isStopper: false };
    });

    setPlayers(updatedPlayers);
    setMainDeck(deck);
    setCardsRemainingInDeck(deck.length);
    setCardsInDiscardPile(0); // Assuming discard pile starts empty

    setCurrentRound(1);
    setGameStatus('playing');
    setStopperId(null);
    setFirstRoundScoresSubmitted(false);

  }, [initialPlayers, currentPlayerId]); // Rerun if initialPlayers changes (new game) or currentPlayerId (could imply UI refresh)


  const handleScoresSubmit = (roundScores: Record<string, number>) => {
    const updatedPlayers = players.map(player => {
      const scoreForRound = roundScores[player.id];
      if (scoreForRound === undefined) return player; 

      const newScoresByRound = [...player.scoresByRound, scoreForRound];
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

    if (currentRound === 1 && !firstRoundScoresSubmitted) {
      setFirstRoundScoresSubmitted(true);
    }

    if (gameStatus === 'final_round') {
      const finalPlayersWithBonuses = applyStopBonusesAndPenalties(updatedPlayers, stopperId);
      setPlayers(finalPlayersWithBonuses);
      setGameStatus('game_over');
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
    // This action would eventually be sent to the server
    // For now, update local state
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
  
  const getOtherPlayers = (targetPlayerId: string) => {
    return players.filter(p => p.id !== targetPlayerId);
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
      {/* Display player hands based on currentPlayerId */}
      {gameStatus === 'playing' && (!firstRoundScoresSubmitted || currentRound ===1) && (
         <PlayerHandsDisplay players={players} currentPlayerId={currentPlayerId} />
      )}


      {/* Scoreboard: Show if first round scores are in, and game is not yet over */}
      {(firstRoundScoresSubmitted && gameStatus !== 'game_over') && (
        <Scoreboard players={players} currentRound={currentRound - 1} />
      )}

      {players.length > 0 && (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center">
                <Layers className="mr-2 h-7 w-7 text-primary" />
                Deck & Discard Status
              </CardTitle>
              <CardDescription>Track the cards in play. This information is used by the AI Advisor. Deck count is automatically updated after dealing.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <Label htmlFor="cardsRemainingInDeck" className="font-medium">Cards Remaining in Deck (Main Deck)</Label>
                <Input
                  id="cardsRemainingInDeck"
                  type="number"
                  value={cardsRemainingInDeck} // Derived from mainDeck state
                  readOnly // This is now managed by dealing logic
                  className="text-base h-12 bg-muted/50"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="cardsInDiscardPile" className="font-medium">Cards in Discard Pile</Label>
                <Input
                  id="cardsInDiscardPile"
                  type="number"
                  value={cardsInDiscardPile}
                  // onChange for discard pile would be part of socket-based game actions
                  onChange={(e) => setCardsInDiscardPile(Math.max(0, parseInt(e.target.value, 10) || 0))}
                  className="text-base h-12"
                />
              </div>
            </CardContent>
          </Card>
      )}


      {gameStatus !== 'game_over' && (
        <RoundScoreForm
          players={players}
          currentRound={currentRound}
          onSubmitScores={handleScoresSubmit}
          isFinalRound={gameStatus === 'final_round'}
        />
      )}
      
      {gameStatus === 'playing' && currentPlayerId && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center"><CheckSquare className="mr-2 h-7 w-7 text-primary" />Player Actions</CardTitle>
            <CardDescription>Each player can choose to call STOP or get AI advice. These actions are local for now.</CardDescription>
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
                  disabled={gameStatus !== 'playing' || player.id !== currentPlayerId} // Only current player can call STOP for themselves
                  title={player.id !== currentPlayerId ? "You can only call STOP for yourself" : "Call STOP"}
                >
                  <Hand className="mr-2 h-4 w-4" /> Call STOP
                </Button>
                <StopAdvisorDialog 
                  currentPlayer={player} 
                  otherPlayers={getOtherPlayers(player.id)}
                  cardsRemainingInDeck={cardsRemainingInDeck}
                  cardsInDiscardPile={cardsInDiscardPile}
                  triggerButton={
                     <Button variant="outline" className="flex-grow" disabled={player.id !== currentPlayerId}>
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
