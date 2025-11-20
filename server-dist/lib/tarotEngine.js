"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.revealDog = exports.startBidding = exports.calculateScores = exports.determineTrickWinner = exports.playCard = exports.canPlayCard = exports.applyBid = exports.sortHand = exports.createInitialState = exports.dealCards = exports.shuffleDeck = exports.createDeck = void 0;
const CARD_POINTS = {
    'EXCUSE': 4.5,
    'TRUMP_1': 4.5,
    'TRUMP_21': 4.5,
    'ROI': 4.5,
    'DAME': 3.5,
    'CAVALIER': 2.5,
    'VALET': 1.5,
};
function createDeck() {
    const deck = [];
    let cardId = 0;
    const suits = ['HEARTS', 'DIAMONDS', 'CLUBS', 'SPADES'];
    const ranks = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'VALET', 'CAVALIER', 'DAME', 'ROI'];
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
        const rank = `TRUMP_${i}`;
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
exports.createDeck = createDeck;
function shuffleDeck(deck) {
    const shuffled = [...deck];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}
exports.shuffleDeck = shuffleDeck;
function dealCards(deck) {
    const shuffled = shuffleDeck(deck);
    const hands = {
        0: [],
        1: [],
        2: [],
        3: [],
    };
    const dog = [];
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
exports.dealCards = dealCards;
function createInitialState(players, hands, dog) {
    let finalHands;
    let finalDog;
    if (hands && dog) {
        finalHands = hands;
        finalDog = dog;
    }
    else {
        const deck = createDeck();
        const dealt = dealCards(deck);
        finalHands = dealt.hands;
        finalDog = dealt.dog;
    }
    const sortedHands = {};
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
        completedTricks: [],
        scores: { 0: 0, 1: 0, 2: 0, 3: 0 },
    };
}
exports.createInitialState = createInitialState;
function sortHand(hand) {
    const suitOrder = {
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
exports.sortHand = sortHand;
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
function applyBid(state, playerSeat, bidType) {
    const newBids = [...state.bids, { playerSeat, bidType }];
    let newPhase = state.phase;
    let newCurrentPlayerSeat = (state.currentPlayerSeat + 1) % 4;
    let newTakerSeat = state.takerSeat;
    let newContract = state.contract;
    if (newBids.length === 4) {
        const nonPassBids = newBids.filter(b => b.bidType !== 'PASS');
        if (nonPassBids.length === 0) {
            newPhase = 'END';
        }
        else {
            const bidValues = {
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
exports.applyBid = applyBid;
function canPlayCard(state, playerSeat, cardId) {
    if (state.phase !== 'PLAYING')
        return false;
    if (state.currentPlayerSeat !== playerSeat)
        return false;
    const playerHand = state.hands[playerSeat];
    const card = playerHand.find((c) => c.id === cardId);
    if (!card)
        return false;
    const trick = state.currentTrick;
    if (trick.length === 0) {
        if (card.suit === 'EXCUSE')
            return false;
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
            const highestTrumpInTrick = Math.max(...trumpsInTrick.map((pc) => getRankValue(pc.card.rank)));
            const playerTrumpValue = getRankValue(card.rank);
            const hasHigherTrump = playerHand.some((c) => c.suit === 'TRUMPS' &&
                getRankValue(c.rank) > highestTrumpInTrick);
            if (hasHigherTrump && playerTrumpValue <= highestTrumpInTrick) {
                return false;
            }
        }
        return true;
    }
    if (hasLeadSuit) {
        if (card.suit === leadCard.suit)
            return true;
        return false;
    }
    if (hasTrump) {
        if (card.suit !== 'TRUMPS') {
            return false;
        }
        const trumpsInTrick = trick.filter((pc) => pc.card.suit === 'TRUMPS');
        if (trumpsInTrick.length > 0) {
            const highestTrumpInTrick = Math.max(...trumpsInTrick.map((pc) => getRankValue(pc.card.rank)));
            const playerTrumpValue = getRankValue(card.rank);
            const hasHigherTrump = playerHand.some((c) => c.suit === 'TRUMPS' &&
                getRankValue(c.rank) > highestTrumpInTrick);
            if (hasHigherTrump && playerTrumpValue <= highestTrumpInTrick) {
                return false;
            }
        }
        return true;
    }
    return true;
}
exports.canPlayCard = canPlayCard;
function playCard(state, playerSeat, cardId) {
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
    let newCompletedTricks = state.completedTricks;
    if (newCurrentTrick.length === 4) {
        const winnerSeat = determineTrickWinner(newCurrentTrick);
        const completedTrick = {
            leadSeat: newCurrentTrick[0].playerSeat,
            cards: newCurrentTrick,
            winnerSeat,
        };
        newCompletedTricks = [...state.completedTricks, completedTrick];
        newCurrentPlayerSeat = winnerSeat;
        if (Object.values(newHands).every(hand => hand.length === 0)) {
            newPhase = 'SCORING';
        }
        return {
            ...state,
            hands: newHands,
            currentTrick: [],
            completedTricks: newCompletedTricks,
            phase: newPhase,
            currentPlayerSeat: newCurrentPlayerSeat,
        };
    }
    return {
        ...state,
        hands: newHands,
        currentTrick: newCurrentTrick,
        currentPlayerSeat: newCurrentPlayerSeat,
    };
}
exports.playCard = playCard;
function determineTrickWinner(trick) {
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
exports.determineTrickWinner = determineTrickWinner;
function calculateScores(state) {
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
    const scores = { 0: 0, 1: 0, 2: 0, 3: 0 };
    for (let i = 0; i < 4; i++) {
        if (i === state.takerSeat) {
            scores[i] = finalPoints * 3;
        }
        else {
            scores[i] = -finalPoints;
        }
    }
    return scores;
}
exports.calculateScores = calculateScores;
function startBidding(state) {
    return {
        ...state,
        phase: 'BIDDING',
        currentPlayerSeat: (state.currentDealerSeat + 1) % 4,
        bids: [],
    };
}
exports.startBidding = startBidding;
function revealDog(state) {
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
exports.revealDog = revealDog;
