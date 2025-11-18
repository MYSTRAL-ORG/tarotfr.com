'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Bot, Trash2 } from 'lucide-react';
import { Player } from '@/lib/types';

interface BotSelectorProps {
  players: Player[];
  onAddBot: (difficulty: 'EASY' | 'MEDIUM' | 'HARD') => void;
  onRemoveBot: (botId: string) => void;
  disabled?: boolean;
}

export function BotSelector({
  players,
  onAddBot,
  onRemoveBot,
  disabled = false,
}: BotSelectorProps) {
  const [selectedDifficulty, setSelectedDifficulty] = useState<'EASY' | 'MEDIUM' | 'HARD'>('MEDIUM');

  const bots = players.filter(p => p.isBot);
  const canAddBot = players.length < 4 && !disabled;
  const canRemoveBot = bots.length > 0 && !disabled;

  const handleAddBot = () => {
    if (canAddBot) {
      onAddBot(selectedDifficulty);
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'EASY':
        return 'Faible';
      case 'MEDIUM':
        return 'Moyen';
      case 'HARD':
        return 'Fort';
      default:
        return difficulty;
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Bot className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-slate-900">Joueurs Bots</h3>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">
            Niveau de difficulté
          </label>
          <Select
            value={selectedDifficulty}
            onValueChange={(value) => setSelectedDifficulty(value as 'EASY' | 'MEDIUM' | 'HARD')}
            disabled={!canAddBot}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="EASY">Faible</SelectItem>
              <SelectItem value="MEDIUM">Moyen</SelectItem>
              <SelectItem value="HARD">Fort</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button
          onClick={handleAddBot}
          disabled={!canAddBot}
          className="w-full"
        >
          <Bot className="w-4 h-4 mr-2" />
          Ajouter un bot
        </Button>

        {bots.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-700">
              Bots à la table ({bots.length})
            </p>
            <div className="space-y-2">
              {bots.map((bot) => (
                <div
                  key={bot.id}
                  className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200"
                >
                  <div className="flex items-center gap-2">
                    <Bot className="w-4 h-4 text-blue-600" />
                    <div>
                      <p className="font-medium text-slate-900 text-sm">
                        {bot.displayName}
                      </p>
                      <p className="text-xs text-slate-600">
                        {getDifficultyLabel(bot.difficulty || 'MEDIUM')}
                      </p>
                    </div>
                  </div>
                  {canRemoveBot && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRemoveBot(bot.userId)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {!canAddBot && players.length >= 4 && (
          <p className="text-sm text-slate-500 text-center">
            Table complète (4/4 joueurs)
          </p>
        )}
      </div>
    </Card>
  );
}
