import { GamePhase, BidType } from '@/lib/types';
import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface GameStatusBarProps {
  phase: GamePhase;
  contract: BidType | null;
  takerName: string | null;
  currentPlayerName: string;
  className?: string;
  actions?: ReactNode;
}

export function GameStatusBar({
  phase,
  contract,
  takerName,
  currentPlayerName,
  className,
  actions,
}: GameStatusBarProps) {
  const getPhaseText = () => {
    switch (phase) {
      case 'LOBBY':
        return 'En attente de joueurs';
      case 'DEALING':
        return 'Distribution des cartes';
      case 'BIDDING':
        return 'Phase d\'enchères';
      case 'DOG_REVEAL':
        return 'Révélation du chien';
      case 'PLAYING':
        return 'Jeu en cours';
      case 'SCORING':
        return 'Calcul des scores';
      case 'END':
        return 'Partie terminée';
      default:
        return 'En attente';
    }
  };

  const getContractText = (contract: BidType) => {
    switch (contract) {
      case 'PETITE':
        return 'Petite';
      case 'GARDE':
        return 'Garde';
      case 'GARDE_SANS':
        return 'Garde Sans';
      case 'GARDE_CONTRE':
        return 'Garde Contre';
      default:
        return '';
    }
  };

  return (
    <div className={cn('bg-white rounded-lg p-4', className)}>
      <div className="flex items-center justify-between">
        <div className="space-y-1 flex-1">
          <div className="text-sm font-semibold text-slate-900">
            {getPhaseText()}
          </div>
          {contract && takerName && (
            <div className="text-sm text-slate-600">
              <span className="font-medium">Vous</span>
              {' joue '}
              <span className="font-semibold text-blue-600">
                {getContractText(contract)}
              </span>
            </div>
          )}
        </div>

        <div className="flex-shrink-0 mx-4">
          <img src="/img/icon.png" alt="Tarot" className="w-12 h-12" />
        </div>

        {actions ? (
          <div className="flex-1 flex justify-end gap-2">
            {actions}
          </div>
        ) : (
          <div className="text-right flex-1">
            <div className="text-xs text-slate-500">Tour de</div>
            <div className="text-sm font-semibold text-slate-900">
              {currentPlayerName}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
