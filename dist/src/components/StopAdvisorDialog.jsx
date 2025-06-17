"use strict";
"use client";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StopAdvisorDialog = StopAdvisorDialog;
const stop_advisor_1 = require("@/ai/flows/stop-advisor");
const react_1 = require("react");
const button_1 = require("@/components/ui/button");
const dialog_1 = require("@/components/ui/dialog");
const input_1 = require("@/components/ui/input");
const label_1 = require("@/components/ui/label");
const use_toast_1 = require("@/hooks/use-toast");
const lucide_react_1 = require("lucide-react"); // Removed AlertTriangle
const card_1 = require("@/components/ui/card");
function StopAdvisorDialog({ currentPlayer, otherPlayers, cardsRemainingInDeck, cardsInDiscardPile, triggerButton }) {
    const [isOpen, setIsOpen] = (0, react_1.useState)(false);
    const [isLoading, setIsLoading] = (0, react_1.useState)(false);
    const [advice, setAdvice] = (0, react_1.useState)(null);
    // State now only for fields managed purely within this dialog's form
    const [dialogFormState, setDialogFormState] = (0, react_1.useState)({
        myEstimatedScore: currentPlayer.totalScore,
    });
    const { toast } = (0, use_toast_1.useToast)();
    // Update estimated score if currentPlayer.totalScore changes while dialog is closed
    (0, react_1.useEffect)(() => {
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
            const result = await (0, stop_advisor_1.getStopAdvice)(fullStopAdviceInput);
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
    const defaultTrigger = (<button_1.Button variant="outline" size="sm">
      <lucide_react_1.Brain className="mr-2 h-4 w-4"/> Get AI Advice
    </button_1.Button>);
    const onOpenChange = (open) => {
        setIsOpen(open);
        if (open) {
            setAdvice(null); // Clear previous advice
            // Reset estimated score to current player's total score when dialog opens
            setDialogFormState({ myEstimatedScore: currentPlayer.totalScore });
        }
    };
    return (<dialog_1.Dialog open={isOpen} onOpenChange={onOpenChange}>
      <dialog_1.DialogTrigger asChild>
        {triggerButton || defaultTrigger}
      </dialog_1.DialogTrigger>
      <dialog_1.DialogContent className="sm:max-w-[480px] bg-card">
        <dialog_1.DialogHeader>
          <dialog_1.DialogTitle className="text-2xl flex items-center font-headline">
            <lucide_react_1.Lightbulb className="mr-2 h-6 w-6 text-primary"/> AI Stop Advisor
          </dialog_1.DialogTitle>
          <dialog_1.DialogDescription className="font-body">
            Get advice on whether to call "STOP".
            Your current total score is {currentPlayer.totalScore}. 
            Deck: {cardsRemainingInDeck}, Discard: {cardsInDiscardPile}.
          </dialog_1.DialogDescription>
        </dialog_1.DialogHeader>
        
        {!advice && (<div className="space-y-4 py-4">
            <div className="space-y-2">
              <label_1.Label htmlFor="myEstimatedScore">Your Estimated Score (if you stop now)</label_1.Label>
              <input_1.Input id="myEstimatedScore" name="myEstimatedScore" // Ensure name matches the key in dialogFormState
         type="number" value={dialogFormState.myEstimatedScore} onChange={handleInputChange} className="text-base"/>
            </div>
            {/* Input fields for cardsRemainingInDeck and cardsInDiscardPile are removed
                as they are now passed as props and managed in GameBoard.tsx */}
          </div>)}

        {isLoading && <p className="text-center py-4 text-muted-foreground">Getting advice...</p>}

        {advice && (<card_1.Card className="my-4 bg-background shadow-inner">
            <card_1.CardHeader>
              <card_1.CardTitle className={`text-xl flex items-center ${advice.shouldStop ? 'text-green-600' : 'text-red-600'}`}>
                {advice.shouldStop ? <lucide_react_1.ThumbsUp className="mr-2 h-5 w-5"/> : <lucide_react_1.ThumbsDown className="mr-2 h-5 w-5"/>}
                Recommendation: {advice.shouldStop ? "Call STOP" : "DO NOT Call STOP"}
              </card_1.CardTitle>
            </card_1.CardHeader>
            <card_1.CardContent>
              <p className="font-semibold">Reasoning:</p>
              <p className="text-sm text-muted-foreground">{advice.reasoning}</p>
            </card_1.CardContent>
          </card_1.Card>)}
        
        <dialog_1.DialogFooter>
          {!advice && (<button_1.Button onClick={handleSubmit} disabled={isLoading} className="bg-primary hover:bg-primary/90">
              {isLoading ? "Analyzing..." : "Get Advice"}
            </button_1.Button>)}
          {advice && (<button_1.Button onClick={() => setAdvice(null)} variant="outline">Ask Again</button_1.Button>)}
          <button_1.Button variant="ghost" onClick={() => setIsOpen(false)}>Close</button_1.Button>
        </dialog_1.DialogFooter>
      </dialog_1.DialogContent>
    </dialog_1.Dialog>);
}
