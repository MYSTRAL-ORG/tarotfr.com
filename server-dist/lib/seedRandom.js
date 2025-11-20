"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.shuffleArrayWithSeed = exports.createSeedFromNumbers = exports.SeededRandom = void 0;
class SeededRandom {
    constructor(seed) {
        this.seed = seed >>> 0;
    }
    next() {
        this.seed = (this.seed * 1664525 + 1013904223) >>> 0;
        return this.seed / 0x100000000;
    }
    nextInt(min, max) {
        return Math.floor(this.next() * (max - min + 1)) + min;
    }
    reset(seed) {
        this.seed = seed >>> 0;
    }
}
exports.SeededRandom = SeededRandom;
function createSeedFromNumbers(distributionNumber, sequenceNumber) {
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
exports.createSeedFromNumbers = createSeedFromNumbers;
function shuffleArrayWithSeed(array, seed) {
    const shuffled = [...array];
    const rng = new SeededRandom(seed);
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = rng.nextInt(0, i);
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}
exports.shuffleArrayWithSeed = shuffleArrayWithSeed;
