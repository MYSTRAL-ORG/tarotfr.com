import { PlayedCard, Player } from '@/lib/types';
import { TarotCard } from './TarotCard';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

interface TrickAreaProps {
  cards: PlayedCard[];
  className?: string;
  winnerSeat?: number | null;
  players?: Player[];
  currentPlayerSeat?: number;
}

export function TrickArea({ cards, className, winnerSeat, players = [], currentPlayerSeat }: TrickAreaProps) {
  const [animatingToWinner, setAnimatingToWinner] = useState(false);

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
    <div className={cn('relative w-full h-full bg-green-700 rounded-xl mb-5 flex items-center justify-center', className)}>
      <div className="absolute inset-0 flex items-center justify-center opacity-10">
        <img
          src="/img/logo-carpet.svg"
          alt=""
          className="w-72 h-72 object-contain"
        />
      </div>
      <div className="absolute inset-[20px] border-[10px] border-white/10 rounded-xl pointer-events-none"></div>

      {winnerSeat !== null && winnerSeat !== undefined && cards.length === 4 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-3xl font-bold text-yellow-400 animate-pulse bg-black/30 px-6 py-3 rounded-lg">
            Vainqueur: {players.find(p => p.seatIndex === winnerSeat)?.displayName || `Joueur ${winnerSeat + 1}`}
          </div>
        </div>
      )}

      {cards.map((playedCard, index) => {
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
