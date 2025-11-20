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

  const getCardPosition = (playerSeat: number) => {
    if (isCollecting && winnerSeat !== null && winnerSeat !== undefined) {
      const winnerPositions = [
        'left-1/2 -translate-x-1/2 bottom-0 opacity-0',
        'left-4 top-1/2 -translate-y-1/2 opacity-0',
        'left-1/2 -translate-x-1/2 top-0 opacity-0',
        'right-4 top-1/2 -translate-y-1/2 opacity-0',
      ];
      return winnerPositions[winnerSeat];
    }

    const positions = [
      'left-1/2 -translate-x-1/2 bottom-8',
      'left-8 top-1/2 -translate-y-1/2',
      'left-1/2 -translate-x-1/2 top-8',
      'right-8 top-1/2 -translate-y-1/2',
    ];

    return positions[playerSeat] || positions[0];
  };

  return (
    <div className={cn('relative w-full h-full min-h-[280px] bg-green-700 rounded-xl my-6 flex items-center justify-center p-6', className)}>
      {cards.map((playedCard, index) => (
        <div
          key={`${playedCard.card.id}-${index}`}
          className={cn(
            'absolute transition-all duration-700',
            getCardPosition(playedCard.playerSeat)
          )}
          style={{
            zIndex: index,
          }}
        >
          <TarotCard card={playedCard.card} size="md" />
        </div>
      ))}
      {cards.length === 0 && (
        <div className="text-white/30 text-sm">En attente des cartes...</div>
      )}
    </div>
  );
}
