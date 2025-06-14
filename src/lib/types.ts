import type { StopAdviceInput } from '@/ai/flows/stop-advisor';

export interface Player {
  id: string;
  name: string;
  scoresByRound: number[];
  totalScore: number;
  isStopper: boolean; // Indicates if this player called STOP
}

export type GameState = 'setup' | 'playing' | 'final_round' | 'game_over';

// State for the form within the StopAdvisorDialog
export interface StopAdvisorDialogFormState {
  myEstimatedScore?: number; // Optional, can be pre-filled
}

// This type was previously AIAdviceDialogInput and included deck/discard counts.
// Those are now managed in GameBoard and passed as props to StopAdvisorDialog.
// Retaining a similar structure for what the dialog itself manages internally for its form.
export type AIAdviceDialogInput = StopAdvisorDialogFormState;
