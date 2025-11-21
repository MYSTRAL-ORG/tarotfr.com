import { PlayedCard, Player } from '@/lib/types';
import { TarotCard } from './TarotCard';
import { cn } from '@/lib/utils';
import { useEffect, useState, useRef, useCallback } from 'react';
import Image from 'next/image';

interface TrickAreaProps {
  cards: PlayedCard[];
  className?: string;
  winnerSeat?: number | null;
  players?: Player[];
  currentPlayerSeat?: number;
  onAnimationComplete?: () => void;
}

interface AnimatingCard {
  playedCard: PlayedCard;
  startPosition: { x: number; y: number };
  finalIndex: number;
}

export function TrickArea({ cards, className, winnerSeat, players = [], currentPlayerSeat, onAnimationComplete }: TrickAreaProps) {
  const [animatingToWinner, setAnimatingToWinner] = useState(false);
  const [animatingCards, setAnimatingCards] = useState<AnimatingCard[]>([]);
  const [settledCards, setSettledCards] = useState<PlayedCard[]>([]);
  const prevCardsLengthRef = useRef(0);
  const trickAreaRef = useRef<HTMLDivElement>(null);

  const getPlayerCardStartPosition = useCallback((playerSeat: number): { x: number; y: number } => {
    if (!trickAreaRef.current) return { x: 0, y: 0 };

    const rect = trickAreaRef.current.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const currentPlayer = players.find(p => p.seatIndex === currentPlayerSeat);
    if (!currentPlayer) return { x: centerX, y: centerY };

    const relativePosition = (playerSeat - currentPlayer.seatIndex + 4) % 4;

    switch (relativePosition) {
      case 0:
        return { x: centerX, y: rect.height + 150 };
      case 1:
        return { x: rect.width + 200, y: centerY };
      case 2:
        return { x: centerX, y: -150 };
      case 3:
        return { x: -200, y: centerY };
      default:
        return { x: centerX, y: centerY };
    }
  }, [players, currentPlayerSeat]);

  useEffect(() => {
    if (cards.length === 0) {
      setSettledCards([]);
      setAnimatingCards([]);
      prevCardsLengthRef.current = 0;
      return;
    }

    if (cards.length > prevCardsLengthRef.current) {
      const newCard = cards[cards.length - 1];
      const startPos = getPlayerCardStartPosition(newCard.playerSeat);

      setAnimatingCards(prev => [...prev, {
        playedCard: newCard,
        startPosition: startPos,
        finalIndex: cards.length - 1
      }]);

      setTimeout(() => {
        setSettledCards(prev => [...prev, newCard]);
        setAnimatingCards(prev => prev.filter(ac => ac.playedCard !== newCard));
      }, 600);
    }

    prevCardsLengthRef.current = cards.length;
  }, [cards, getPlayerCardStartPosition]);

  useEffect(() => {
    if (winnerSeat !== null && winnerSeat !== undefined && cards.length === 4) {
      const timer = setTimeout(() => {
        setAnimatingToWinner(true);
      }, 2000);

      return () => clearTimeout(timer);
    } else {
      setAnimatingToWinner(false);
    }
  }, [winnerSeat, cards.length]);

  const getWinnerPosition = () => {
    if (winnerSeat === null || winnerSeat === undefined || !players.length) return { x: 0, y: 0 };

    const winnerPlayer = players.find(p => p.seatIndex === winnerSeat);
    if (!winnerPlayer) return { x: 0, y: 0 };

    const currentPlayer = players.find(p => p.seatIndex === currentPlayerSeat);
    if (!currentPlayer) return { x: 0, y: 0 };

    const relativePosition = (winnerSeat - currentPlayer.seatIndex + 4) % 4;

    switch (relativePosition) {
      case 0:
        return { x: 0, y: 300 };
      case 1:
        return { x: 400, y: 0 };
      case 2:
        return { x: 0, y: -300 };
      case 3:
        return { x: -400, y: 0 };
      default:
        return { x: 0, y: 0 };
    }
  };

  const winnerPos = getWinnerPosition();

  return (
    <div ref={trickAreaRef} className={cn('relative w-full h-full bg-green-700 rounded-xl mb-5 flex items-center justify-center', className)}>
      <div className="absolute inset-0 flex items-center justify-center opacity-10">
        <Image
          src="/img/logo-carpet.svg"
          alt=""
          width={288}
          height={288}
          className="object-contain"
        />
      </div>
      <div className="absolute inset-[20px] border-[10px] border-white/10 rounded-xl pointer-events-none"></div>

      {winnerSeat !== null && winnerSeat !== undefined && cards.length === 4 && (
        <div className="absolute inset-0 flex items-center justify-center z-50">
          <div className="text-3xl font-bold text-yellow-400 animate-pulse bg-black/30 px-6 py-3 rounded-lg">
            Vainqueur: {players.find(p => p.seatIndex === winnerSeat)?.displayName || `Joueur ${winnerSeat + 1}`}
          </div>
        </div>
      )}

      {animatingCards.map((animCard, idx) => {
        const offset = 100;
        const totalCards = cards.length;
        const baseLeft = `calc(50% - ${(totalCards - 1) * offset / 2}px + ${animCard.finalIndex * offset}px)`;

        return (
          <div
            key={`animating-${animCard.playedCard.card.id}-${idx}`}
            className="absolute"
            style={{
              zIndex: 100 + idx,
              left: baseLeft,
              top: '50%',
              transform: 'translateY(-50%)',
              transition: 'none',
            }}
          >
            <div
              className="animate-card-fly"
              style={{
                '--start-x': `${animCard.startPosition.x}px`,
                '--start-y': `${animCard.startPosition.y}px`,
              } as React.CSSProperties}
            >
              <TarotCard card={animCard.playedCard.card} size="xl" />
            </div>
          </div>
        );
      })}

      {settledCards.map((playedCard, index) => {
        const offset = 100;
        const baseLeft = `calc(50% - ${(cards.length - 1) * offset / 2}px + ${index * offset}px)`;

        return (
          <div
            key={`${playedCard.card.id}-${index}`}
            className="absolute top-1/2 -translate-y-1/2"
            style={{
              zIndex: index,
              left: animatingToWinner ? undefined : baseLeft,
              transform: animatingToWinner
                ? `translate(${winnerPos.x}px, ${winnerPos.y}px) scale(0.5)`
                : 'translateY(-50%)',
              transition: 'all 1s ease-in-out',
              opacity: animatingToWinner ? 0 : 1,
            }}
          >
            <TarotCard card={playedCard.card} size="xl" />
          </div>
        );
      })}
    </div>
  );
}
