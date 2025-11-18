import { PlayedCard } from '@/lib/types';
import { TarotCard } from './TarotCard';
import { cn } from '@/lib/utils';

interface TrickAreaProps {
  cards: PlayedCard[];
  className?: string;
}

export function TrickArea({ cards, className }: TrickAreaProps) {
  const getCardPosition = (index: number) => {
    const positions = [
      'left-1/2 -translate-x-1/2 bottom-0',
      'left-0 top-1/2 -translate-y-1/2',
      'left-1/2 -translate-x-1/2 top-0',
      'right-0 top-1/2 -translate-y-1/2',
    ];

    const seatIndex = cards[index].playerSeat;
    return positions[seatIndex] || positions[0];
  };

  return (
    <div className={cn('relative w-full h-full min-h-[200px]', className)}>
      {cards.map((playedCard, index) => (
        <div
          key={`${playedCard.card.id}-${index}`}
          className={cn(
            'absolute transition-all duration-300',
            getCardPosition(index)
          )}
        >
          <TarotCard card={playedCard.card} size="md" />
        </div>
      ))}
    </div>
  );
}
