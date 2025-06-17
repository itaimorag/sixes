"use strict";
"use client";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameBoard = GameBoard;
const react_1 = require("react");
const image_1 = __importDefault(require("next/image"));
const Scoreboard_1 = require("./Scoreboard");
const RoundScoreForm_1 = require("./RoundScoreForm");
const button_1 = require("@/components/ui/button");
const use_toast_1 = require("@/hooks/use-toast");
const game_logic_1 = require("@/lib/game-logic");
const card_1 = require("@/components/ui/card");
const lucide_react_1 = require("lucide-react");
const CardDisplay_1 = require("./CardDisplay");
const card_utils_1 = require("@/lib/card-utils");
// Helper functions for card names
const SUITS_MAP = {
    S: "Spades",
    H: "Hearts",
    D: "Diamonds",
    C: "Clubs",
};
const RANKS_MAP = {
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
};
const SUIT_SYMBOLS = {
    S: "♠",
    H: "♥",
    D: "♦",
    C: "♣",
};
const RANK_SYMBOLS = {
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
};
function getRankName(rank) {
    return RANKS_MAP[rank];
}
function getSuitName(suit) {
    return SUITS_MAP[suit];
}
function PlayerHandsDisplay({ players, currentPlayerId, }) {
    return (<card_1.Card className="shadow-lg">
      <card_1.CardHeader>
        <card_1.CardTitle className="text-2xl flex items-center">
          <lucide_react_1.Shuffle className="mr-2 h-7 w-7 text-primary"/>
          Player Hands
        </card_1.CardTitle>
        <card_1.CardDescription>
          Each player has 6 cards. Your cards are shown face up. Others are face
          down.
        </card_1.CardDescription>
      </card_1.CardHeader>
      <card_1.CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {players.map((player) => (<div key={player.id} className="p-4 border rounded-lg bg-card/50">
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
                return (<image_1.default key={card.id} src={cardImageSrc} alt={cardAltText} width={70} // Updated card width
                 height={100} // Updated card height
                 className="rounded shadow-md" data-ai-hint={dataAiHint}/>);
            })}
                {(!player.hand || player.hand.length === 0) &&
                Array.from({ length: 6 }).map((_, i) => (<image_1.default key={`empty-${player.id}-${i}`} src="https://placehold.co/70x100.png" alt="Face-down card placeholder" width={70} height={100} className="rounded shadow-md opacity-50" data-ai-hint="card back"/>))}
              </div>
            </div>))}
        </div>
        <card_1.Card className="mt-6 bg-primary/10 border-primary/30">
          <card_1.CardHeader>
            <card_1.CardTitle className="text-xl flex items-center">
              <lucide_react_1.HelpCircle className="mr-2 h-6 w-6 text-primary"/>
              Next Steps (Multiplayer)
            </card_1.CardTitle>
          </card_1.CardHeader>
          <card_1.CardContent className="text-sm text-muted-foreground space-y-1">
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
          </card_1.CardContent>
        </card_1.Card>
      </card_1.CardContent>
    </card_1.Card>);
}
const SUITS = ["S", "H", "D", "C"];
const RANKS = [
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
function createStandard52Deck() {
    const deck = [];
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
const isCardPlayable = (card, topCard) => {
    return card.rank === topCard.rank || card.suit === topCard.suit;
};
function GameBoard({ initialPlayers, onNewGame, currentPlayerId, }) {
    const [gameState, setGameState] = (0, react_1.useState)({
        players: initialPlayers,
        currentPlayerIndex: 0,
        deck: [],
        discardPile: [],
        gameStatus: "waiting",
        roundNumber: 1,
        roundStatus: "playing",
        lastAction: null,
    });
    const { toast } = (0, use_toast_1.useToast)();
    (0, react_1.useEffect)(() => {
        // Initialize the game with a shuffled deck
        const deck = (0, card_utils_1.shuffleDeck)((0, card_utils_1.createDeck)());
        const updatedPlayers = initialPlayers.map((player) => (Object.assign(Object.assign({}, player), { hand: deck.splice(0, 6), hasSwappedTopRow: false, hasViewedBottomRow: false })));
        // Initialize garbage pile with the top card
        const topCard = deck.splice(0, 1)[0];
        setGameState((prev) => (Object.assign(Object.assign({}, prev), { players: updatedPlayers, deck, discardPile: [topCard], gameStatus: "playing" })));
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
        setGameState((prev) => (Object.assign(Object.assign({}, prev), { deck: prev.deck.slice(1), lastAction: "draw" })));
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
        setGameState((prev) => (Object.assign(Object.assign({}, prev), { deck: [newCard, ...prev.deck], discardPile: prev.discardPile.slice(0, -1), lastAction: "draw" })));
    };
    const handleCardClick = (index) => {
        if (gameState.deck.length === 0) {
            toast({
                title: "No card drawn",
                description: "You must draw a card first!",
                variant: "destructive",
            });
            return;
        }
        const player = gameState.players[gameState.currentPlayerIndex];
        if (!player)
            return;
        const isBottomRow = index < 3;
        if (isBottomRow && player.hasSwappedTopRow) {
            toast({
                title: "Invalid move",
                description: "You can't swap bottom row cards after starting to swap top row cards!",
                variant: "destructive",
            });
            return;
        }
        // Swap the card
        const newHand = [...player.hand];
        const discardedCard = newHand[index];
        newHand[index] = gameState.deck[0];
        // Update player's hand and track if they've started swapping top row
        const updatedPlayers = gameState.players.map((p, i) => {
            if (i === gameState.currentPlayerIndex) {
                return Object.assign(Object.assign({}, p), { hand: newHand, hasSwappedTopRow: p.hasSwappedTopRow || !isBottomRow });
            }
            return p;
        });
        setGameState((prev) => (Object.assign(Object.assign({}, prev), { players: updatedPlayers, discardPile: [...prev.discardPile, discardedCard], deck: prev.deck.slice(1), lastAction: "swap" })));
    };
    const handleDiscardDrawnCard = () => {
        if (gameState.deck.length === 0)
            return;
        const newCard = gameState.deck[0];
        setGameState((prev) => (Object.assign(Object.assign({}, prev), { discardPile: [...prev.discardPile, newCard], deck: prev.deck.slice(1), lastAction: "discard" })));
    };
    const handleViewBottomRow = () => {
        setGameState((prev) => (Object.assign(Object.assign({}, prev), { players: prev.players.map((p, i) => {
                if (i === gameState.currentPlayerIndex) {
                    return Object.assign(Object.assign({}, p), { hasViewedBottomRow: true });
                }
                return p;
            }), lastAction: "view" })));
    };
    const handleCallStop = () => {
        if (gameState.gameStatus === "playing") {
            setGameState((prev) => (Object.assign(Object.assign({}, prev), { players: prev.players.map((p, i) => {
                    if (i === gameState.currentPlayerIndex) {
                        return Object.assign(Object.assign({}, p), { isStopper: true });
                    }
                    return p;
                }), gameStatus: "final_round", lastAction: "stop" })));
            toast({
                title: "STOP called!",
                description: "This is the final round!",
            });
        }
    };
    const handleScoresSubmit = (roundScores) => {
        var _a;
        const updatedPlayers = gameState.players.map((player) => {
            const scoreForRound = roundScores[player.id];
            if (scoreForRound === undefined)
                return player;
            return Object.assign(Object.assign({}, player), { scoresByRound: [...player.scoresByRound, scoreForRound], totalScore: player.totalScore + scoreForRound });
        });
        if (gameState.gameStatus === "final_round") {
            const finalPlayersWithBonuses = (0, game_logic_1.applyStopBonusesAndPenalties)(updatedPlayers, ((_a = updatedPlayers.find((p) => p.isStopper)) === null || _a === void 0 ? void 0 : _a.id) || "");
            setGameState((prev) => (Object.assign(Object.assign({}, prev), { players: finalPlayersWithBonuses, gameStatus: "game_over", lastAction: "scores" })));
            const winner = finalPlayersWithBonuses.reduce((prev, curr) => curr.totalScore < prev.totalScore ? curr : prev);
            toast({
                title: "Game Over!",
                description: `${winner.name} wins with ${winner.totalScore} points!`,
            });
        }
        else {
            setGameState((prev) => (Object.assign(Object.assign({}, prev), { players: updatedPlayers, roundNumber: prev.roundNumber + 1, lastAction: "scores" })));
            toast({
                title: `Round ${gameState.roundNumber} Complete!`,
                description: `Scores updated. Moving to Round ${gameState.roundNumber + 1}.`,
            });
        }
    };
    if (gameState.gameStatus === "game_over") {
        const winner = gameState.players.reduce((prev, curr) => (curr.totalScore < prev.totalScore ? curr : prev), gameState.players[0]);
        return (<div className="space-y-6">
        <Scoreboard_1.Scoreboard players={gameState.players} currentRound={gameState.roundNumber - 1}/>
        <card_1.Card className="text-center shadow-xl bg-gradient-to-r from-primary to-accent text-primary-foreground">
          <card_1.CardHeader>
            <card_1.CardTitle className="text-4xl flex items-center justify-center">
              <lucide_react_1.PartyPopper className="mr-3 h-10 w-10"/> Game Over!
            </card_1.CardTitle>
          </card_1.CardHeader>
          <card_1.CardContent className="space-y-2">
            <p className="text-2xl font-semibold">
              {winner
                ? `${winner.name} is the winner with ${winner.totalScore} points!`
                : "Scores are final!"}
            </p>
            <button_1.Button onClick={onNewGame} size="lg" variant="secondary" className="text-lg">
              <lucide_react_1.RotateCcw className="mr-2 h-5 w-5"/> Start New Game
            </button_1.Button>
          </card_1.CardContent>
        </card_1.Card>
      </div>);
    }
    const currentPlayer = gameState.players.find((p) => p.id === currentPlayerId);
    return (<div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Sixes Card Game</h1>
        <button_1.Button onClick={onNewGame}>New Game</button_1.Button>
      </div>

      {/* Deck and Discard Pile Display */}
      <div className="flex justify-center items-center gap-12 mb-8">
        {/* Main Deck (facing backwards) */}
        <div className="flex flex-col items-center">
          <image_1.default src={CARD_BACK_IMAGE} alt="Deck (face down)" width={80} height={100} className="rounded shadow-md"/>
          <span className="mt-2 text-sm text-muted-foreground">
            Deck ({gameState.deck.length})
          </span>
        </div>
        {/* Discard/Garbage Pile */}
        <div className="flex flex-col items-center">
          {gameState.discardPile.length > 0 ? (<image_1.default src={gameState.discardPile[gameState.discardPile.length - 1].imageSrc} alt="Top of Discard Pile" width={80} height={100} className="rounded shadow-md"/>) : (<div className="w-[80px] h-[100px] rounded shadow-md bg-muted flex items-center justify-center text-muted-foreground">
              Empty
            </div>)}
          <span className="mt-2 text-sm text-muted-foreground">
            Discard ({gameState.discardPile.length})
          </span>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {gameState.players.map((player) => (<card_1.Card key={player.id} className="p-4">
            <card_1.CardHeader>
              <card_1.CardTitle className="text-xl">
                {player.name}'s Hand{" "}
                {player.id === currentPlayerId ? "(Your Hand)" : ""}
              </card_1.CardTitle>
            </card_1.CardHeader>
            <card_1.CardContent>
              <CardDisplay_1.PlayerHand cards={player.hand} isCurrentPlayer={player.id === currentPlayerId} hasViewedBottomRow={!player.hasViewedBottomRow} hasSwappedTopRow={player.hasSwappedTopRow} onCardClick={player.id === currentPlayerId ? handleCardClick : undefined}/>
            </card_1.CardContent>
          </card_1.Card>))}
      </div>

      {currentPlayer && !currentPlayer.hasViewedBottomRow && (<card_1.Card className="bg-accent/10">
          <card_1.CardContent className="p-4">
            <button_1.Button onClick={handleViewBottomRow} className="w-full">
              View Bottom Row Cards
            </button_1.Button>
          </card_1.CardContent>
        </card_1.Card>)}

      {currentPlayer && currentPlayer.hasViewedBottomRow && (<card_1.Card>
          <card_1.CardHeader>
            <card_1.CardTitle>Your Turn</card_1.CardTitle>
          </card_1.CardHeader>
          <card_1.CardContent className="space-y-4">
            <div className="flex gap-4">
              <button_1.Button onClick={handleDrawFromDeck} disabled={!!gameState.deck.length}>
                Draw from Deck ({gameState.deck.length})
              </button_1.Button>
              <button_1.Button onClick={handleDrawFromDiscard} disabled={!!gameState.deck.length}>
                Draw from Discard ({gameState.discardPile.length})
              </button_1.Button>
            </div>

            {gameState.deck.length > 0 && (<div className="space-y-4">
                <div className="flex justify-center">
                  <CardDisplay_1.PlayerHand cards={gameState.deck.slice(0, 3)} isCurrentPlayer={true} hasViewedBottomRow={true} hasSwappedTopRow={true}/>
                </div>
                <div className="flex justify-center gap-4">
                  <button_1.Button onClick={handleDiscardDrawnCard} variant="outline">
                    Discard Card
                  </button_1.Button>
                </div>
              </div>)}

            <div className="flex justify-center">
              <button_1.Button onClick={handleCallStop} variant="destructive" disabled={gameState.gameStatus !== "playing"}>
                Call STOP
              </button_1.Button>
            </div>
          </card_1.CardContent>
        </card_1.Card>)}

      <Scoreboard_1.Scoreboard players={gameState.players} currentRound={gameState.roundNumber}/>

      {(gameState.gameStatus === "playing" ||
            gameState.gameStatus === "final_round") && (<RoundScoreForm_1.RoundScoreForm players={gameState.players} currentRound={gameState.roundNumber} onSubmitScores={handleScoresSubmit} isFinalRound={gameState.gameStatus === "final_round"}/>)}
    </div>);
}
