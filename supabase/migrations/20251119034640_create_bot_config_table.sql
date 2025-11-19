/*
  # Create Bot Configuration Table

  1. New Tables
    - `bot_config`
      - `id` (uuid, primary key)
      - `level` (text) - Bot difficulty level: 'easy', 'medium', 'hard'
      - `common_code` (text) - Common code shared by all bot levels
      - `level_specific_code` (text) - Code specific to this bot level
      - `variables` (jsonb) - Configuration variables for the bot level
      - `is_active` (boolean) - Whether this bot level is active
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `bot_config` table
    - Add policy for public read access
    - Add policy for authenticated users to manage bot configs

  3. Initial Data
    - Insert default configurations for all three bot levels with template variables
*/

CREATE TABLE IF NOT EXISTS bot_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  level text NOT NULL UNIQUE CHECK (level IN ('easy', 'medium', 'hard')),
  common_code text DEFAULT '',
  level_specific_code text DEFAULT '',
  variables jsonb DEFAULT '{}'::jsonb,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE bot_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read bot configs"
  ON bot_config FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can update bot configs"
  ON bot_config FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can insert bot configs"
  ON bot_config FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Insert default configurations for each bot level
INSERT INTO bot_config (level, common_code, level_specific_code, variables) VALUES
(
  'easy',
  '// Code commun pour tous les bots
// Ce code définit le comportement général des bots

function getRankValue(rank) {
  if (rank === "EXCUSE") return 0;
  if (rank.startsWith("TRUMP_")) {
    return parseInt(rank.split("_")[1]);
  }
  const rankOrder = {
    "1": 1, "2": 2, "3": 3, "4": 4, "5": 5,
    "6": 6, "7": 7, "8": 8, "9": 9, "10": 10,
    "VALET": 11, "CAVALIER": 12, "DAME": 13, "ROI": 14,
  };
  return rankOrder[rank] || 0;
}

function countTrumps(hand) {
  return hand.filter(card => card.suit === "TRUMPS").length;
}

function countOudlers(hand) {
  return hand.filter(card =>
    card.rank === "EXCUSE" ||
    card.rank === "TRUMP_1" ||
    card.rank === "TRUMP_21"
  ).length;
}',
  '// Code spécifique au bot Facile
// Le bot joue de manière aléatoire avec peu de stratégie

function decideBid(hand, currentHighestBid) {
  const random = Math.random();
  if (random < bidPassThreshold) return "PASS";
  if (random < bidPetiteThreshold) return "PETITE";
  return "GARDE";
}

function chooseCardToPlay(gameState, playerSeat) {
  const hand = gameState.hands[playerSeat];
  const playableCards = hand.filter(card => canPlayCard(gameState, playerSeat, card.id));
  
  if (playableCards.length === 0) return null;
  
  // Joue une carte aléatoire
  return playableCards[Math.floor(Math.random() * playableCards.length)].id;
}',
  '{"bidPassThreshold": 0.7, "bidPetiteThreshold": 0.9, "aggressiveness": 0.3, "riskTaking": 0.2}'
),
(
  'medium',
  '',
  '// Code spécifique au bot Moyen
// Le bot utilise une stratégie intermédiaire

function decideBid(hand, currentHighestBid) {
  const trumpCount = countTrumps(hand);
  const oudlerCount = countOudlers(hand);
  
  if (trumpCount < minTrumpsForBid) return "PASS";
  if (trumpCount >= strongTrumpsCount && oudlerCount >= minOudlersForBid) return "PETITE";
  if (trumpCount < safeTrumpsCount) return "PASS";
  
  return "PETITE";
}

function chooseCardToPlay(gameState, playerSeat) {
  const hand = gameState.hands[playerSeat];
  const playableCards = hand.filter(card => canPlayCard(gameState, playerSeat, card.id));
  
  if (playableCards.length === 0) return null;
  if (playableCards.length === 1) return playableCards[0].id;
  
  const currentTrick = gameState.currentTrick;
  const isLeading = currentTrick.length === 0;
  
  if (isLeading) {
    // Joue le plus petit atout ou la plus petite carte
    const trumps = playableCards.filter(c => c.suit === "TRUMPS");
    if (trumps.length > 0) {
      return trumps.reduce((lowest, card) =>
        getRankValue(card.rank) < getRankValue(lowest.rank) ? card : lowest
      ).id;
    }
    
    return playableCards.reduce((lowest, card) =>
      card.points < lowest.points ? card : lowest
    ).id;
  }
  
  // Essaie de prendre avec le plus petit atout gagnant
  const winningCard = findWinningCard(currentTrick);
  const canWin = playableCards.some(card =>
    card.suit === "TRUMPS" &&
    getRankValue(card.rank) > getRankValue(winningCard.rank)
  );
  
  if (canWin) {
    const trumps = playableCards.filter(c =>
      c.suit === "TRUMPS" &&
      getRankValue(c.rank) > getRankValue(winningCard.rank)
    );
    return trumps.reduce((lowest, card) =>
      getRankValue(card.rank) < getRankValue(lowest.rank) ? card : lowest
    ).id;
  }
  
  return playableCards.reduce((lowest, card) =>
    card.points < lowest.points ? card : lowest
  ).id;
}',
  '{"minTrumpsForBid": 5, "strongTrumpsCount": 8, "minOudlersForBid": 1, "safeTrumpsCount": 7, "aggressiveness": 0.5, "riskTaking": 0.4}'
),
(
  'hard',
  '',
  '// Code spécifique au bot Difficile
// Le bot utilise une stratégie avancée avec analyse approfondie

function hasStrongHand(hand) {
  const trumpCount = countTrumps(hand);
  const oudlerCount = countOudlers(hand);
  const highTrumps = hand.filter(card =>
    card.suit === "TRUMPS" && getRankValue(card.rank) >= highTrumpThreshold
  ).length;
  
  return trumpCount >= strongHandTrumps || oudlerCount >= strongHandOudlers || 
         (trumpCount >= mediumHandTrumps && highTrumps >= minHighTrumps);
}

function decideBid(hand, currentHighestBid) {
  const trumpCount = countTrumps(hand);
  const oudlerCount = countOudlers(hand);
  
  if (trumpCount < minTrumpsForBid) return "PASS";
  
  if (hasStrongHand(hand)) {
    if (oudlerCount >= excellentOudlers && trumpCount >= excellentTrumps) {
      const bidValues = {
        "PASS": 0, "PETITE": 1, "GARDE": 2, "GARDE_SANS": 3, "GARDE_CONTRE": 4
      };
      const currentBidValue = currentHighestBid ? bidValues[currentHighestBid] : 0;
      
      if (oudlerCount === 3 && trumpCount >= maxTrumps) {
        return currentBidValue < 2 ? "GARDE" : "PASS";
      }
      return currentBidValue < 1 ? "GARDE" : "PASS";
    }
    
    if (trumpCount >= goodTrumps) return "PETITE";
  }
  
  return "PASS";
}

function chooseCardToPlay(gameState, playerSeat) {
  const hand = gameState.hands[playerSeat];
  const playableCards = hand.filter(card => canPlayCard(gameState, playerSeat, card.id));
  
  if (playableCards.length === 0) return null;
  if (playableCards.length === 1) return playableCards[0].id;
  
  const currentTrick = gameState.currentTrick;
  const isLeading = currentTrick.length === 0;
  const isTaker = gameState.takerSeat === playerSeat;
  const trickPoints = currentTrick.reduce((sum, pc) => sum + pc.card.points, 0);
  
  if (isLeading) {
    if (isTaker) {
      const strongTrumps = playableCards.filter(c =>
        c.suit === "TRUMPS" && getRankValue(c.rank) >= highTrumpThreshold
      );
      if (strongTrumps.length > 0) {
        return strongTrumps[Math.floor(Math.random() * strongTrumps.length)].id;
      }
    }
    
    const lowValueCards = playableCards.filter(c => c.points <= lowCardThreshold);
    if (lowValueCards.length > 0) {
      return lowValueCards[0].id;
    }
    
    return playableCards[0].id;
  }
  
  const winningCard = findWinningCard(currentTrick);
  const shouldTryToWin = isTaker || trickPoints >= valuableTrickThreshold;
  
  if (shouldTryToWin) {
    const winningCards = playableCards.filter(card => {
      if (winningCard.suit === "TRUMPS") {
        return card.suit === "TRUMPS" && getRankValue(card.rank) > getRankValue(winningCard.rank);
      }
      return card.suit === "TRUMPS" ||
        (card.suit === winningCard.suit && getRankValue(card.rank) > getRankValue(winningCard.rank));
    });
    
    if (winningCards.length > 0) {
      return winningCards.reduce((lowest, card) =>
        getRankValue(card.rank) < getRankValue(lowest.rank) ? card : lowest
      ).id;
    }
  }
  
  return playableCards.reduce((lowest, card) =>
    card.points < lowest.points ? card : lowest
  ).id;
}',
  '{"minTrumpsForBid": 6, "strongHandTrumps": 8, "strongHandOudlers": 2, "mediumHandTrumps": 6, "minHighTrumps": 3, "highTrumpThreshold": 15, "excellentOudlers": 2, "excellentTrumps": 10, "maxTrumps": 12, "goodTrumps": 8, "lowCardThreshold": 0.5, "valuableTrickThreshold": 10, "aggressiveness": 0.8, "riskTaking": 0.7}'
)
ON CONFLICT (level) DO NOTHING;