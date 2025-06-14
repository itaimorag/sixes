"use client";

import type { AIAdviceDialogInput, Player } from '@/lib/types';
import { getStopAdvice, type StopAdviceOutput, type StopAdviceInput } from '@/ai/flows/stop-advisor';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Brain, AlertTriangle, Lightbulb, ThumbsUp, ThumbsDown } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface StopAdvisorDialogProps {
  currentPlayer: Player;
  otherPlayers: Player[];
  triggerButton?: React.ReactNode; // Optional custom trigger
}

export function StopAdvisorDialog({ currentPlayer, otherPlayers, triggerButton }: StopAdvisorDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [advice, setAdvice] = useState<StopAdviceOutput | null>(null);
  const [aiInput, setAiInput] = useState<AIAdviceDialogInput>({
    cardsRemainingInDeck: 26, // Default sensible value
    cardsInDiscardPile: 0,   // Default sensible value
    myEstimatedScore: currentPlayer.totalScore,
  });
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAiInput(prev => ({ ...prev, [name]: parseInt(value, 10) || 0 }));
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setAdvice(null);
    try {
      const fullStopAdviceInput: StopAdviceInput = {
        myEstimatedScore: aiInput.myEstimatedScore ?? currentPlayer.totalScore,
        opponentScores: otherPlayers.map(p => p.totalScore),
        cardsRemainingInDeck: aiInput.cardsRemainingInDeck,
        cardsInDiscardPile: aiInput.cardsInDiscardPile,
      };
      const result = await getStopAdvice(fullStopAdviceInput);
      setAdvice(result);
    } catch (error) {
      console.error("Error getting AI advice:", error);
      toast({
        title: "Error",
        description: "Failed to get AI advice. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const defaultTrigger = (
    <Button variant="outline" size="sm">
      <Brain className="mr-2 h-4 w-4" /> Get AI Advice
    </Button>
  );
  
  // Reset form when dialog opens/closes
  const onOpenChange = (open: boolean) => {
    setIsOpen(open);
    if(open) {
      setAdvice(null);
      setAiInput(prev => ({...prev, myEstimatedScore: currentPlayer.totalScore }));
    }
  }


  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        {triggerButton || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px] bg-card">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center font-headline">
            <Lightbulb className="mr-2 h-6 w-6 text-primary" /> AI Stop Advisor
          </DialogTitle>
          <DialogDescription className="font-body">
            Get advice on whether to call "STOP" based on the current game state.
            Your current total score is {currentPlayer.totalScore}.
          </DialogDescription>
        </DialogHeader>
        
        {!advice && (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="myEstimatedScore">Your Estimated Score (if you stop now)</Label>
              <Input
                id="myEstimatedScore"
                name="myEstimatedScore"
                type="number"
                value={aiInput.myEstimatedScore}
                onChange={handleInputChange}
                className="text-base"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cardsRemainingInDeck">Cards Remaining in Deck</Label>
              <Input
                id="cardsRemainingInDeck"
                name="cardsRemainingInDeck"
                type="number"
                value={aiInput.cardsRemainingInDeck}
                onChange={handleInputChange}
                className="text-base"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cardsInDiscardPile">Cards in Discard Pile</Label>
              <Input
                id="cardsInDiscardPile"
                name="cardsInDiscardPile"
                type="number"
                value={aiInput.cardsInDiscardPile}
                onChange={handleInputChange}
                className="text-base"
              />
            </div>
          </div>
        )}

        {isLoading && <p className="text-center py-4">Getting advice...</p>}

        {advice && (
          <Card className="my-4 bg-background shadow-inner">
            <CardHeader>
              <CardTitle className={`text-xl flex items-center ${advice.shouldStop ? 'text-green-600' : 'text-red-600'}`}>
                {advice.shouldStop ? <ThumbsUp className="mr-2 h-5 w-5" /> : <ThumbsDown className="mr-2 h-5 w-5" />}
                Recommendation: {advice.shouldStop ? "Call STOP" : "DO NOT Call STOP"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-semibold">Reasoning:</p>
              <p className="text-sm text-muted-foreground">{advice.reasoning}</p>
            </CardContent>
          </Card>
        )}
        
        <DialogFooter>
          {!advice && (
            <Button onClick={handleSubmit} disabled={isLoading} className="bg-primary hover:bg-primary/90">
              {isLoading ? "Analyzing..." : "Get Advice"}
            </Button>
          )}
          {advice && (
             <Button onClick={() => setAdvice(null)} variant="outline">Ask Again</Button>
          )}
          <Button variant="ghost" onClick={() => setIsOpen(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
