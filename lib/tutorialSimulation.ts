import { TarotCard } from './types';

export interface SimulationState {
  phase: 'bidding' | 'playing' | 'scoring';
  currentPlayer: number;
  playerBid: string | null;
  botBids: string[];
  playerHand: TarotCard[];
  trickCards: Array<{ card: TarotCard; player: number }>;
  currentTrick: number;
  scores: { player: number; displayName: string; score: number }[];
  message: string;
  canPlay: boolean;
  selectedCard: number | null;
  contractWinner: number;
  contract: string;
}

const createCard = (suit: any, rank: any, points: number): TarotCard => ({
  id: `${suit}_${rank}`,
  suit,
  rank,
  points,
});

export const initialSimulationState: SimulationState = {
  phase: 'bidding',
  currentPlayer: 0,
  playerBid: null,
  botBids: [],
  playerHand: [
    createCard('TRUMPS', 'TRUMP_15', 0.5),
    createCard('HEARTS', 'ROI', 4.5),
    createCard('TRUMPS', 'TRUMP_8', 0.5),
    createCard('CLUBS', 'DAME', 3.5),
    createCard('TRUMPS', 'TRUMP_21', 4.5),
    createCard('DIAMONDS', '7', 0.5),
    createCard('HEARTS', '10', 0.5),
    createCard('TRUMPS', 'TRUMP_18', 0.5),
    createCard('CLUBS', 'VALET', 1.5),
    createCard('DIAMONDS', 'ROI', 4.5),
    createCard('TRUMPS', 'TRUMP_12', 0.5),
    createCard('SPADES', '8', 0.5),
    createCard('HEARTS', 'DAME', 3.5),
    createCard('TRUMPS', 'TRUMP_5', 0.5),
    createCard('CLUBS', '9', 0.5),
  ],
  trickCards: [],
  currentTrick: 0,
  scores: [],
  message: "C'est votre tour d'enchérir !",
  canPlay: false,
  selectedCard: null,
  contractWinner: -1,
  contract: '',
};

export const botNames = ['Joueur 2', 'Joueur 3', 'Joueur 4'];

export function simulateBotBid(botIndex: number, previousBids: string[]): string {
  const bids = ['PASS', 'PASS', 'PETITE', 'PASS'];
  return bids[botIndex] || 'PASS';
}

export function getBidDisplayName(bid: string): string {
  const names: Record<string, string> = {
    'PASS': 'Passe',
    'PETITE': 'Petite',
    'GARDE': 'Garde',
    'GARDE_SANS': 'Garde Sans',
    'GARDE_CONTRE': 'Garde Contre',
  };
  return names[bid] || bid;
}

export function processBid(state: SimulationState, bid: string): SimulationState {
  const newState = { ...state };
  newState.playerBid = bid;
  newState.currentPlayer = 1;
  newState.message = 'Les autres joueurs enchérissent...';

  const botBids = [
    simulateBotBid(0, [bid]),
    simulateBotBid(1, [bid]),
    simulateBotBid(2, [bid]),
  ];

  newState.botBids = botBids;

  if (bid !== 'PASS') {
    newState.contractWinner = 0;
    newState.contract = bid;
    newState.phase = 'playing';
    newState.currentPlayer = 0;
    newState.canPlay = true;
    newState.message = `Vous avez remporté le contrat avec ${getBidDisplayName(bid)} ! Jouez votre première carte.`;
  } else {
    newState.contractWinner = 2;
    newState.contract = 'PETITE';
    newState.phase = 'playing';
    newState.currentPlayer = 2;
    newState.canPlay = false;
    newState.message = 'Joueur 3 a remporté le contrat avec Petite. Il commence.';
  }

  return newState;
}

const botHands = [
  [
    createCard('HEARTS', '8', 0.5),
    createCard('TRUMPS', 'TRUMP_3', 0.5),
    createCard('CLUBS', '5', 0.5),
  ],
  [
    createCard('HEARTS', 'VALET', 1.5),
    createCard('TRUMPS', 'TRUMP_10', 0.5),
    createCard('CLUBS', 'ROI', 4.5),
  ],
  [
    createCard('HEARTS', 'CAVALIER', 2.5),
    createCard('TRUMPS', 'TRUMP_7', 0.5),
    createCard('CLUBS', '6', 0.5),
  ],
];

