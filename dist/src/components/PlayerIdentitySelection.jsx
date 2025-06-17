"use strict";
"use client";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlayerIdentitySelection = PlayerIdentitySelection;
const button_1 = require("@/components/ui/button");
const card_1 = require("@/components/ui/card");
const lucide_react_1 = require("lucide-react");
function PlayerIdentitySelection({ players, onPlayerSelected }) {
    return (<card_1.Card className="w-full max-w-md shadow-xl">
      <card_1.CardHeader>
        <card_1.CardTitle className="text-3xl flex items-center">
          <lucide_react_1.UserCheck className="mr-2 h-8 w-8 text-primary"/> Who Are You?
        </card_1.CardTitle>
        <card_1.CardDescription>Select your name to continue.</card_1.CardDescription>
      </card_1.CardHeader>
      <card_1.CardContent className="space-y-4">
        {players.map(player => (<button_1.Button key={player.id} onClick={() => onPlayerSelected(player.id)} className="w-full text-lg py-6" variant="outline">
            {player.name}
          </button_1.Button>))}
      </card_1.CardContent>
    </card_1.Card>);
}
