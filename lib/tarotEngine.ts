import {
  TarotCard,
  TarotSuit,
  TarotRank,
  TarotGameState,
  Player,
  Bid,
  BidType,
  PlayedCard,
  Trick,
  GamePhase,
} from './types';

const CARD_POINTS: Record<string, number> = {
  'EXCUSE': 4.5,
  'TRUMP_1': 4.5,
  'TRUMP_21': 4.5,
  'ROI': 4.5,
  'DAME': 3.5,
  'CAVALIER': 2.5,
  'VALET': 1.5,
};

export function createDeck(): TarotCard[] {
  const deck: TarotCard[] = [];
  let cardId = 0;

  const suits: TarotSuit[] = ['HEARTS', 'DIAMONDS', 'CLUBS', 'SPADES'];
  const ranks: TarotRank[] = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'VALET', 'CAVALIER', 'DAME', 'ROI'];

  for (const suit of suits) {
    for (const rank of ranks) {
      const points = CARD_POINTS[rank] || 0.5;
      deck.push({
        id: `${suit}_${rank}_${cardId++}`,
        suit,
        rank,
        points,
      });
    }
  }

  for (let i = 1; i <= 21; i++) {
    const rank = `TRUMP_${i}` as TarotRank;
    const points = CARD_POINTS[rank] || 0.5;
    deck.push({
      id: `TRUMPS_${i}_${cardId++}`,
      suit: 'TRUMPS',
      rank,
      points,
    });
  }

  deck.push({
    id: `EXCUSE_0_${cardId++}`,
    suit: 'EXCUSE',
    rank: 'EXCUSE',
    points: CARD_POINTS['EXCUSE'],
  });

  return deck;
}

