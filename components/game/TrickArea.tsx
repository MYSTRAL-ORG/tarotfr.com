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
  const [shouldDisplay, setShouldDisplay] = useState(true);

  useEffect(() => {
    if (cards.length === 4) {
      setShouldDisplay(true);

      const hideTimer = setTimeout(() => {
        setShouldDisplay(false);
      }, 4000);

      return () => clearTimeout(hideTimer);
    } else {
      setShouldDisplay(true);
    }
  }, [cards.length]);

  return (
    <div className={cn('relative w-full h-full min-h-[500px] bg-green-700 rounded-xl my-6 flex items-center justify-center p-6', className)}>
      <div className="absolute inset-0 flex items-center justify-center opacity-10">
        <img
          src="/img/logo-carpet.svg"
          alt=""
          className="w-72 h-72 object-contain"
        />
      </div>
      {shouldDisplay && cards.map((playedCard, index) => {
        const offset = 120;
        const baseLeft = `calc(50% - ${(cards.length - 1) * offset / 2}px + ${index * offset}px)`;

        return (
          <div
            key={`${playedCard.card.id}-${index}`}
            className="absolute top-1/2 -translate-y-1/2 transition-opacity duration-500"
            style={{
              zIndex: index,
              left: baseLeft,
              opacity: shouldDisplay ? 1 : 0,
            }}
          >
            <TarotCard card={playedCard.card} size="xl" />
          </div>
        );
      })}
    </div>
  );
}
