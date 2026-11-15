import React from 'react';
import { Play, RotateCcw, Home } from 'lucide-react';
import { formatYears } from '../game/ScoreSystem';

interface PauseModalProps {
  scoreYears: number;
  onResume: () => void;
  onRestart: () => void;
  onTitle: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  scoreYears,
  onResume,
  onRestart,
  onTitle,
}) => {
  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center p-3 sm:p-4 bg-black/75 select-none">
      <div className="w-full max-w-sm max-h-[92dvh] overflow-y-auto rounded-xl bg-[#0a0f1d] border border-amber-500/40 p-4 sm:p-6 shadow-2xl shadow-orange-950/50 flex flex-col items-center text-center space-y-4 sm:space-y-6">
        <div className="space-y-0.5 sm:space-y-1">
          <span className="text-[10px] font-mono tracking-widest text-amber-400 uppercase">
            CHRONOLOGICAL STASIS
          </span>
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-wider">
            GAME PAUSED
          </h2>
        </div>

        <div className="w-full py-2.5 px-4 rounded bg-slate-900/80 border border-slate-800">
          <span className="block text-[10px] font-mono text-slate-400 uppercase">Current Progress</span>
          <span className="text-lg sm:text-xl font-display font-bold text-amber-300 tabular-nums">
            {formatYears(scoreYears)}
          </span>
        </div>

        <div className="w-full flex flex-col space-y-2.5">
          <button
            onClick={onResume}
            className="w-full py-3 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold font-display tracking-wider flex items-center justify-center space-x-2 transition cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>RESUME [ESC / P]</span>
          </button>

          <button
            onClick={onRestart}
            className="w-full py-2.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold font-display tracking-wider flex items-center justify-center space-x-2 border border-slate-700 transition cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>RESTART [R]</span>
          </button>

          <button
            onClick={onTitle}
            className="w-full py-2 rounded text-slate-400 hover:text-slate-200 text-xs font-mono tracking-wider flex items-center justify-center space-x-2 transition cursor-pointer"
          >
            <Home className="w-3.5 h-3.5" />
            <span>RETURN TO TITLE</span>
          </button>
        </div>
      </div>
    </div>
  );
};
