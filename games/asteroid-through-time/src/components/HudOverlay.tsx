import React from 'react';
import { Pause, Volume2, VolumeX, Sparkles, Sliders, Shield, Gauge } from 'lucide-react';
import { formatYears } from '../game/ScoreSystem';

interface HudOverlayProps {
  scoreYears: number;
  bestScoreYears: number;
  eraName: string;
  isMuted: boolean;
  dinoAlert: string | null;
  warpAlert: string | null;
  godMode?: boolean;
  isDebugOpen?: boolean;
  variableGravityOnHold?: boolean;
  holdTelemetry?: { isHeld: boolean; effectiveGravity: number; holdDuration: number } | null;
  currentSpeed?: number;
  onPause: () => void;
  onToggleMute: () => void;
  onToggleDebug?: () => void;
}

export const HudOverlay: React.FC<HudOverlayProps> = ({
  scoreYears,
  bestScoreYears,
  eraName,
  isMuted,
  dinoAlert,
  warpAlert,
  godMode = false,
  isDebugOpen = false,
  variableGravityOnHold = false,
  holdTelemetry = null,
  currentSpeed,
  onPause,
  onToggleMute,
  onToggleDebug,
}) => {
  return (
    <div className="absolute inset-0 pointer-events-none select-none z-10 flex flex-col justify-between safe-inset">
      {/* Top HUD Cluster */}
      <div className="flex justify-between items-start w-full gap-2">
        {/* Left: Score & Era */}
        <div className="flex flex-col space-y-1 min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="hidden sm:inline text-[10px] md:text-xs font-mono font-bold tracking-widest text-amber-400 uppercase">
              CHRONO PROGRESSION
            </span>
            <div className="inline-flex items-center px-1.5 sm:px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-mono tracking-wider bg-orange-950/60 border border-orange-500/30 text-orange-300">
              {eraName}
            </div>
            {currentSpeed !== undefined && (
              <div
                className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] font-mono bg-cyan-950/70 border border-cyan-500/40 text-cyan-300 shadow-sm"
                title="Cruising speed accelerates as you travel deeper through geological history"
              >
                <Gauge className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-cyan-400" />
                <span>{currentSpeed} px/s</span>
              </div>
            )}
            {godMode && (
              <div className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] font-mono bg-emerald-950/80 border border-emerald-500/40 text-emerald-300">
                <Shield className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-emerald-400" />
                <span>GOD MODE</span>
              </div>
            )}
            {variableGravityOnHold && (
              <div
                className={`inline-flex items-center space-x-1 px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] font-mono border transition-all ${
                  holdTelemetry?.isHeld
                    ? 'bg-purple-950/90 border-purple-400 text-purple-200 shadow-sm shadow-purple-500/40 animate-pulse'
                    : 'bg-purple-950/40 border-purple-800/40 text-purple-300'
                }`}
              >
                <span>⚡ {holdTelemetry?.isHeld ? `HOLD: ${holdTelemetry.holdDuration.toFixed(2)}s` : 'HOLD-G'}</span>
              </div>
            )}
          </div>

          <div className="font-display font-extrabold text-xl sm:text-2xl md:text-4xl text-white tracking-wide tabular-nums drop-shadow-[0_2px_8px_rgba(249,115,22,0.4)]">
            {formatYears(scoreYears)}
          </div>
        </div>

        {/* Right: Personal Record & Utility Controls */}
        <div className="flex items-center space-x-1.5 sm:space-x-2 pointer-events-auto shrink-0">
          {bestScoreYears > 0 && (
            <div className="hidden md:flex flex-col items-end px-2.5 py-1 rounded bg-black/60 border border-slate-700/60 text-right">
              <span className="text-[9px] font-mono uppercase text-slate-400">BEST RECORD</span>
              <span className="text-xs font-bold font-mono text-amber-300 tabular-nums">
                {formatYears(bestScoreYears)}
              </span>
            </div>
          )}

          {/* Debug & Tuning Menu Toggle */}
          {onToggleDebug && (
            <button
              onClick={onToggleDebug}
              className={`p-1.5 sm:p-2 rounded border transition cursor-pointer flex items-center space-x-1.5 ${
                isDebugOpen
                  ? 'bg-cyan-500/30 border-cyan-400 text-cyan-200 shadow-sm shadow-cyan-500/30'
                  : 'bg-black/70 border-slate-700 hover:border-cyan-400 text-slate-300 hover:text-cyan-300'
              }`}
              title="Adjust Cave Width, Waves & Spawns"
              aria-label="Toggle debug and tuning menu"
              tabIndex={-1}
            >
              <Sliders className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400" />
              <span className="hidden md:inline text-[11px] font-mono font-semibold">TUNING</span>
            </button>
          )}

          <button
            onClick={onToggleMute}
            className="p-1.5 sm:p-2 rounded bg-black/70 border border-slate-700 hover:border-amber-400 text-slate-300 hover:text-white transition cursor-pointer"
            title={isMuted ? 'Unmute Sound [M]' : 'Mute Sound [M]'}
            aria-label={isMuted ? 'Unmute audio' : 'Mute audio'}
            tabIndex={-1}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />}
          </button>

          <button
            onClick={onPause}
            className="p-1.5 sm:p-2 rounded bg-black/70 border border-slate-700 hover:border-amber-400 text-slate-300 hover:text-white transition cursor-pointer"
            title="Pause Game [Esc / P]"
            aria-label="Pause game"
            tabIndex={-1}
          >
            <Pause className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
          </button>
        </div>
      </div>

      {/* Floating Alerts (Warp or Dinosaur Encounter) */}
      <div className="flex flex-col items-center space-y-2 mb-4 sm:mb-8 pointer-events-none px-4">
        {warpAlert && (
          <div className="px-3.5 py-1.5 sm:px-5 sm:py-2.5 rounded-full bg-cyan-950/90 border border-cyan-400/80 shadow-[0_0_24px_rgba(6,182,212,0.5)] flex items-center space-x-2 animate-bounce max-w-[90vw]">
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-300 animate-spin shrink-0" />
            <span className="text-[11px] sm:text-xs md:text-sm font-display font-bold tracking-wider text-cyan-100 truncate">
              {warpAlert}
            </span>
          </div>
        )}

        {dinoAlert && !warpAlert && (
          <div className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-slate-900/90 border border-amber-400/50 shadow-[0_0_20px_rgba(245,158,11,0.35)] flex items-center space-x-2 animate-bounce max-w-[90vw]">
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-300 shrink-0" />
            <span className="text-[11px] sm:text-xs md:text-sm font-display font-semibold tracking-wide text-amber-200 truncate">
              TIME WARP: <span className="text-white font-bold">{dinoAlert}</span>
            </span>
          </div>
        )}
      </div>

      {/* Subtle bottom touch hint */}
      <div className="w-full flex justify-center opacity-40 hover:opacity-80 transition-opacity pb-1">
        <span className="text-[9px] sm:text-xs font-mono text-slate-400 text-center px-2">
          <span className="hidden sm:inline">[SPACE / CLICK / TAP] TO THRUST UPWARD · HOLD FOR VARIABLE GRAVITY</span>
          <span className="sm:hidden">TAP & HOLD TO THRUST UPWARD</span>
        </span>
      </div>
    </div>
  );
};
