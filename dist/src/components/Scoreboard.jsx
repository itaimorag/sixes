"use strict";
"use client";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Scoreboard = Scoreboard;
const table_1 = require("@/components/ui/table");
const card_1 = require("@/components/ui/card");
const lucide_react_1 = require("lucide-react");
function Scoreboard({ players, currentRound }) {
    const sortedPlayers = [...players].sort((a, b) => a.totalScore - b.totalScore);
    const maxRounds = Math.max(0, ...players.map(p => p.scoresByRound.length));
    return (<card_1.Card className="shadow-lg">
      <card_1.CardHeader>
        <card_1.CardTitle className="text-2xl flex items-center">
          <lucide_react_1.ListOrdered className="mr-2 h-7 w-7 text-primary"/>
          Scoreboard
          {currentRound > 0 && <span className="ml-2 text-lg font-normal text-muted-foreground">(Round: {currentRound})</span>}
        </card_1.CardTitle>
      </card_1.CardHeader>
      <card_1.CardContent>
        <div className="overflow-x-auto">
          <table_1.Table>
            <table_1.TableHeader>
              <table_1.TableRow>
                <table_1.TableHead className="w-[50px] text-center font-headline">Rank</table_1.TableHead>
                <table_1.TableHead className="min-w-[150px] font-headline">Player</table_1.TableHead>
                {Array.from({ length: maxRounds }, (_, i) => (<table_1.TableHead key={`round-header-${i}`} className="text-center font-headline">R{i + 1}</table_1.TableHead>))}
                <table_1.TableHead className="text-right font-headline">Total</table_1.TableHead>
              </table_1.TableRow>
            </table_1.TableHeader>
            <table_1.TableBody>
              {sortedPlayers.map((player, index) => (<table_1.TableRow key={player.id} className={player.isStopper ? 'bg-accent/20' : ''}>
                  <table_1.TableCell className="text-center font-medium">
                    {index === 0 && currentRound > 0 ? <lucide_react_1.Trophy className="h-5 w-5 inline text-yellow-500"/> : index + 1}
                  </table_1.TableCell>
                  <table_1.TableCell className="font-medium text-primary">{player.name}{player.isStopper ? ' (STOP)' : ''}</table_1.TableCell>
                  {Array.from({ length: maxRounds }, (_, i) => (<table_1.TableCell key={`score-${player.id}-${i}`} className="text-center">
                      {player.scoresByRound[i] !== undefined ? player.scoresByRound[i] : '-'}
                    </table_1.TableCell>))}
                  <table_1.TableCell className="text-right font-bold text-xl animate-score-update">
                    {player.totalScore}
                  </table_1.TableCell>
                </table_1.TableRow>))}
            </table_1.TableBody>
          </table_1.Table>
        </div>
      </card_1.CardContent>
    </card_1.Card>);
}
