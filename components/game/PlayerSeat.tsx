import { Player } from '@/lib/types';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { User, Check } from 'lucide-react';

interface PlayerSeatProps {
  player: Player | null;
  position: 'top' | 'left' | 'right' | 'bottom';
  isCurrentPlayer?: boolean;
  cardCount?: number;
  className?: string;
  playerColor?: 'yellow' | 'red' | 'purple';
}

export function PlayerSeat({
  player,
  position,
  isCurrentPlayer = false,
  cardCount,
  className,
  playerColor = 'yellow',
}: PlayerSeatProps) {
  if (!player) {
    return (
      <div
        className={cn(
          'p-4 rounded-lg border-2 border-dashed border-slate-300 bg-slate-50',
          'flex items-center justify-center',
          'min-w-[120px]',
          className
        )}
      >
        <span className="text-sm text-slate-400">En attente...</span>
      </div>
    );
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getColorClasses = () => {
    const colors = {
      yellow: {
        bg: 'bg-yellow-500',
        bgLight: 'bg-white',
        border: 'border-yellow-500',
        ring: 'ring-yellow-500',
      },
      red: {
        bg: 'bg-red-500',
        bgLight: 'bg-white',
        border: 'border-red-500',
        ring: 'ring-red-500',
      },
      purple: {
        bg: 'bg-purple-500',
        bgLight: 'bg-white',
        border: 'border-purple-500',
        ring: 'ring-purple-500',
      },
    };
    return colors[playerColor];
  };

  const colorClasses = getColorClasses();

  return (
    <div
      className={cn(
        'p-4 rounded-lg transition-all',
        isCurrentPlayer ? `border-4 ${colorClasses.border} bg-transparent` : 'bg-transparent',
        className
      )}
    >
      <div className="flex flex-col items-center gap-2">
        <div className="relative">
          <Avatar className={cn(
            'w-12 h-12 border-0',
            isCurrentPlayer ? colorClasses.bgLight : colorClasses.bg
          )}>
            <AvatarFallback className={cn(
              isCurrentPlayer ? 'bg-white text-slate-900' : `${colorClasses.bg} text-white`
            )}>
              {getInitials(player.displayName)}
            </AvatarFallback>
          </Avatar>
          {player.isReady && (
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center border-2 border-white">
              <Check className="w-3 h-3 text-white" />
            </div>
          )}
        </div>

        <div className="text-center">
          <div className="font-semibold text-sm text-white">
            {player.displayName}
          </div>
        </div>
      </div>
    </div>
  );
}