export function shuffleDeck(deck: TarotCard[]): TarotCard[] {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function dealCards(deck: TarotCard[]): {
  hands: Record<number, TarotCard[]>;
  dog: TarotCard[];
} {
  const shuffled = shuffleDeck(deck);
  const hands: Record<number, TarotCard[]> = {
    0: [],
    1: [],
    2: [],
    3: [],
  };
  const dog: TarotCard[] = [];

  let cardIndex = 0;

  for (let round = 0; round < 6; round++) {
    for (let player = 0; player < 4; player++) {
      hands[player].push(shuffled[cardIndex++]);
      hands[player].push(shuffled[cardIndex++]);
      hands[player].push(shuffled[cardIndex++]);
    }
  }

  for (let i = 0; i < 6; i++) {
    dog.push(shuffled[cardIndex++]);
  }

  return { hands, dog };
}

export function createInitialState(
  players: Player[],
  hands?: Record<number, TarotCard[]>,
  dog?: TarotCard[]
): TarotGameState {
  let finalHands: Record<number, TarotCard[]>;
  let finalDog: TarotCard[];

  if (hands && dog) {
    finalHands = hands;
    finalDog = dog;
  } else {
    const deck = createDeck();
    const dealt = dealCards(deck);
    finalHands = dealt.hands;
    finalDog = dealt.dog;
  }

  const sortedHands: Record<number, TarotCard[]> = {};
  for (let i = 0; i < 4; i++) {
    sortedHands[i] = sortHand(finalHands[i]);
  }

  return {
    phase: 'DEALING',
    players,
    hands: sortedHands,
    dog: finalDog,
    isDogRevealed: false,
    currentDealerSeat: 0,
    currentPlayerSeat: 1,
    bids: [],
    takerSeat: null,
    contract: null,
    currentTrick: [],
    currentTrickWinner: null,
    completedTricks: [],
    scores: { 0: 0, 1: 0, 2: 0, 3: 0 },
    currentRound: 1,
    roundScores: [],
    totalScores: { 0: 0, 1: 0, 2: 0, 3: 0 },
    lastRoundWon: null,
  };
}

export function sortHand(hand: TarotCard[]): TarotCard[] {
  const suitOrder: Record<TarotSuit, number> = {
    'TRUMPS': 0,
    'EXCUSE': 1,
    'SPADES': 2,
    'HEARTS': 3,
    'DIAMONDS': 4,
    'CLUBS': 5,
  };

  return [...hand].sort((a, b) => {
    if (a.suit !== b.suit) {
      return suitOrder[a.suit] - suitOrder[b.suit];
    }
    return getRankValue(a.rank) - getRankValue(b.rank);
  });
}

function getRankValue(rank: TarotRank): number {
  if (rank === 'EXCUSE') return 0;
  if (rank.startsWith('TRUMP_')) {
    return parseInt(rank.split('_')[1]);
  }
  const rankOrder: Record<string, number> = {
    '1': 1, '2': 2, '3': 3, '4': 4, '5': 5,
    '6': 6, '7': 7, '8': 8, '9': 9, '10': 10,
    'VALET': 11, 'CAVALIER': 12, 'DAME': 13, 'ROI': 14,
  };
  return rankOrder[rank] || 0;
}

export function applyBid(state: TarotGameState, playerSeat: number, bidType: BidType): TarotGameState {
  const newBids = [...state.bids, { playerSeat, bidType }];

  let newPhase = state.phase;
  let newCurrentPlayerSeat = (state.currentPlayerSeat + 1) % 4;
  let newTakerSeat = state.takerSeat;
  let newContract = state.contract;

  if (newBids.length === 4) {
    const nonPassBids = newBids.filter(b => b.bidType !== 'PASS');

    if (nonPassBids.length === 0) {
      newPhase = 'END';
    } else {
      const bidValues: Record<BidType, number> = {
        'PASS': 0,
        'PETITE': 1,
        'GARDE': 2,
        'GARDE_SANS': 3,
        'GARDE_CONTRE': 4,
      };

      const highestBid = nonPassBids.reduce((highest, current) => {
        return bidValues[current.bidType] > bidValues[highest.bidType] ? current : highest;
      });

      newTakerSeat = highestBid.playerSeat;
      newContract = highestBid.bidType;
      newPhase = 'DOG_REVEAL';
      newCurrentPlayerSeat = newTakerSeat;
    }
  }

  return {
    ...state,
    bids: newBids,
    phase: newPhase,
    currentPlayerSeat: newCurrentPlayerSeat,
    takerSeat: newTakerSeat,
    contract: newContract,
  };
}

export function canPlayCard(state: TarotGameState, playerSeat: number, cardId: string): boolean {
  if (state.phase !== 'PLAYING') {
    return false;
  }
  if (state.currentPlayerSeat !== playerSeat) {
    return false;
  }

  const playerHand = state.hands[playerSeat];
  const card = playerHand.find((c) => c.id === cardId);
  if (!card) {
    return false;
  }

  const trick = state.currentTrick;

  if (trick.length === 0) {
    if (card.suit === 'EXCUSE') return false;
    return true;
  }

  const leadCard = trick[0].card;
  const hasLeadSuit = playerHand.some((c) => c.suit === leadCard.suit);
  const hasTrump = playerHand.some((c) => c.suit === 'TRUMPS');

  if (card.suit === 'EXCUSE') {
    return true;
  }

  if (leadCard.suit === 'TRUMPS') {
    if (!hasTrump) {
      return card.suit !== 'TRUMPS';
    }

    if (card.suit !== 'TRUMPS') {
      return false;
    }

    const trumpsInTrick = trick.filter((pc) => pc.card.suit === 'TRUMPS');
    if (trumpsInTrick.length > 0) {
      const highestTrumpInTrick = Math.max(
        ...trumpsInTrick.map((pc) => getRankValue(pc.card.rank)),
      );
      const playerTrumpValue = getRankValue(card.rank);
      const hasHigherTrump = playerHand.some(
        (c) =>
          c.suit === 'TRUMPS' &&
          getRankValue(c.rank) > highestTrumpInTrick,
      );
      if (hasHigherTrump && playerTrumpValue <= highestTrumpInTrick) {
        return false;
      }
    }
    return true;
  }

  if (hasLeadSuit) {
    if (card.suit === leadCard.suit) return true;
    return false;
  }

  if (hasTrump) {
    if (card.suit !== 'TRUMPS') {
      return false;
    }

    const trumpsInTrick = trick.filter((pc) => pc.card.suit === 'TRUMPS');
    if (trumpsInTrick.length > 0) {
      const highestTrumpInTrick = Math.max(
        ...trumpsInTrick.map((pc) => getRankValue(pc.card.rank)),
      );
      const playerTrumpValue = getRankValue(card.rank);
      const hasHigherTrump = playerHand.some(
        (c) =>
          c.suit === 'TRUMPS' &&
          getRankValue(c.rank) > highestTrumpInTrick,
      );
      if (hasHigherTrump && playerTrumpValue <= highestTrumpInTrick) {
        return false;
      }
    }
    return true;
  }

  return true;
}

export function playCard(state: TarotGameState, playerSeat: number, cardId: string): TarotGameState {
  if (!canPlayCard(state, playerSeat, cardId)) {
    throw new Error('Invalid card play');
  }

  const card = state.hands[playerSeat].find(c => c.id === cardId);
  if (!card) {
    throw new Error('Card not found in player hand');
  }

  const newHands = { ...state.hands };
  newHands[playerSeat] = newHands[playerSeat].filter(c => c.id !== cardId);

  const newCurrentTrick = [...state.currentTrick, { playerSeat, card }];

  let newPhase = state.phase;
  let newCurrentPlayerSeat = (state.currentPlayerSeat + 1) % 4;
  let newTrickWinner = state.currentTrickWinner;

  if (newCurrentTrick.length === 4) {
    const winnerSeat = determineTrickWinner(newCurrentTrick);
    newTrickWinner = winnerSeat;
    newCurrentPlayerSeat = winnerSeat;

    if (Object.values(newHands).every(hand => hand.length === 0)) {
      newPhase = 'SCORING';
    }

    return {
      ...state,
      hands: newHands,
      currentTrick: newCurrentTrick,
      currentTrickWinner: newTrickWinner,
      phase: newPhase,
      currentPlayerSeat: newCurrentPlayerSeat,
    };
  }

  return {
    ...state,
    hands: newHands,
    currentTrick: newCurrentTrick,
    currentTrickWinner: null,
    currentPlayerSeat: newCurrentPlayerSeat,
  };
}

export function determineTrickWinner(trick: PlayedCard[]): number {
  const trumpCards = trick.filter(pc => pc.card.suit === 'TRUMPS');

  if (trumpCards.length > 0) {
    const highestTrump = trumpCards.reduce((highest, current) => {
      return getRankValue(current.card.rank) > getRankValue(highest.card.rank) ? current : highest;
    });
    return highestTrump.playerSeat;
  }

  const leadSuit = trick[0].card.suit;
  const sameSuitCards = trick.filter(pc => pc.card.suit === leadSuit);

  const highestSameSuit = sameSuitCards.reduce((highest, current) => {
    return getRankValue(current.card.rank) > getRankValue(highest.card.rank) ? current : highest;
  });

  return highestSameSuit.playerSeat;
}

export function calculateScores(state: TarotGameState): Record<number, number> {
  if (state.takerSeat === null) {
    return { 0: 0, 1: 0, 2: 0, 3: 0 };
  }

  let takerPoints = 0;
  let oudlers = 0;

  for (const trick of state.completedTricks) {
    if (trick.winnerSeat === state.takerSeat) {
      for (const playedCard of trick.cards) {
        takerPoints += playedCard.card.points;

        if (playedCard.card.rank === 'EXCUSE' ||
            playedCard.card.rank === 'TRUMP_1' ||
            playedCard.card.rank === 'TRUMP_21') {
          oudlers++;
        }
      }
    }
  }

  const targetPoints = [56, 51, 41, 36][oudlers];
  const difference = takerPoints - targetPoints;
  const basePoints = 25 + Math.abs(difference);

  const multiplier = state.contract === 'PETITE' ? 1 :
                     state.contract === 'GARDE' ? 2 :
                     state.contract === 'GARDE_SANS' ? 4 : 6;

  const finalPoints = basePoints * multiplier * (difference >= 0 ? 1 : -1);

  const scores: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0 };

  for (let i = 0; i < 4; i++) {
    if (i === state.takerSeat) {
      scores[i] = finalPoints * 3;
    } else {
      scores[i] = -finalPoints;
    }
  }

  return scores;
}

