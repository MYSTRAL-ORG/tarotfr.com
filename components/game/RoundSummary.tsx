'use client';

import { Player, BidType } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, Users } from 'lucide-react';
import { useEffect, useState } from 'react';

interface RoundSummaryProps {
  roundNumber: number;
  players: Player[];
  takerSeat: number | null;
  contract: BidType | null;
  roundScores: Record<number, number>;
  totalScores: Record<number, number>;
  contractWon: boolean;
  onContinue?: () => void;
  isGameOver?: boolean;
}

export function RoundSummary({
  roundNumber,
  players,
  takerSeat,
  contract,
  roundScores,
  totalScores,
  contractWon,
  onContinue,
  isGameOver = false,
}: RoundSummaryProps) {
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (!isGameOver && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (!isGameOver && countdown === 0 && onContinue) {
      onContinue();
    }
  }, [countdown, isGameOver, onContinue]);

  const getContractText = (contract: BidType | null) => {
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
        return 'Aucun contrat';
    }
  };

  const takerPlayer = takerSeat !== null ? players.find(p => p.seatIndex === takerSeat) : null;
  const partnerSeat = takerSeat !== null ? (takerSeat + 2) % 4 : null;
  const partnerPlayer = partnerSeat !== null ? players.find(p => p.seatIndex === partnerSeat) : null;

  const attackTeam = [takerPlayer, partnerPlayer].filter(Boolean) as Player[];
  const defenseTeam = players.filter(p => p.seatIndex !== takerSeat && p.seatIndex !== partnerSeat);

  const attackScore = attackTeam.reduce((sum, p) => sum + (roundScores[p.seatIndex] || 0), 0);
  const defenseScore = defenseTeam.reduce((sum, p) => sum + (roundScores[p.seatIndex] || 0), 0);

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <Card className="max-w-2xl w-full p-8 space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold text-slate-900">
            {isGameOver ? '🎉 Partie Terminée !' : `Round ${roundNumber} - Terminé`}
          </h2>
          {takerPlayer && contract && (
            <p className="text-lg text-slate-600">
              <span className="font-semibold">{takerPlayer.displayName}</span> a joué{' '}
              <span className="font-bold text-blue-600">{getContractText(contract)}</span>
            </p>
          )}
        </div>

        <div className="space-y-4">
          <div className={`p-4 rounded-lg ${contractWon ? 'bg-green-50 border-2 border-green-500' : 'bg-red-50 border-2 border-red-500'}`}>
            <div className="flex items-center justify-center gap-2 mb-2">
              <Trophy className={`w-6 h-6 ${contractWon ? 'text-green-600' : 'text-red-600'}`} />
              <h3 className={`text-xl font-bold ${contractWon ? 'text-green-700' : 'text-red-700'}`}>
                {contractWon ? 'Contrat Réussi !' : 'Contrat Échoué'}
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="text-center">
                <div className="text-sm text-slate-600 mb-1">Attaque</div>
                <div className="font-bold text-lg text-slate-900">{attackScore} points</div>
                <div className="text-xs text-slate-500 mt-1">
                  {attackTeam.map(p => p.displayName).join(' & ')}
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-slate-600 mb-1">Défense</div>
                <div className="font-bold text-lg text-slate-900">{defenseScore} points</div>
                <div className="text-xs text-slate-500 mt-1">
                  {defenseTeam.map(p => p.displayName).join(' & ')}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-slate-700 text-center">
              {isGameOver ? 'Scores Finaux' : 'Scores Cumulés'}
            </h4>
            <div className="grid grid-cols-2 gap-3">
              {players.map((player) => (
                <div
                  key={player.userId}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-slate-500" />
                    <span className="font-medium text-slate-900 text-sm">
                      {player.displayName}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-slate-900">
                      {totalScores[player.seatIndex] || 0}
                    </div>
                    {!isGameOver && (
                      <div className="text-xs text-slate-500">
                        +{roundScores[player.seatIndex] || 0}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {!isGameOver ? (
          <div className="text-center">
            <p className="text-slate-600 mb-2">Prochain round dans</p>
            <div className="text-4xl font-bold text-blue-600">{countdown}</div>
          </div>
        ) : (
          <div className="text-center">
            <Button size="lg" onClick={onContinue} className="px-8">
              Retour au lobby
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
