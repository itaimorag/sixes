"use client";

import type {
  Player,
  Card as CardType,
  Suit,
  Rank,
  GameState,
  RoundStatusType,
  GameActionType,
} from "@/lib/types";
import { useState, useEffect } from "react";
import Image from "next/image";
import { Scoreboard } from "./Scoreboard";
import { RoundScoreForm } from "./RoundScoreForm";
import { StopAdvisorDialog } from "./StopAdvisorDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  calculateNewTotalScore,
  applyStopBonusesAndPenalties,
} from "@/lib/game-logic";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Hand,
  Brain,
  RotateCcw,
  PartyPopper,
  Users,
  CheckSquare,
  Layers,
  Shuffle,
  HelpCircle,
} from "lucide-react";
import { PlayerHand } from "./CardDisplay";
import { createDeck, calculateHandScore, shuffleDeck } from "@/lib/card-utils";
import { cn } from "@/lib/utils";
import { CardDisplay } from "./CardDisplay";

// Helper functions for card names
const SUITS_MAP: Record<Suit, string> = {
  S: "Spades",
  H: "Hearts",
  D: "Diamonds",
  C: "Clubs",
} as const;

const RANKS_MAP: Record<Rank, string> = {
  A: "Ace",
  K: "King",
  Q: "Queen",
  J: "Jack",
  T: "Ten",
  "9": "9",
  "8": "8",
  "7": "7",
  "6": "6",
  "5": "5",
  "4": "4",
  "3": "3",
  "2": "2",
} as const;

const SUIT_SYMBOLS: Record<Suit, string> = {
  S: "♠",
  H: "♥",
  D: "♦",
  C: "♣",
} as const;

const RANK_SYMBOLS: Record<Rank, string> = {
  A: "A",
  K: "K",
  Q: "Q",
  J: "J",
  T: "10",
  "9": "9",
  "8": "8",
  "7": "7",
  "6": "6",
  "5": "5",
  "4": "4",
  "3": "3",
  "2": "2",
} as const;

function getRankName(rank: Rank): string {
  return RANKS_MAP[rank];
}

function getSuitName(suit: Suit): string {
  return SUITS_MAP[suit];
}

interface PlayerHandDisplayProps {
  players: Player[];
  currentPlayerId: string | null;
}

function PlayerHandsDisplay({
  players,
  currentPlayerId,
}: PlayerHandDisplayProps) {
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center">
          <Shuffle className="mr-2 h-7 w-7 text-primary" />
          Player Hands
        </CardTitle>
        <CardDescription>
          Each player has 6 cards. Your cards are shown face up. Others are face
          down.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {players.map((player) => (
            <div key={player.id} className="p-4 border rounded-lg bg-card/50">
              <h3 className="text-lg font-semibold text-primary mb-2">
                {player.name}'s Hand{" "}
                {player.id === currentPlayerId ? "(Your Hand)" : ""}
              </h3>
              <div className="flex flex-wrap gap-2">
                {(player.hand || []).map((card, i) => {
                  const isCurrentPlayerCard = player.id === currentPlayerId;
                  // For current player, use card.imageSrc (placeholder for now). For others, use a generic card back.
                  const cardImageSrc = isCurrentPlayerCard
                    ? card.imageSrc
                    : "https://placehold.co/70x100.png";
                  const cardAltText = isCurrentPlayerCard
                    ? card.name
                    : `${player.name}'s face-down card ${i + 1}`;

                  let dataAiHint = "card back";
                  if (isCurrentPlayerCard) {
                    // Ensure two words max for data-ai-hint
                    const rankHint = getRankName(card.rank)
                      .toLowerCase()
                      .split(" ")[0];
                    const suitHint = getSuitName(card.suit)
                      .toLowerCase()
                      .split(" ")[0];
                    dataAiHint = `${rankHint} ${suitHint}`.trim();
                    if (dataAiHint.split(" ").length > 2) {
                      // Fallback if somehow more than 2 words
                      dataAiHint = rankHint;
                    }
                  }

                  return (
                    <Image
                      key={card.id}
                      src={cardImageSrc}
                      alt={cardAltText}
                      width={70} // Updated card width
                      height={100} // Updated card height
                      className="rounded shadow-md"
                      data-ai-hint={dataAiHint}
                    />
                  );
                })}
                {(!player.hand || player.hand.length === 0) &&
                  Array.from({ length: 6 }).map((_, i) => (
                    <Image
                      key={`empty-${player.id}-${i}`}
                      src="https://placehold.co/70x100.png"
                      alt="Face-down card placeholder"
                      width={70}
                      height={100}
                      className="rounded shadow-md opacity-50"
                      data-ai-hint="card back"
                    />
                  ))}
              </div>
            </div>
          ))}
        </div>
        <Card className="mt-6 bg-primary/10 border-primary/30">
          <CardHeader>
            <CardTitle className="text-xl flex items-center">
              <HelpCircle className="mr-2 h-6 w-6 text-primary" />
              Next Steps (Multiplayer)
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-1">
            <p>
              Card display is set up for individual player views using
              placeholder images. You'll need to replace the `imageSrc` in
              `createDeck` with actual URLs to your card images.
            </p>
            <p>
              To continue with multiplayer, you'll need to implement backend
              WebSocket logic for:
            </p>
            <ul className="list-disc list-inside pl-4">
              <li>Managing turns.</li>
              <li>Handling card drawing (from deck or discard pile).</li>
              <li>Handling card discarding.</li>
              <li>Synchronizing these actions across all players.</li>
            </ul>
            <p className="mt-2">
              For now, you can proceed with score entry for rounds.
            </p>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
}

