import { Player } from '@/lib/types';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { User, Check, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PlayerSeatProps {
  player: Player | null;
  position: 'top' | 'left' | 'right' | 'bottom';
  isCurrentPlayer?: boolean;
  cardCount?: number;
  className?: string;
  playerColor?: 'yellow' | 'red' | 'purple';
  onAddBot?: () => void;
  onRemoveBot?: (botId: string) => void;
  canModify?: boolean;
  gameStarted?: boolean;
}

export function PlayerSeat({
  player,
  position,
  isCurrentPlayer = false,
  cardCount,
  className,
  playerColor = 'yellow',
  onAddBot,
  onRemoveBot,
  canModify = false,
  gameStarted = false,
}: PlayerSeatProps) {
  if (!player) {
    return (
      <div
        className={cn(
          'p-4 rounded-lg border-2 border-dashed border-slate-300 bg-slate-50/50',
          'flex flex-col items-center justify-center gap-2',
          'min-w-[120px] relative group',
          className
        )}
      >
        <span className="text-sm text-slate-400">En attente...</span>
        {canModify && !gameStarted && onAddBot && (
          <Button
            size="sm"
            variant="outline"
            onClick={onAddBot}
            className="bg-blue-500 hover:bg-blue-600 text-white border-blue-600 opacity-80 group-hover:opacity-100 transition-opacity"
          >
            <Plus className="w-4 h-4 mr-1" />
            Ajouter bot
          </Button>
        )}
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
        'p-4 rounded-lg transition-all relative group',
        isCurrentPlayer ? `border-4 ${colorClasses.border} bg-transparent` : 'bg-transparent',
        className
      )}
    >
      <div className="flex flex-col items-center gap-2">
        <div className="relative">
          <Avatar className={cn(
            'w-12 h-12 border-0',
            colorClasses.bg
          )}>
            <AvatarFallback className={cn(
              `${colorClasses.bg} text-white`
            )}>
              {getInitials(player.displayName)}
            </AvatarFallback>
          </Avatar>
          {player.isBot && canModify && !gameStarted && onRemoveBot && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onRemoveBot(player.userId)}
              className="absolute -top-2 -right-2 w-6 h-6 p-0 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-4 h-4" />
            </Button>
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
