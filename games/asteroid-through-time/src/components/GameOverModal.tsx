import React from 'react';
import { RotateCcw, Home, Trophy, Skull } from 'lucide-react';
import { RunStats } from '../game/types';
import { formatYears } from '../game/ScoreSystem';

interface GameOverModalProps {
  stats: RunStats | null;
  onRestart: () => void;
  onTitle: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  stats,
  onRestart,
  onTitle,
}) => {
  if (!stats) return null;

  const isNewRecord = stats.scoreYears >= stats.bestScoreYears && stats.scoreYears > 0;

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center p-3 sm:p-4 bg-black/80 select-none animate-fadeIn">
      <div className="w-full max-w-md max-h-[92dvh] overflow-y-auto rounded-xl bg-[#090d19] border border-orange-500/40 p-4 sm:p-6 md:p-8 shadow-2xl shadow-orange-950/70 flex flex-col items-center text-center space-y-3 sm:space-y-6">
        {/* Header */}
        <div className="space-y-0.5 sm:space-y-1">
          <div className="inline-flex items-center space-x-1.5 text-[10px] sm:text-xs font-mono font-bold tracking-widest text-rose-400 uppercase">
            <Skull className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-400" />
            <span>TRAJECTORY TERMINATED</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-black text-white tracking-wider">
            IMPACT EXTINCTION
          </h2>
        </div>

        {/* Thematic Result Message from GDD */}
        <div className="px-3 py-1.5 sm:px-4 sm:py-2 rounded bg-orange-950/40 border border-orange-500/20 text-orange-200 text-xs md:text-sm font-medium italic">
          "{stats.endMessage}"
        </div>

        {/* Main Score Banner */}
        <div className="w-full py-2.5 px-4 sm:py-4 sm:px-6 rounded-lg bg-black/50 border border-amber-500/30 flex flex-col items-center">
          <span className="text-[9px] sm:text-[10px] font-mono tracking-widest text-amber-400 uppercase">
            TIME TRAVELLED
          </span>
          <span className="text-2xl sm:text-3xl md:text-4xl font-display font-black text-white tabular-nums drop-shadow-[0_2px_12px_rgba(249,115,22,0.5)]">
            {formatYears(stats.scoreYears)}
          </span>
          <span className="text-[11px] sm:text-xs font-mono text-slate-400 mt-0.5 sm:mt-1">
            Reached: <strong className="text-amber-300">{stats.eraName}</strong>
          </span>
        </div>

        {/* Stats Grid */}
        <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
          <div className="p-2 rounded bg-slate-900/80 border border-slate-800">
            <div className="flex items-center justify-center space-x-1 text-[10px] font-mono text-slate-400 uppercase">
              <Trophy className="w-3 h-3 text-yellow-400" />
              <span>RECORD</span>
            </div>
            <div className="text-xs font-display font-bold text-amber-300 tabular-nums mt-0.5">
              {formatYears(stats.bestScoreYears)}
            </div>
            {isNewRecord && (
              <span className="text-[9px] font-bold text-yellow-300 uppercase block">NEW BEST!</span>
            )}
          </div>

          <div className="p-2 rounded bg-slate-900/80 border border-slate-800">
            <span className="text-[10px] font-mono text-slate-400 uppercase block">PLANETS</span>
            <span className="text-xs font-display font-bold text-sky-400 tabular-nums mt-0.5">
              {stats.planetsAvoided}
            </span>
            <span className="text-[9px] font-mono text-slate-500 block">CLEARED</span>
          </div>

          <div className="p-2 rounded bg-slate-900/80 border border-slate-800">
            <span className="text-[10px] font-mono text-slate-400 uppercase block">WORMHOLES</span>
            <span className="text-xs font-display font-bold text-cyan-400 tabular-nums mt-0.5">
              {stats.wormholesTraversed || 0}
            </span>
            <span className="text-[9px] font-mono text-slate-500 block">WARPED</span>
          </div>

          <div className="p-2 rounded bg-slate-900/80 border border-slate-800">
            <span className="text-[10px] font-mono text-slate-400 uppercase block">SLINGSHOTS</span>
            <span className="text-xs font-display font-bold text-amber-400 tabular-nums mt-0.5">
              {stats.blackholesSlingshot || 0}
            </span>
            <span className="text-[9px] font-mono text-slate-500 block">ASSISTED</span>
          </div>
        </div>

        {/* Action CTAs */}
        <div className="w-full flex flex-col space-y-2.5 pt-2">
          <button
            data-start="true"
            onClick={onRestart}
            className="w-full py-3.5 rounded-lg bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-slate-950 font-display font-bold text-base tracking-wider uppercase shadow-lg shadow-orange-500/25 flex items-center justify-center space-x-2 transition cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 stroke-[2.5]" />
            <span>TRY AGAIN [ENTER / SPACE]</span>
          </button>

          <button
            onClick={onTitle}
            className="w-full py-2.5 rounded text-slate-400 hover:text-slate-200 text-xs font-mono tracking-wider flex items-center justify-center space-x-2 transition cursor-pointer"
          >
            <Home className="w-3.5 h-3.5" />
            <span>RETURN TO TITLE</span>
          </button>
        </div>
      </div>
    </div>
  );
};
