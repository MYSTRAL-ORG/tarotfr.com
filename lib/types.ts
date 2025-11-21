export type TarotSuit = 'HEARTS' | 'DIAMONDS' | 'CLUBS' | 'SPADES' | 'TRUMPS' | 'EXCUSE';

export type TarotRank =
  | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10'
  | 'VALET' | 'CAVALIER' | 'DAME' | 'ROI'
  | 'TRUMP_1' | 'TRUMP_2' | 'TRUMP_3' | 'TRUMP_4' | 'TRUMP_5'
  | 'TRUMP_6' | 'TRUMP_7' | 'TRUMP_8' | 'TRUMP_9' | 'TRUMP_10'
  | 'TRUMP_11' | 'TRUMP_12' | 'TRUMP_13' | 'TRUMP_14' | 'TRUMP_15'
  | 'TRUMP_16' | 'TRUMP_17' | 'TRUMP_18' | 'TRUMP_19' | 'TRUMP_20' | 'TRUMP_21'
  | 'EXCUSE';

export type BidType = 'PASS' | 'PETITE' | 'GARDE' | 'GARDE_SANS' | 'GARDE_CONTRE';

export type GamePhase = 'LOBBY' | 'DEALING' | 'BIDDING' | 'DOG_REVEAL' | 'PLAYING' | 'SCORING' | 'END';

export type TableStatus = 'WAITING' | 'IN_GAME' | 'FINISHED';

export interface TarotCard {
  id: string;
  suit: TarotSuit;
  rank: TarotRank;
  points: number;
}

export interface Player {
  id: string;
  userId: string;
  displayName: string;
  seatIndex: number;
  isReady: boolean;
  isBot?: boolean;
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
}

export interface Bid {
  playerSeat: number;
  bidType: BidType;
}

export interface PlayedCard {
  playerSeat: number;
  card: TarotCard;
}

export interface Trick {
  leadSeat: number;
  cards: PlayedCard[];
  winnerSeat: number | null;
}

export interface TarotGameState {
  phase: GamePhase;
  players: Player[];
  hands: Record<number, TarotCard[]>;
  dog: TarotCard[];
  isDogRevealed: boolean;
  currentDealerSeat: number;
  currentPlayerSeat: number;
  bids: Bid[];
  takerSeat: number | null;
  contract: BidType | null;
  currentTrick: PlayedCard[];
  currentTrickWinner: number | null;
  completedTricks: Trick[];
  scores: Record<number, number>;
  currentRound: number;
  roundScores: Record<number, number>[];
  totalScores: Record<number, number>;
  lastRoundWon: boolean | null;
}

export interface User {
  id: string;
  email: string | null;
  displayName: string;
  isGuest: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GuestSession {
  id: string;
  userId: string;
  nickname: string;
  createdAt: string;
  expiresAt: string;
}

export interface Table {
  id: string;
  status: TableStatus;
  maxPlayers: number;
  createdAt: string;
  updatedAt: string;
}

export interface TablePlayer {
  id: string;
  tableId: string;
  userId: string;
  seatIndex: number;
  isReady: boolean;
  joinedAt: string;
}

export interface Game {
  id: string;
  tableId: string;
  status: GamePhase;
  currentDealerSeat: number | null;
  currentPlayerSeat: number | null;
  takerSeat: number | null;
  contract: BidType | null;
  gameState: TarotGameState;
  createdAt: string;
  updatedAt: string;
}

export interface GameEvent {
  id: string;
  gameId: string;
  eventType: string;
  playerSeat: number;
  payload: Record<string, any>;
  createdAt: string;
}

export interface WSMessage {
  type: string;
  payload?: any;
}

export interface WSClientMessage extends WSMessage {
  type:
    | 'JOIN_TABLE'
    | 'LEAVE_TABLE'
    | 'READY'
    | 'BID'
    | 'PLAY_CARD'
    | 'PING'
    | 'ADD_BOT'
    | 'REMOVE_BOT';
}

export interface WSServerMessage extends WSMessage {
  type:
    | 'TABLE_STATE'
    | 'GAME_STATE'
    | 'PLAYER_JOINED'
    | 'PLAYER_LEFT'
    | 'PLAYER_READY'
    | 'BID_PLACED'
    | 'CARD_PLAYED'
    | 'TRICK_COMPLETE'
    | 'GAME_PHASE_CHANGE'
    | 'DISTRIBUTION_INFO'
    | 'ROUND_END'
    | 'ROUND_START'
    | 'GAME_OVER'
    | 'ERROR'
    | 'PONG'
    | 'BOT_ADDED'
    | 'BOT_REMOVED';
}

export type SeasonStatus = 'active' | 'completed' | 'processing';
export type PromotionStatus = 'promoted' | 'relegated' | 'maintained';

export interface League {
  id: number;
  name: string;
  description: string;
  maxDivisions: number | null;
  createdAt: string;
}

export interface LeagueDivision {
  id: string;
  leagueId: number;
  divisionNumber: number;
  maxPlayers: number;
  createdAt: string;
  league?: League;
}

export interface LeagueSeason {
  id: string;
  seasonNumber: number;
  startDate: string;
  endDate: string;
  status: SeasonStatus;
  createdAt: string;
}

export interface LeagueMembership {
  id: string;
  userId: string;
  divisionId: string;
  seasonId: string;
  leaguePoints: number;
  rank: number | null;
  joinedAt: string;
  updatedAt: string;
  division?: LeagueDivision;
  season?: LeagueSeason;
  user?: User;
}

export interface LeagueReward {
  id: string;
  leagueId: number;
  rank: number;
  rewardTokens: number;
}

export interface LeagueHistory {
  id: string;
  userId: string;
  seasonId: string;
  leagueId: number;
  divisionId: string;
  finalRank: number;
  finalPoints: number;
  rewardTokens: number;
  promotionStatus: PromotionStatus;
  createdAt: string;
  league?: League;
  season?: LeagueSeason;
}

export interface LeagueRanking {
  rank: number;
  userId: string;
  displayName: string;
  leaguePoints: number;
  isCurrentUser: boolean;
}
