export class SeededRandom {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed >>> 0;
  }

  next(): number {
    this.seed = (this.seed * 1664525 + 1013904223) >>> 0;
    return this.seed / 0x100000000;
  }

  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  reset(seed: number): void {
    this.seed = seed >>> 0;
  }
}

export function createSeedFromNumbers(distributionNumber: bigint, sequenceNumber: bigint): number {
  const distStr = distributionNumber.toString();
  const seqStr = sequenceNumber.toString();
  const combined = distStr + seqStr;

  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash >>> 0;
  }

  return hash;
}

export function shuffleArrayWithSeed<T>(array: T[], seed: number): T[] {
  const shuffled = [...array];
  const rng = new SeededRandom(seed);

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = rng.nextInt(0, i);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
}