interface GameBoardProps {
  initialPlayers: Player[];
  onNewGame: () => void;
  currentPlayerId: string;
}

const SUITS: Suit[] = ["S", "H", "D", "C"];
const RANKS: Rank[] = [
  "A",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "T",
  "J",
  "Q",
  "K",
];

// Update the card back image path
const CARD_BACK_IMAGE = "/assets/playing-card-back.png";

// Generates a standard 52-card deck
function createStandard52Deck(): CardType[] {
  const deck: CardType[] = [];
  let cardCount = 0;
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      cardCount++;
      const cardName = `${getRankName(rank)} of ${getSuitName(suit)}`;
      deck.push({
        // id: `${suit}${rank}-${cardCount}`, // Simpler ID for unique card type
        id: `card-${suit}${rank}-${Date.now()}-${Math.random()
          .toString(36)
          .substring(7)}`, // Unique ID for card instance
        suit,
        rank,
        name: cardName,
        // Replace this placeholder with your actual image URL for each card
        imageSrc: `https://placehold.co/70x100.png`,
      });
    }
  }
  return deck;
}

/*
// Optional: For a full Sixes game, you'd typically use 108 cards (2 standard decks + 4 Jokers)
// You can adapt this function if you want to use 108 cards.
function createSixesDeck(): CardType[] {
  const deck1 = createStandard52Deck().map(card => ({...card, id: `deck1-${card.id}`})); // Ensure unique IDs
  const deck2 = createStandard52Deck().map(card => ({...card, id: `deck2-${card.id}`})); // Ensure unique IDs
  const jokers: CardType[] = Array.from({ length: 4 }, (_, i) => ({
    id: `JOKER${i + 1}-${Date.now()}-${Math.random().toString(36).substring(7)}`,
    suit: 'JOKER',
    rank: 'JOKER',
    name: `Joker ${i + 1}`,
    // Replace this placeholder with your actual image URL for Jokers
    imageSrc: `https://placehold.co/70x100.png`, 
  }));
  return [...deck1, ...deck2, ...jokers]; // 104 + 4 = 108 cards
}
*/

// Shuffles a deck of cards
// function shuffleDeck(deck: CardType[]): CardType[] {
//   const shuffled = [...deck];
//   for (let i = shuffled.length - 1; i > 0; i--) {
//     const j = Math.floor(Math.random() * (i + 1));
//     [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
//   }
//   return shuffled;
// }

const isCardPlayable = (card: CardType, topCard: CardType): boolean => {
  return card.rank === topCard.rank || card.suit === topCard.suit;
};

