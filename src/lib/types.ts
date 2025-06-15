
import type { StopAdviceInput } from '@/ai/flows/stop-advisor';

export type Suit = 'S' | 'H' | 'D' | 'C'; // Spades, Hearts, Diamonds, Clubs
export type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | 'T' | 'J' | 'Q' | 'K'; // Ace, 2-10, Jack, Queen, King (T for Ten)

export interface Card {
  id: string; // Unique identifier for the card instance
  suit: Suit | 'JOKER'; // JOKER for jokers
  rank: Rank | 'JOKER'; // JOKER for jokers
  name: string; // e.g., "Ace of Spades", "Joker"
  imageSrc: string; // URL to the card's front image
}

export interface Player {
  id: string;
  name: string;
  scoresByRound: number[];
  totalScore: number;
  isStopper: boolean; // Indicates if this player called STOP
  hand: Card[]; // Player's current hand of cards
}

export type GameState = 'setup' | 'player_selection' | 'playing' | 'final_round' | 'game_over';

// State for the form within the StopAdvisorDialog
export interface StopAdvisorDialogFormState {
  myEstimatedScore?: number; // Optional, can be pre-filled
}

// This type was previously AIAdviceDialogInput and included deck/discard counts.
// Those are now managed in GameBoard and passed as props to StopAdvisorDialog.
// Retaining a similar structure for what the dialog itself manages internally for its form.
export type AIAdviceDialogInput = StopAdvisorDialogFormState;
