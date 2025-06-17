"use client";
import { getStopAdvice } from '@/ai/flows/stop-advisor';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Brain, Lightbulb, ThumbsUp, ThumbsDown } from 'lucide-react'; // Removed AlertTriangle
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
export function StopAdvisorDialog({ currentPlayer, otherPlayers, cardsRemainingInDeck, cardsInDiscardPile, triggerButton }) {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [advice, setAdvice] = useState(null);
    // State now only for fields managed purely within this dialog's form
    const [dialogFormState, setDialogFormState] = useState({
        myEstimatedScore: currentPlayer.totalScore,
    });
    const { toast } = useToast();
    // Update estimated score if currentPlayer.totalScore changes while dialog is closed
    useEffect(() => {
        if (!isOpen) {
            setDialogFormState({ myEstimatedScore: currentPlayer.totalScore });
        }
    }, [currentPlayer.totalScore, isOpen]);
    const handleInputChange = (e) => {
        const { name, value } = e.target; // name will be 'myEstimatedScore'
        setDialogFormState(prev => (Object.assign(Object.assign({}, prev), { [name]: parseInt(value, 10) || 0 })));
    };
    const handleSubmit = async () => {
        var _a;
        setIsLoading(true);
        setAdvice(null);
        try {
            const fullStopAdviceInput = {
                myEstimatedScore: (_a = dialogFormState.myEstimatedScore) !== null && _a !== void 0 ? _a : currentPlayer.totalScore,
                opponentScores: otherPlayers.map(p => p.totalScore),
                cardsRemainingInDeck: cardsRemainingInDeck, // Use prop
                cardsInDiscardPile: cardsInDiscardPile, // Use prop
            };
            const result = await getStopAdvice(fullStopAdviceInput);
            setAdvice(result);
        }
        catch (error) {
            console.error("Error getting AI advice:", error);
            toast({
                title: "Error",
                description: "Failed to get AI advice. Please try again.",
                variant: "destructive",
            });
        }
        finally {
            setIsLoading(false);
        }
    };
    const defaultTrigger = (<Button variant="outline" size="sm">
      <Brain className="mr-2 h-4 w-4"/> Get AI Advice
    </Button>);
    const onOpenChange = (open) => {
        setIsOpen(open);
        if (open) {
            setAdvice(null); // Clear previous advice
            // Reset estimated score to current player's total score when dialog opens
            setDialogFormState({ myEstimatedScore: currentPlayer.totalScore });
        }
    };
    return (<Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        {triggerButton || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px] bg-card">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center font-headline">
            <Lightbulb className="mr-2 h-6 w-6 text-primary"/> AI Stop Advisor
          </DialogTitle>
          <DialogDescription className="font-body">
            Get advice on whether to call "STOP".
            Your current total score is {currentPlayer.totalScore}. 
            Deck: {cardsRemainingInDeck}, Discard: {cardsInDiscardPile}.
          </DialogDescription>
        </DialogHeader>
        
        {!advice && (<div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="myEstimatedScore">Your Estimated Score (if you stop now)</Label>
              <Input id="myEstimatedScore" name="myEstimatedScore" // Ensure name matches the key in dialogFormState
         type="number" value={dialogFormState.myEstimatedScore} onChange={handleInputChange} className="text-base"/>
            </div>
            {/* Input fields for cardsRemainingInDeck and cardsInDiscardPile are removed
                as they are now passed as props and managed in GameBoard.tsx */}
          </div>)}

        {isLoading && <p className="text-center py-4 text-muted-foreground">Getting advice...</p>}

        {advice && (<Card className="my-4 bg-background shadow-inner">
            <CardHeader>
              <CardTitle className={`text-xl flex items-center ${advice.shouldStop ? 'text-green-600' : 'text-red-600'}`}>
                {advice.shouldStop ? <ThumbsUp className="mr-2 h-5 w-5"/> : <ThumbsDown className="mr-2 h-5 w-5"/>}
                Recommendation: {advice.shouldStop ? "Call STOP" : "DO NOT Call STOP"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-semibold">Reasoning:</p>
              <p className="text-sm text-muted-foreground">{advice.reasoning}</p>
            </CardContent>
          </Card>)}
        
        <DialogFooter>
          {!advice && (<Button onClick={handleSubmit} disabled={isLoading} className="bg-primary hover:bg-primary/90">
              {isLoading ? "Analyzing..." : "Get Advice"}
            </Button>)}
          {advice && (<Button onClick={() => setAdvice(null)} variant="outline">Ask Again</Button>)}
          <Button variant="ghost" onClick={() => setIsOpen(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>);
}
