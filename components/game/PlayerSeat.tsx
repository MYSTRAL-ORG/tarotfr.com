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
}

export function PlayerSeat({
  player,
  position,
  isCurrentPlayer = false,
  cardCount,
  className,
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

  return (
    <div
      className={cn(
        'p-4 rounded-lg border-2 transition-all',
        isCurrentPlayer ? 'border-blue-400 ring-2 ring-blue-200 bg-blue-50/30' : 'border-white/20 bg-transparent',
        className
      )}
    >
      <div className="flex flex-col items-center gap-2">
        <div className="relative">
          <Avatar className={cn(
            'w-12 h-12',
            isCurrentPlayer && 'ring-2 ring-blue-400 ring-offset-2'
          )}>
            <AvatarFallback className="bg-slate-200">
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
