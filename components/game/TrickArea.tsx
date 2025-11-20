import { PlayedCard } from '@/lib/types';
import { TarotCard } from './TarotCard';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';

interface TrickAreaProps {
  cards: PlayedCard[];
  className?: string;
  winnerSeat?: number | null;
}

export function TrickArea({ cards, className, winnerSeat }: TrickAreaProps) {
  const [isCollecting, setIsCollecting] = useState(false);

  useEffect(() => {
    if (cards.length === 4 && winnerSeat !== null && winnerSeat !== undefined) {
      const timer = setTimeout(() => {
        setIsCollecting(true);
      }, 1000);

      return () => clearTimeout(timer);
    } else {
      setIsCollecting(false);
    }
  }, [cards.length, winnerSeat]);

  const getCardPosition = (playerSeat: number, cardIndex: number) => {
    if (isCollecting && winnerSeat !== null && winnerSeat !== undefined) {
      return 'left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 opacity-0';
    }

    const offset = 40;
    const baseLeft = `calc(50% - ${(cards.length - 1) * offset / 2}px + ${cardIndex * offset}px)`;
    return `top-1/2 -translate-y-1/2`;
  };

  return (
    <div className={cn('relative w-full h-full min-h-[280px] bg-green-700 rounded-xl my-6 flex items-center justify-center p-6', className)}>
      <div className="absolute inset-0 flex items-center justify-center opacity-10">
        <img
          src="/img/logo-carpet.svg"
          alt=""
          className="w-72 h-72 object-contain"
        />
      </div>
      {cards.map((playedCard, index) => {
        const offset = 40;
        const baseLeft = `calc(50% - ${(cards.length - 1) * offset / 2}px + ${index * offset}px)`;

        return (
          <div
            key={`${playedCard.card.id}-${index}`}
            className={cn(
              'absolute transition-all duration-700',
              getCardPosition(playedCard.playerSeat, index)
            )}
            style={{
              zIndex: index,
              left: isCollecting && winnerSeat !== null ? '50%' : baseLeft,
              transform: isCollecting && winnerSeat !== null ? 'translate(-50%, -50%)' : 'translateY(-50%)',
            }}
          >
            <TarotCard card={playedCard.card} size="md" />
          </div>
        );
      })}
    </div>
  );
}