export function simulateBotPlay(
  botIndex: number,
  trickCards: Array<{ card: TarotCard; player: number }>
): TarotCard {
  if (botHands[botIndex] && botHands[botIndex].length > 0) {
    return botHands[botIndex][0];
  }

  return createCard('HEARTS', '2', 0.5);
}

export function playCard(state: SimulationState, cardIndex: number): SimulationState {
  if (!state.canPlay || state.selectedCard === null) {
    return state;
  }

  const newState = { ...state };
  const card = newState.playerHand[cardIndex];

  newState.trickCards.push({ card, player: 0 });
  newState.playerHand = newState.playerHand.filter((_, i) => i !== cardIndex);
  newState.selectedCard = null;
  newState.canPlay = false;
  newState.currentPlayer = 1;
  newState.message = 'Les autres joueurs jouent...';

  return newState;
}

export function completeTrick(state: SimulationState): SimulationState {
  const newState = { ...state };

  for (let i = 1; i <= 3; i++) {
    const botCard = simulateBotPlay(i - 1, newState.trickCards);
    newState.trickCards.push({ card: botCard, player: i });
  }

  const winner = determineTrickWinner(newState.trickCards);
  newState.message = `${winner === 0 ? 'Vous' : botNames[winner - 1]} remporte le pli !`;

  setTimeout(() => {}, 2000);

  return newState;
}

export function nextTrick(state: SimulationState): SimulationState {
  const newState = { ...state };
  newState.trickCards = [];
  newState.currentTrick += 1;

  if (newState.currentTrick >= 3 || newState.playerHand.length === 0) {
    newState.phase = 'scoring';
    newState.message = 'Partie terminée ! Calcul des scores...';
    newState.scores = calculateScores(newState);
  } else {
    const winner = determineTrickWinner(state.trickCards);
    newState.currentPlayer = winner;
    newState.canPlay = winner === 0;
    newState.message = winner === 0
      ? 'Vous avez remporté le pli ! Jouez votre carte.'
      : `${botNames[winner - 1]} a remporté le pli et commence.`;
  }

  return newState;
}

function determineTrickWinner(trickCards: Array<{ card: TarotCard; player: number }>): number {
  let winner = 0;
  let highestTrump = -1;
  let highestSuitCard = trickCards[0];

  for (const { card, player } of trickCards) {
    if (card.suit === 'TRUMPS') {
      const trumpValue = card.rank === 'EXCUSE' ? 0 : parseInt(card.rank.replace('TRUMP_', ''));
      if (trumpValue > highestTrump) {
        highestTrump = trumpValue;
        winner = player;
      }
    } else if (highestTrump === -1 && card.suit === highestSuitCard.card.suit) {
      const rankValue = getRankValue(card.rank);
      if (rankValue > getRankValue(highestSuitCard.card.rank)) {
        highestSuitCard = { card, player };
        winner = player;
      }
    }
  }

  return winner;
}

function getRankValue(rank: string): number {
  const values: Record<string, number> = {
    '1': 14,
    '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10,
    'VALET': 11,
    'CAVALIER': 12,
    'DAME': 13,
    'ROI': 14,
  };
  return values[rank] || 0;
}

function calculateScores(state: SimulationState): Array<{ player: number; displayName: string; score: number }> {
  const takerWon = Math.random() > 0.3;
  const baseScore = 25;

  if (state.contractWinner === 0) {
    return [
      { player: 0, displayName: 'Vous', score: takerWon ? baseScore * 3 : -baseScore * 3 },
      { player: 1, displayName: botNames[0], score: takerWon ? -baseScore : baseScore },
      { player: 2, displayName: botNames[1], score: takerWon ? -baseScore : baseScore },
      { player: 3, displayName: botNames[2], score: takerWon ? -baseScore : baseScore },
    ];
  } else {
    return [
      { player: 0, displayName: 'Vous', score: takerWon ? -baseScore : baseScore },
      { player: 1, displayName: botNames[0], score: takerWon ? -baseScore : baseScore },
      { player: 2, displayName: botNames[1], score: takerWon ? baseScore * 3 : -baseScore * 3 },
      { player: 3, displayName: botNames[2], score: takerWon ? -baseScore : baseScore },
    ];
  }
}
