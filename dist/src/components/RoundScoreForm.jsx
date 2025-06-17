"use strict";
"use client";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoundScoreForm = RoundScoreForm;
const react_1 = require("react");
const button_1 = require("@/components/ui/button");
const input_1 = require("@/components/ui/input");
const label_1 = require("@/components/ui/label");
const card_1 = require("@/components/ui/card");
const lucide_react_1 = require("lucide-react");
function RoundScoreForm({ players, currentRound, onSubmitScores, isFinalRound }) {
    const [roundScores, setRoundScores] = (0, react_1.useState)({});
    (0, react_1.useEffect)(() => {
        // Reset scores when players or round change
        const initialScores = {};
        players.forEach(p => { initialScores[p.id] = ''; });
        setRoundScores(initialScores);
    }, [players, currentRound]);
    const handleScoreChange = (playerId, score) => {
        setRoundScores(prev => (Object.assign(Object.assign({}, prev), { [playerId]: score })));
    };
    const handleSubmit = (e) => {
        e.preventDefault();
        const scoresToSubmit = {};
        let allValid = true;
        for (const player of players) {
            const scoreStr = roundScores[player.id];
            if (scoreStr === undefined || scoreStr.trim() === '') {
                alert(`Please enter a score for ${player.name}.`);
                allValid = false;
                break;
            }
            const scoreNum = parseInt(scoreStr, 10);
            if (isNaN(scoreNum)) {
                alert(`Invalid score for ${player.name}. Please enter a number.`);
                allValid = false;
                break;
            }
            scoresToSubmit[player.id] = scoreNum;
        }
        if (allValid) {
            onSubmitScores(scoresToSubmit);
        }
    };
    return (<card_1.Card className="shadow-lg">
      <card_1.CardHeader>
        <card_1.CardTitle className="text-2xl flex items-center">
          <lucide_react_1.Edit3 className="mr-2 h-7 w-7 text-primary"/>
          Enter Scores for Round {currentRound}
        </card_1.CardTitle>
        {isFinalRound && <card_1.CardDescription className="text-accent">This is the final round after STOP was called!</card_1.CardDescription>}
      </card_1.CardHeader>
      <card_1.CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {players.map(player => (<div key={player.id} className="space-y-2">
              <label_1.Label htmlFor={`score-${player.id}`} className="text-lg font-medium">{player.name}'s Score</label_1.Label>
              <input_1.Input id={`score-${player.id}`} type="number" value={roundScores[player.id] || ''} onChange={(e) => handleScoreChange(player.id, e.target.value)} placeholder="Enter score" required className="text-base h-12"/>
            </div>))}
          <button_1.Button type="submit" className="w-full text-lg py-6 bg-accent hover:bg-accent/90">
             <lucide_react_1.CheckCircle className="mr-2 h-5 w-5"/>
            {isFinalRound ? 'Submit Final Scores & End Game' : 'Submit Round Scores'}
          </button_1.Button>
        </form>
      </card_1.CardContent>
    </card_1.Card>);
}
