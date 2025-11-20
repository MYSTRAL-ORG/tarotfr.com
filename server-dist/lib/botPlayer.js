"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBotPlayer = exports.chooseCardToPlay = exports.decideBid = void 0;
const tarotEngine_1 = require("./tarotEngine");
function getRankValue(rank) {
    if (rank === 'EXCUSE')
        return 0;
    if (rank.startsWith('TRUMP_')) {
        return parseInt(rank.split('_')[1]);
    }
    const rankOrder = {
        '1': 1, '2': 2, '3': 3, '4': 4, '5': 5,
        '6': 6, '7': 7, '8': 8, '9': 9, '10': 10,
        'VALET': 11, 'CAVALIER': 12, 'DAME': 13, 'ROI': 14,
    };
    return rankOrder[rank] || 0;
}
function countTrumps(hand) {
    return hand.filter(card => card.suit === 'TRUMPS').length;
}
function countOudlers(hand) {
    return hand.filter(card => card.rank === 'EXCUSE' ||
        card.rank === 'TRUMP_1' ||
        card.rank === 'TRUMP_21').length;
}
function hasStrongHand(hand) {
    const trumpCount = countTrumps(hand);
    const oudlerCount = countOudlers(hand);
    const highTrumps = hand.filter(card => card.suit === 'TRUMPS' && getRankValue(card.rank) >= 15).length;
    return trumpCount >= 8 || oudlerCount >= 2 || (trumpCount >= 6 && highTrumps >= 3);
}
function decideBid(hand, difficulty, currentHighestBid) {
    if (difficulty === 'EASY') {
        const random = Math.random();
        if (random < 0.7)
            return 'PASS';
        if (random < 0.9)
            return 'PETITE';
        return 'GARDE';
    }
    const trumpCount = countTrumps(hand);
    const oudlerCount = countOudlers(hand);
    const points = hand.reduce((sum, card) => sum + card.points, 0);
    if (difficulty === 'MEDIUM') {
        if (trumpCount < 5)
            return 'PASS';
        if (trumpCount >= 8 && oudlerCount >= 1)
            return 'PETITE';
        if (trumpCount < 7)
            return 'PASS';
        return 'PETITE';
    }
    if (trumpCount < 6)
        return 'PASS';
    if (hasStrongHand(hand)) {
        if (oudlerCount >= 2 && trumpCount >= 10) {
            const bidValues = {
                'PASS': 0, 'PETITE': 1, 'GARDE': 2, 'GARDE_SANS': 3, 'GARDE_CONTRE': 4
            };
            const currentBidValue = currentHighestBid ? bidValues[currentHighestBid] : 0;
            if (oudlerCount === 3 && trumpCount >= 12) {
                return currentBidValue < 2 ? 'GARDE' : 'PASS';
            }
            return currentBidValue < 1 ? 'GARDE' : 'PASS';
        }
        if (trumpCount >= 8)
            return 'PETITE';
    }
    return 'PASS';
}
exports.decideBid = decideBid;
function chooseCardToPlay(gameState, playerSeat, difficulty) {
    const hand = gameState.hands[playerSeat];
    if (!hand || hand.length === 0)
        return null;
    const playableCards = hand.filter(card => (0, tarotEngine_1.canPlayCard)(gameState, playerSeat, card.id));
    if (playableCards.length === 0)
        return null;
    if (playableCards.length === 1)
        return playableCards[0].id;
    if (difficulty === 'EASY') {
        return playableCards[Math.floor(Math.random() * playableCards.length)].id;
    }
    const currentTrick = gameState.currentTrick;
    const isLeading = currentTrick.length === 0;
    if (difficulty === 'MEDIUM') {
        if (isLeading) {
            const trumps = playableCards.filter(c => c.suit === 'TRUMPS');
            if (trumps.length > 0) {
                const lowestTrump = trumps.reduce((lowest, card) => getRankValue(card.rank) < getRankValue(lowest.rank) ? card : lowest);
                return lowestTrump.id;
            }
            const lowestCard = playableCards.reduce((lowest, card) => card.points < lowest.points ? card : lowest);
            return lowestCard.id;
        }
        const winningCard = findWinningCard(currentTrick);
        const canWin = playableCards.some(card => card.suit === 'TRUMPS' &&
            getRankValue(card.rank) > getRankValue(winningCard.rank));
        if (canWin) {
            const trumps = playableCards.filter(c => c.suit === 'TRUMPS' &&
                getRankValue(c.rank) > getRankValue(winningCard.rank));
            const lowestWinning = trumps.reduce((lowest, card) => getRankValue(card.rank) < getRankValue(lowest.rank) ? card : lowest);
            return lowestWinning.id;
        }
        const lowestCard = playableCards.reduce((lowest, card) => card.points < lowest.points ? card : lowest);
        return lowestCard.id;
    }
    const isTaker = gameState.takerSeat === playerSeat;
    const trickPoints = currentTrick.reduce((sum, pc) => sum + pc.card.points, 0);
    if (isLeading) {
        if (isTaker) {
            const strongTrumps = playableCards.filter(c => c.suit === 'TRUMPS' && getRankValue(c.rank) >= 15);
            if (strongTrumps.length > 0) {
                return strongTrumps[Math.floor(Math.random() * strongTrumps.length)].id;
            }
        }
        const lowValueCards = playableCards.filter(c => c.points <= 0.5);
        if (lowValueCards.length > 0) {
            return lowValueCards[0].id;
        }
        return playableCards[0].id;
    }
    const winningCard = findWinningCard(currentTrick);
    const shouldTryToWin = isTaker || trickPoints >= 10;
    if (shouldTryToWin) {
        const winningCards = playableCards.filter(card => {
            if (winningCard.suit === 'TRUMPS') {
                return card.suit === 'TRUMPS' && getRankValue(card.rank) > getRankValue(winningCard.rank);
            }
            return card.suit === 'TRUMPS' ||
                (card.suit === winningCard.suit && getRankValue(card.rank) > getRankValue(winningCard.rank));
        });
        if (winningCards.length > 0) {
            const lowestWinning = winningCards.reduce((lowest, card) => getRankValue(card.rank) < getRankValue(lowest.rank) ? card : lowest);
            return lowestWinning.id;
        }
    }
    const lowestCard = playableCards.reduce((lowest, card) => card.points < lowest.points ? card : lowest);
    return lowestCard.id;
}
exports.chooseCardToPlay = chooseCardToPlay;
function findWinningCard(trick) {
    if (trick.length === 0)
        throw new Error('Cannot find winning card in empty trick');
    const trumpCards = trick.filter(pc => pc.card.suit === 'TRUMPS');
    if (trumpCards.length > 0) {
        return trumpCards.reduce((highest, current) => getRankValue(current.card.rank) > getRankValue(highest.card.rank) ? current : highest).card;
    }
    const leadSuit = trick[0].card.suit;
    const sameSuitCards = trick.filter(pc => pc.card.suit === leadSuit);
    return sameSuitCards.reduce((highest, current) => getRankValue(current.card.rank) > getRankValue(highest.card.rank) ? current : highest).card;
}
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}
function createBotPlayer(seatIndex, difficulty) {
    const botNames = {
        EASY: ['Bot Débutant', 'Bot Apprenti', 'Bot Novice', 'Bot Junior'],
        MEDIUM: ['Bot Expérimenté', 'Bot Confirmé', 'Bot Averti', 'Bot Compétent'],
        HARD: ['Bot Expert', 'Bot Maître', 'Bot Champion', 'Bot Pro'],
    };
    const names = botNames[difficulty];
    const name = names[Math.floor(Math.random() * names.length)];
    const botId = generateUUID();
    return {
        id: botId,
        userId: botId,
        displayName: name,
        seatIndex,
        isReady: true,
        isBot: true,
        difficulty,
    };
}
exports.createBotPlayer = createBotPlayer;