export function GameBoard({
  initialPlayers,
  onNewGame,
  currentPlayerId,
}: GameBoardProps) {
  const [gameState, setGameState] = useState<GameState>({
    players: initialPlayers,
    currentPlayerIndex: 0,
    deck: [],
    discardPile: [],
    gameStatus: "waiting",
    roundNumber: 1,
    roundStatus: "playing",
    lastAction: null,
  });
  const { toast } = useToast();

  useEffect(() => {
    // Initialize the game with a shuffled deck
    const deck = shuffleDeck(createDeck());
    const updatedPlayers = initialPlayers.map((player) => ({
      ...player,
      hand: deck.splice(0, 6),
      hasSwappedTopRow: false,
      hasViewedBottomRow: false,
    }));

    // Initialize garbage pile with the top card
    const topCard = deck.splice(0, 1)[0];
    setGameState((prev) => ({
      ...prev,
      players: updatedPlayers,
      deck,
      discardPile: [topCard],
      gameStatus: "playing",
    }));
  }, [initialPlayers]);

  const handleDrawFromDeck = () => {
    if (gameState.deck.length === 0) {
      toast({
        title: "No cards left",
        description: "The deck is empty!",
        variant: "destructive",
      });
      return;
    }

    const newCard = gameState.deck[0];
    setGameState((prev) => ({
      ...prev,
      deck: prev.deck.slice(1),
      lastAction: "draw",
    }));
  };

  const handleDrawFromDiscard = () => {
    if (gameState.discardPile.length === 0) {
      toast({
        title: "No cards in discard pile",
        description: "The discard pile is empty!",
        variant: "destructive",
      });
      return;
    }

    const newCard = gameState.discardPile[gameState.discardPile.length - 1];
    setGameState((prev) => ({
      ...prev,
      deck: [newCard, ...prev.deck],
      discardPile: prev.discardPile.slice(0, -1),
      lastAction: "draw",
    }));
  };

  const handleCardClick = (index: number) => {
    if (gameState.deck.length === 0) {
      toast({
        title: "No card drawn",
        description: "You must draw a card first!",
        variant: "destructive",
      });
      return;
    }

    const player = gameState.players[gameState.currentPlayerIndex];
    if (!player) return;

    const isBottomRow = index < 3;
    if (isBottomRow && player.hasSwappedTopRow) {
      toast({
        title: "Invalid move",
        description:
          "You can't swap bottom row cards after starting to swap top row cards!",
        variant: "destructive",
      });
      return;
    }

    // Swap the card
    const newHand = [...player.hand];
    const discardedCard = newHand[index];
    newHand[index] = gameState.deck[0];

    // Update player's hand and track if they've started swapping top row
    const updatedPlayers = gameState.players.map((p: Player, i: number) => {
      if (i === gameState.currentPlayerIndex) {
        return {
          ...p,
          hand: newHand,
          hasSwappedTopRow: p.hasSwappedTopRow || !isBottomRow,
        };
      }
      return p;
    });

    setGameState((prev: GameState) => ({
      ...prev,
      players: updatedPlayers,
      discardPile: [...prev.discardPile, discardedCard],
      deck: prev.deck.slice(1),
      lastAction: "swap",
    }));
  };

  const handleDiscardDrawnCard = () => {
    if (gameState.deck.length === 0) return;
    const newCard = gameState.deck[0];
    setGameState((prev: GameState) => ({
      ...prev,
      discardPile: [...prev.discardPile, newCard],
      deck: prev.deck.slice(1),
      lastAction: "discard",
    }));
  };

  const handleViewBottomRow = () => {
    setGameState((prev: GameState) => ({
      ...prev,
      players: prev.players.map((p: Player, i: number) => {
        if (i === gameState.currentPlayerIndex) {
          return { ...p, hasViewedBottomRow: true };
        }
        return p;
      }),
      lastAction: "view",
    }));
  };

  const handleCallStop = () => {
    if (gameState.gameStatus === "playing") {
      setGameState((prev: GameState) => ({
        ...prev,
        players: prev.players.map((p: Player, i: number) => {
          if (i === gameState.currentPlayerIndex) {
            return {
              ...p,
              isStopper: true,
            };
          }
          return p;
        }),
        gameStatus: "final_round",
        lastAction: "stop",
      }));
      toast({
        title: "STOP called!",
        description: "This is the final round!",
      });
    }
  };

  const handleScoresSubmit = (roundScores: Record<string, number>) => {
    const updatedPlayers = gameState.players.map((player: Player) => {
      const scoreForRound = roundScores[player.id];
      if (scoreForRound === undefined) return player;

      return {
        ...player,
        scoresByRound: [...player.scoresByRound, scoreForRound],
        totalScore: player.totalScore + scoreForRound,
      };
    });

    if (gameState.gameStatus === "final_round") {
      const finalPlayersWithBonuses = applyStopBonusesAndPenalties(
        updatedPlayers,
        updatedPlayers.find((p) => p.isStopper)?.id || ""
      );
      setGameState((prev: GameState) => ({
        ...prev,
        players: finalPlayersWithBonuses,
        gameStatus: "game_over",
        lastAction: "scores",
      }));
      const winner = finalPlayersWithBonuses.reduce((prev, curr) =>
        curr.totalScore < prev.totalScore ? curr : prev
      );
      toast({
        title: "Game Over!",
        description: `${winner.name} wins with ${winner.totalScore} points!`,
      });
    } else {
      setGameState((prev: GameState) => ({
        ...prev,
        players: updatedPlayers,
        roundNumber: prev.roundNumber + 1,
        lastAction: "scores",
      }));
      toast({
        title: `Round ${gameState.roundNumber} Complete!`,
        description: `Scores updated. Moving to Round ${
          gameState.roundNumber + 1
        }.`,
      });
    }
  };

  if (gameState.gameStatus === "game_over") {
    const winner = gameState.players.reduce(
      (prev, curr) => (curr.totalScore < prev.totalScore ? curr : prev),
      gameState.players[0]
    );
    return (
      <div className="space-y-6">
        <Scoreboard
          players={gameState.players}
          currentRound={gameState.roundNumber - 1}
        />
        <Card className="text-center shadow-xl bg-gradient-to-r from-primary to-accent text-primary-foreground">
          <CardHeader>
            <CardTitle className="text-4xl flex items-center justify-center">
              <PartyPopper className="mr-3 h-10 w-10" /> Game Over!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-2xl font-semibold">
              {winner
                ? `${winner.name} is the winner with ${winner.totalScore} points!`
                : "Scores are final!"}
            </p>
            <Button
              onClick={onNewGame}
              size="lg"
              variant="secondary"
              className="text-lg"
            >
              <RotateCcw className="mr-2 h-5 w-5" /> Start New Game
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentPlayer = gameState.players.find((p) => p.id === currentPlayerId);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Sixes Card Game</h1>
        <Button onClick={onNewGame}>New Game</Button>
      </div>

      {/* Deck and Discard Pile Display */}
      <div className="flex justify-center items-center gap-12 mb-8">
        {/* Main Deck (facing backwards) */}
        <div className="flex flex-col items-center">
          <Image
            src={CARD_BACK_IMAGE}
            alt="Deck (face down)"
            width={80}
            height={100}
            className="rounded shadow-md"
          />
          <span className="mt-2 text-sm text-muted-foreground">
            Deck ({gameState.deck.length})
          </span>
        </div>
        {/* Discard/Garbage Pile */}
        <div className="flex flex-col items-center">
          {gameState.discardPile.length > 0 ? (
            <Image
              src={
                gameState.discardPile[gameState.discardPile.length - 1].imageSrc
              }
              alt="Top of Discard Pile"
              width={80}
              height={100}
              className="rounded shadow-md"
            />
          ) : (
            <div className="w-[80px] h-[100px] rounded shadow-md bg-muted flex items-center justify-center text-muted-foreground">
              Empty
            </div>
          )}
          <span className="mt-2 text-sm text-muted-foreground">
            Discard ({gameState.discardPile.length})
          </span>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {gameState.players.map((player) => (
          <Card key={player.id} className="p-4">
            <CardHeader>
              <CardTitle className="text-xl">
                {player.name}'s Hand{" "}
                {player.id === currentPlayerId ? "(Your Hand)" : ""}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <PlayerHand
                cards={player.hand}
                isCurrentPlayer={player.id === currentPlayerId}
                hasViewedBottomRow={!player.hasViewedBottomRow}
                hasSwappedTopRow={player.hasSwappedTopRow}
                onCardClick={
                  player.id === currentPlayerId ? handleCardClick : undefined
                }
              />
            </CardContent>
          </Card>
        ))}
      </div>

      {currentPlayer && !currentPlayer.hasViewedBottomRow && (
        <Card className="bg-accent/10">
          <CardContent className="p-4">
            <Button onClick={handleViewBottomRow} className="w-full">
              View Bottom Row Cards
            </Button>
          </CardContent>
        </Card>
      )}

      {currentPlayer && currentPlayer.hasViewedBottomRow && (
        <Card>
          <CardHeader>
            <CardTitle>Your Turn</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <Button
                onClick={handleDrawFromDeck}
                disabled={!!gameState.deck.length}
              >
                Draw from Deck ({gameState.deck.length})
              </Button>
              <Button
                onClick={handleDrawFromDiscard}
                disabled={!!gameState.deck.length}
              >
                Draw from Discard ({gameState.discardPile.length})
              </Button>
            </div>

            {gameState.deck.length > 0 && (
              <div className="space-y-4">
                <div className="flex justify-center">
                  <PlayerHand
                    cards={gameState.deck.slice(0, 3)}
                    isCurrentPlayer={true}
                    hasViewedBottomRow={true}
                    hasSwappedTopRow={true}
                  />
                </div>
                <div className="flex justify-center gap-4">
                  <Button onClick={handleDiscardDrawnCard} variant="outline">
                    Discard Card
                  </Button>
                </div>
              </div>
            )}

            <div className="flex justify-center">
              <Button
                onClick={handleCallStop}
                variant="destructive"
                disabled={gameState.gameStatus !== "playing"}
              >
                Call STOP
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Scoreboard
        players={gameState.players}
        currentRound={gameState.roundNumber}
      />

      {(gameState.gameStatus === "playing" ||
        gameState.gameStatus === "final_round") && (
        <RoundScoreForm
          players={gameState.players}
          currentRound={gameState.roundNumber}
          onSubmitScores={handleScoresSubmit}
          isFinalRound={gameState.gameStatus === "final_round"}
        />
      )}
    </div>
  );
}
