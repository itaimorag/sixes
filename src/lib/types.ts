import type { StopAdviceInput } from "@/ai/flows/stop-advisor";

export type Suit = "S" | "H" | "D" | "C";
export type Rank =
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "T"
  | "J"
  | "Q"
  | "K"
  | "A";

export interface Card {
  id: string;
  suit: Suit;
  rank: Rank;
  name: string;
  imageSrc: string;
}

export interface Player {
  id: string;
  name: string;
  scoresByRound: number[];
  totalScore: number;
  isStopper: boolean;
  hand: Card[];
  hasSwappedTopRow: boolean;
  hasViewedBottomRow: boolean;
  isClaimed?: boolean;
  drawnCard?: Card | null;
}

export type GameStatusType =
  | "waiting"
  | "playing"
  | "final_round"
  | "game_over";
export type RoundStatusType = "playing" | "scoring";
export type GameActionType =
  | "draw"
  | "swap"
  | "discard"
  | "view"
  | "stop"
  | "scores"
  | null;

export interface GameState {
  players: Player[];
  currentPlayerIndex: number;
  deck: Card[];
  discardPile: Card[];
  gameStatus: GameStatusType;
  roundNumber: number;
  roundStatus: RoundStatusType;
  lastAction: GameActionType;
}

// State for the form within the StopAdvisorDialog
export interface StopAdvisorDialogFormState {
  myEstimatedScore?: number; // Optional, can be pre-filled
}

// This type was previously AIAdviceDialogInput and included deck/discard counts.
// Those are now managed in GameBoard and passed as props to StopAdvisorDialog.
// Retaining a similar structure for what the dialog itself manages internally for its form.
export type AIAdviceDialogInput = StopAdvisorDialogFormState;

export interface GameAction {
  type:
    | "DRAW_FROM_DECK"
    | "DRAW_FROM_DISCARD"
    | "SWAP_CARD"
    | "DISCARD"
    | "CALL_STOP";
  playerId: string;
  cardId?: string;
  targetIndex?: number;
}

export interface GameContext {
  deck: Card[];
  discardPile: Card[];
  currentPlayerId: string | null;
  gameState: GameState;
  players: Player[];
  lastAction: GameAction | null;
}

export interface ServerToClientEvents {
  playerJoined: (players: Player[]) => void;
  gameStarted: (gameState: GameState) => void;
  playerClaimed: (players: Player[]) => void;
}

export interface ClientToServerEvents {
  joinGame: (roomId: string, player: Player) => void;
  startGame: () => void;
  addPlayer: (roomId: string, player: Player) => void;
  claimPlayer: (roomId: string, playerId: string) => void;
  viewBottomRow: () => void;
  drawFromDeck: () => void;
  drawFromDiscard: () => void;
  swapCard: (cardIndex: number) => void;
  callStop: () => void;
}
