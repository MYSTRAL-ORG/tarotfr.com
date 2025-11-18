import { BidType } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface BiddingPanelProps {
  onBid: (bidType: BidType) => void;
  isMyTurn: boolean;
  availableBids: BidType[];
}

export function BiddingPanel({ onBid, isMyTurn, availableBids }: BiddingPanelProps) {
  const bidLabels: Record<BidType, string> = {
    PASS: 'Passer',
    PETITE: 'Petite',
    GARDE: 'Garde',
    GARDE_SANS: 'Garde Sans',
    GARDE_CONTRE: 'Garde Contre',
  };

  const bidDescriptions: Record<BidType, string> = {
    PASS: 'Ne pas prendre',
    PETITE: 'Contrat de base (x1)',
    GARDE: 'Contrat renforcé (x2)',
    GARDE_SANS: 'Sans le chien (x4)',
    GARDE_CONTRE: 'Chien aux défenseurs (x6)',
  };

  if (!isMyTurn) {
    return (
      <Card className="p-6 text-center">
        <p className="text-slate-600">En attente des enchères...</p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4 text-slate-900">
        Votre enchère
      </h3>
      <div className="grid grid-cols-2 gap-3">
        {(['PASS', 'PETITE', 'GARDE', 'GARDE_SANS', 'GARDE_CONTRE'] as BidType[]).map((bid) => {
          const isAvailable = availableBids.includes(bid);
          return (
            <Button
              key={bid}
              onClick={() => onBid(bid)}
              disabled={!isAvailable}
              variant={bid === 'PASS' ? 'outline' : 'default'}
              className="h-auto py-3 flex flex-col items-start"
            >
              <span className="font-semibold">{bidLabels[bid]}</span>
              <span className="text-xs opacity-80">{bidDescriptions[bid]}</span>
            </Button>
          );
        })}
      </div>
    </Card>
  );
}
