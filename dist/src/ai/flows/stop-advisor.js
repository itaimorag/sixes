"use strict";
'use server';
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStopAdvice = getStopAdvice;
/**
 * @fileOverview Provides AI-driven advice on whether to call 'STOP' in the Sixes game.
 *
 * - getStopAdvice - A function that provides advice on whether to call 'STOP'.
 * - StopAdviceInput - The input type for the getStopAdvice function.
 * - StopAdviceOutput - The return type for the getStopAdvice function.
 */
const genkit_1 = require("@/ai/genkit");
const genkit_2 = require("genkit");
const StopAdviceInputSchema = genkit_2.z.object({
    myEstimatedScore: genkit_2.z
        .number()
        .describe('The player’s estimated score based on their current cards.'),
    opponentScores: genkit_2.z
        .array(genkit_2.z.number())
        .describe('The current scores of the other players in the game.'),
    cardsRemainingInDeck: genkit_2.z
        .number()
        .describe('The number of cards remaining in the deck.'),
    cardsInDiscardPile: genkit_2.z
        .number()
        .describe('The number of cards in the discard pile.'),
});
const StopAdviceOutputSchema = genkit_2.z.object({
    shouldStop: genkit_2.z
        .boolean()
        .describe('Whether the player should call STOP based on the current game state.'),
    reasoning: genkit_2.z
        .string()
        .describe('The AI’s reasoning for recommending whether to call STOP or not.'),
});
async function getStopAdvice(input) {
    return stopAdviceFlow(input);
}
const prompt = genkit_1.ai.definePrompt({
    name: 'stopAdvicePrompt',
    input: { schema: StopAdviceInputSchema },
    output: { schema: StopAdviceOutputSchema },
    prompt: `You are an AI assistant acting as a Sixes (Shishiyot) virtual coach.

You will receive information about the current game state, including the player's estimated score, the scores of other players, and the number of cards remaining in the deck and discard pile.

Based on this information, you will provide advice on whether the player should call 'STOP'.

Here is the information about the current game state:

My estimated score: {{{myEstimatedScore}}}
Opponent scores: {{#each opponentScores}}{{{this}}} {{/each}}
Cards remaining in deck: {{{cardsRemainingInDeck}}}
Cards in discard pile: {{{cardsInDiscardPile}}}

Consider the following factors:

* The player's goal is to have the lowest score at the end of the game.
* Calling 'STOP' ends the game after all other players have one final turn.
* If the player calls 'STOP' and has the lowest score, they receive a bonus.
* If the player calls 'STOP' but another player has a lower score, they receive a penalty.
* The number of cards remaining in the deck and discard pile can influence the likelihood of other players improving their scores.

Based on these considerations, should the player call 'STOP'? Explain your reasoning.

Output:
{{output schema=StopAdviceOutputSchema}}`,
});
const stopAdviceFlow = genkit_1.ai.defineFlow({
    name: 'stopAdviceFlow',
    inputSchema: StopAdviceInputSchema,
    outputSchema: StopAdviceOutputSchema,
}, async (input) => {
    const { output } = await prompt(input);
    return output;
});