export function startBidding(state: TarotGameState): TarotGameState {
  return {
    ...state,
    phase: 'BIDDING',
    currentPlayerSeat: (state.currentDealerSeat + 1) % 4,
    bids: [],
  };
}

export function revealDog(state: TarotGameState): TarotGameState {
  if (state.takerSeat === null) {
    throw new Error('Cannot reveal dog without a taker');
  }

  const newHands = { ...state.hands };
  newHands[state.takerSeat] = sortHand([
    ...newHands[state.takerSeat],
    ...state.dog,
  ]);

  return {
    ...state,
    hands: newHands,
    isDogRevealed: true,
    phase: 'PLAYING',
    currentPlayerSeat: state.takerSeat,
    dog: [],
  };
}

export function finishRound(state: TarotGameState): { state: TarotGameState; contractWon: boolean } {
  const roundScores = calculateScores(state);
  const newRoundScores = [...state.roundScores, roundScores];

  const newTotalScores: Record<number, number> = { ...state.totalScores };
  for (let i = 0; i < 4; i++) {
    newTotalScores[i] = (newTotalScores[i] || 0) + (roundScores[i] || 0);
  }

  const takerScore = state.takerSeat !== null ? roundScores[state.takerSeat] : 0;
  const contractWon = takerScore > 0;

  return {
    state: {
      ...state,
      scores: roundScores,
      roundScores: newRoundScores,
      totalScores: newTotalScores,
      lastRoundWon: contractWon,
      phase: 'SCORING',
    },
    contractWon,
  };
}

export function clearTrick(state: TarotGameState): TarotGameState {
  if (state.currentTrick.length !== 4 || state.currentTrickWinner === null) {
    throw new Error('Cannot clear trick: trick is not complete');
  }

  const completedTrick: Trick = {
    leadSeat: state.currentTrick[0].playerSeat,
    cards: state.currentTrick,
    winnerSeat: state.currentTrickWinner,
  };

  return {
    ...state,
    currentTrick: [],
    currentTrickWinner: null,
    completedTricks: [...state.completedTricks, completedTrick],
  };
}

export function startNextRound(state: TarotGameState, newHands: Record<number, TarotCard[]>, newDog: TarotCard[]): TarotGameState {
  const nextDealerSeat = (state.currentDealerSeat + 1) % 4;
  const nextPlayerSeat = (nextDealerSeat + 1) % 4;

  return {
    ...state,
    phase: 'DEALING',
    hands: newHands,
    dog: newDog,
    isDogRevealed: false,
    currentDealerSeat: nextDealerSeat,
    currentPlayerSeat: nextPlayerSeat,
    bids: [],
    takerSeat: null,
    contract: null,
    currentTrick: [],
    currentTrickWinner: null,
    completedTricks: [],
    scores: { 0: 0, 1: 0, 2: 0, 3: 0 },
    currentRound: state.currentRound + 1,
    lastRoundWon: null,
  };
}
