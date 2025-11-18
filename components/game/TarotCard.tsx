import Image from 'next/image';
import { TarotCard as TarotCardType } from '@/lib/types';
import { cn } from '@/lib/utils';

interface TarotCardProps {
  card: TarotCardType;
  faceUp?: boolean;
  selectable?: boolean;
  selected?: boolean;
  onClick?: () => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function TarotCard({
  card,
  faceUp = true,
  selectable = false,
  selected = false,
  onClick,
  className,
  size = 'md',
}: TarotCardProps) {
  const sizeClasses = {
    sm: 'w-16 h-24',
    md: 'w-20 h-32',
    lg: 'w-24 h-40',
  };

  const getCardImagePath = () => {
    if (card.suit === 'EXCUSE') {
      return '/img/cards/excuse.png';
    }

    if (card.suit === 'TRUMPS') {
      const trumpNumber = card.rank.replace('TRUMP_', '');
      return `/img/cards/trumps/${trumpNumber}.png`;
    }

    const suitMap: Record<string, string> = {
      'HEARTS': 'hearts',
      'DIAMONDS': 'diamonds',
      'CLUBS': 'clubs',
      'SPADES': 'spades',
    };

    const rankMap: Record<string, string> = {
      '1': '1', '2': '2', '3': '3', '4': '4', '5': '5',
      '6': '6', '7': '7', '8': '8', '9': '9', '10': '10',
      'VALET': '11',
      'CAVALIER': '12',
      'DAME': '13',
      'ROI': '14',
    };

    const suit = suitMap[card.suit];
    const rank = rankMap[card.rank];

    return `/img/cards/base/${suit}/${rank}.png`;
  };

  if (!faceUp) {
    return (
      <div
        className={cn(
          sizeClasses[size],
          'rounded-lg overflow-hidden shadow-md relative',
          className
        )}
      >
        <Image
          src="/img/cards/back-cards.png"
          alt="Dos de carte"
          fill
          className="object-contain"
        />
      </div>
    );
  }

  return (
    <div
      onClick={selectable ? onClick : undefined}
      className={cn(
        sizeClasses[size],
        'rounded-lg overflow-hidden shadow-md transition-all relative',
        selectable && 'cursor-pointer hover:scale-105 hover:shadow-lg',
        selected && 'ring-4 ring-blue-500 -translate-y-2',
        !selectable && 'cursor-default',
        className
      )}
    >
      <Image
        src={getCardImagePath()}
        alt={`${card.suit} ${card.rank}`}
        fill
        className="object-contain"
      />
    </div>
  );
}
