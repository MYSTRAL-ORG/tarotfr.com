'use client';

import { useState } from 'react';
import { Copy, CheckCircle2, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface DistributionCodeProps {
  hashCode: string;
  distributionNumber?: string;
  sequenceNumber?: string;
}

export function DistributionCode({
  hashCode,
  distributionNumber,
  sequenceNumber,
}: DistributionCodeProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(hashCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  return (
    <div className="flex items-center gap-2 bg-slate-900/80 backdrop-blur-sm px-4 py-2 rounded-lg border border-slate-700/50 shadow-lg">
      <div className="flex items-center gap-2">
        <span className="text-xs text-slate-400 font-medium">Distribution:</span>
        <span className="text-sm font-mono font-bold text-emerald-400 tracking-wider">
          {hashCode}
        </span>
      </div>

      <Button
        size="sm"
        variant="ghost"
        onClick={handleCopy}
        className="h-7 w-7 p-0 hover:bg-slate-800"
      >
        {copied ? (
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
        ) : (
          <Copy className="h-4 w-4 text-slate-400" />
        )}
      </Button>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 w-7 p-0 hover:bg-slate-800"
            >
              <Info className="h-4 w-4 text-slate-400" />
            </Button>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">
            <div className="space-y-2">
              <p className="font-semibold">Code de Distribution Vérifiable</p>
              <p className="text-xs text-slate-300">
                Ce code unique garantit l'équité de la distribution des cartes.
                Vous pourrez consulter toutes les mains après la partie.
              </p>
              {distributionNumber && sequenceNumber && (
                <div className="text-xs text-slate-400 space-y-1 pt-2 border-t border-slate-700">
                  <div>Distribution: {distributionNumber}</div>
                  <div>Séquence: {sequenceNumber}</div>
                </div>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
