import { TarotCard } from './types';
import { createDeck } from './tarotEngine';
import { createSeedFromNumbers, shuffleArrayWithSeed } from './seedRandom';

export interface DistributionMetadata {
  distributionNumber: bigint;
  sequenceNumber: bigint;
  hashCode: string;
  deckOrder: TarotCard[];
}

export interface SeededDistribution {
  hands: Record<number, TarotCard[]>;
  dog: TarotCard[];
  metadata: DistributionMetadata;
}

const BASE36_CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';

export function generateDistributionNumbers(): { distributionNumber: bigint; sequenceNumber: bigint } {
  const distributionNumber = BigInt(Math.floor(Math.random() * 1000000000000));
  const sequenceNumber = BigInt(Math.floor(Math.random() * 100000000000));

  return { distributionNumber, sequenceNumber };
}

export function createHashCode(distributionNumber: bigint, sequenceNumber: bigint, length: number = 8): string {
  const combined = distributionNumber.toString() + sequenceNumber.toString();

  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }

  hash = Math.abs(hash);

  let hashCode = '';
  for (let i = 0; i < length; i++) {
    hashCode += BASE36_CHARS[hash % 36];
    hash = Math.floor(hash / 36);

    if (hash === 0 && i < length - 1) {
      const tempHash = (BigInt(hash) + distributionNumber) * (sequenceNumber + BigInt(i));
      hash = Number(tempHash % BigInt(Number.MAX_SAFE_INTEGER));
      hash = Math.abs(hash);
    }
  }

  return hashCode;
}

export function validateHashCode(hashCode: string, distributionNumber: bigint, sequenceNumber: bigint): boolean {
  const expectedHash = createHashCode(distributionNumber, sequenceNumber, hashCode.length);
  return hashCode === expectedHash;
}

export function dealCardsWithSeed(distributionNumber: bigint, sequenceNumber: bigint): SeededDistribution {
  const deck = createDeck();
  const seed = createSeedFromNumbers(distributionNumber, sequenceNumber);
  const shuffledDeck = shuffleArrayWithSeed(deck, seed);

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
      hands[player].push(shuffledDeck[cardIndex++]);
      hands[player].push(shuffledDeck[cardIndex++]);
      hands[player].push(shuffledDeck[cardIndex++]);
    }
  }

  for (let i = 0; i < 6; i++) {
    dog.push(shuffledDeck[cardIndex++]);
  }

  const hashCode = createHashCode(distributionNumber, sequenceNumber);

  return {
    hands,
    dog,
    metadata: {
      distributionNumber,
      sequenceNumber,
      hashCode,
      deckOrder: shuffledDeck,
    },
  };
}

export function generateNewDistribution(): SeededDistribution {
  const { distributionNumber, sequenceNumber } = generateDistributionNumbers();
  return dealCardsWithSeed(distributionNumber, sequenceNumber);
}

export function sortHand(hand: TarotCard[]): TarotCard[] {
  const suitOrder: Record<string, number> = {
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

function getRankValue(rank: string): number {
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
