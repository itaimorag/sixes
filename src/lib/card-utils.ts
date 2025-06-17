import type { Card, Suit, Rank } from "./types";

// Card value mapping
export const CARD_VALUES: Record<Rank, number> = {
  "2": 2,
  "3": 3,
  "4": 4,
  "5": 5,
  "6": 6,
  "7": 7,
  "8": 8,
  "9": 9,
  T: 10,
  J: 10,
  Q: 10,
  K: 0,
  A: 1,
};

// Get card image path
export function getCardImagePath(card: Card): string {
  const rankMap: Record<Rank, string> = {
    "2": "2",
    "3": "3",
    "4": "4",
    "5": "5",
    "6": "6",
    "7": "7",
    "8": "8",
    "9": "9",
    T: "10",
    J: "jack",
    Q: "queen",
    K: "king",
    A: "ace",
  };

  const suitMap: Record<Suit, string> = {
    S: "spades",
    H: "hearts",
    D: "diamonds",
    C: "clubs",
  };

  const rank = rankMap[card.rank];
  const suit = suitMap[card.suit];
  return `/assets/${rank}_of_${suit}.png`;
}

// Get card back image path
export const CARD_BACK_IMAGE = "/assets/playing-card-back.png";

// Calculate hand score
export function calculateHandScore(cards: Card[]): number {
  // Group cards by rank
  const rankGroups = new Map<Rank, Card[]>();
  cards.forEach((card) => {
    const group = rankGroups.get(card.rank) || [];
    group.push(card);
    rankGroups.set(card.rank, group);
  });

  let totalScore = 0;
  rankGroups.forEach((group, rank) => {
    // If we have pairs or more, they cancel out (0 points)
    if (group.length >= 2) {
      return;
    }
    // Otherwise, add the card's value
    totalScore += CARD_VALUES[rank];
  });

  return totalScore;
}

// Check if a card can be swapped (bottom row first, then top row)
export function canSwapCard(
  cardIndex: number,
  hasSwappedTopRow: boolean
): boolean {
  // Bottom row indices are 0-2, top row are 3-5
  const isBottomRow = cardIndex < 3;
  return isBottomRow || hasSwappedTopRow;
}

// Create a 104-card deck (2 of each card)
export function createDeck(): Card[] {
  const deck: Card[] = [];
  const suits: Suit[] = ["S", "H", "D", "C"];
  const ranks: Rank[] = [
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "T",
    "J",
    "Q",
    "K",
    "A",
  ];

  // Create two of each card
  for (let i = 0; i < 2; i++) {
    for (const suit of suits) {
      for (const rank of ranks) {
        const card: Card = {
          id: `${suit}${rank}-${i}-${Date.now()}-${Math.random()
            .toString(36)
            .substring(7)}`,
          suit,
          rank,
          name: `${rank} of ${suit}`,
          imageSrc: getCardImagePath({
            suit,
            rank,
            id: "",
            name: "",
            imageSrc: "",
          }),
        };
        deck.push(card);
      }
    }
  }

  return deck;
}

// Shuffle deck using Fisher-Yates algorithm
export function shuffleDeck(deck: Card[]): Card[] {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
