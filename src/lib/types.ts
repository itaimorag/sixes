import type { StopAdviceInput } from '@/ai/flows/stop-advisor';

export interface Player {
  id: string;
  name: string;
  scoresByRound: number[];
  totalScore: number;
  isStopper: boolean; // Indicates if this player called STOP
}

export type GameState = 'setup' | 'playing' | 'final_round' | 'game_over';

// Optional fields for AI advice input in dialog
export type AIAdviceDialogInput = Pick<StopAdviceInput, 'cardsRemainingInDeck' | 'cardsInDiscardPile'> & {
  myEstimatedScore?: number; // Optional, can be pre-filled
};
