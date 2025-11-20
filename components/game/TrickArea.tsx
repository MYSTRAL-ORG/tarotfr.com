import { PlayedCard } from '@/lib/types';
import { TarotCard } from './TarotCard';
import { cn } from '@/lib/utils';

interface TrickAreaProps {
  cards: PlayedCard[];
  className?: string;
  winnerSeat?: number | null;
}

export function TrickArea({ cards, className, winnerSeat }: TrickAreaProps) {

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
      {cards.map((playedCard, index) => {
        const offset = 100;
        const baseLeft = `calc(50% - ${(cards.length - 1) * offset / 2}px + ${index * offset}px)`;

        return (
          <div
            key={`${playedCard.card.id}-${index}`}
            className="absolute top-1/2 -translate-y-1/2 transition-all duration-300"
            style={{
              zIndex: index,
              left: baseLeft,
            }}
          >
            <TarotCard card={playedCard.card} size="xl" />
          </div>
        );
      })}
    </div>
  );
}
