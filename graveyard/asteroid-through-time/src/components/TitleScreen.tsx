import React from 'react';
import { Play, Volume2, VolumeX, Sparkles, Orbit, HelpCircle, Sliders } from 'lucide-react';
import { formatYears } from '../game/ScoreSystem';

interface TitleScreenProps {
  bestScore: number;
  isMuted: boolean;
  onToggleMute: () => void;
  onStart: () => void;
  onOpenTips?: () => void;
  onToggleDebug?: () => void;
  isDebugOpen?: boolean;
  isPortrait?: boolean;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  bestScore,
  isMuted,
  onToggleMute,
  onStart,
  onOpenTips,
  onToggleDebug,
  isDebugOpen = false,
  isPortrait = false,
}) => {
  return (
    <div className="absolute inset-0 flex flex-col justify-between safe-inset z-20 pointer-events-none select-none overflow-y-auto max-h-full">
      {/* Top Header Bar */}
      <div className="flex justify-between items-center w-full gap-2">
        <div className="flex items-center space-x-2 pointer-events-auto">
          <a
            href="/"
            className="flex items-center space-x-1 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded bg-black/60 border border-slate-700 hover:border-amber-400 text-slate-300 hover:text-white text-xs font-mono transition cursor-pointer"
            title="Back to Portfolio"
          >
            <span>← caglak.cc</span>
          </a>
          <div className="hidden sm:flex items-center space-x-2 text-xs font-semibold tracking-widest text-amber-400 uppercase">
            <Orbit className="w-4 h-4 text-amber-400 animate-spin" style={{ animationDuration: '10s' }} />
            <span>Cosmic Chrono-Voyage</span>
          </div>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-3 pointer-events-auto">
          {bestScore > 0 && (
            <div className="px-2 py-1 sm:px-3 sm:py-1.5 rounded bg-black/60 border border-amber-500/30 text-amber-300 text-[10px] sm:text-xs font-medium tracking-wide">
              RECORD: <span className="font-bold tabular-nums text-white">{formatYears(bestScore)}</span>
            </div>
          )}

          {onToggleDebug && (
            <button
              onClick={onToggleDebug}
              className={`flex items-center space-x-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded border text-[10px] sm:text-xs font-mono transition cursor-pointer ${
                isDebugOpen
                  ? 'bg-cyan-500/30 border-cyan-400 text-cyan-200'
                  : 'bg-black/60 border-slate-700 hover:border-cyan-400 text-slate-300 hover:text-cyan-300'
              }`}
              title="Adjust Cave Width, Waves & Spawns"
              aria-label="Open cave and physics tuning"
              tabIndex={-1}
            >
              <Sliders className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">TUNING</span>
            </button>
          )}

          {onOpenTips && (
            <button
              onClick={onOpenTips}
              className="flex items-center space-x-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded bg-black/60 border border-slate-700 hover:border-amber-400 text-slate-300 hover:text-amber-300 text-[10px] sm:text-xs font-mono transition cursor-pointer"
              title="Time Warp Encounter Tips"
              aria-label="Open Time Warp encounter tips"
              tabIndex={-1}
            >
              <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">TIPS</span>
            </button>
          )}

          <button
            onClick={onToggleMute}
            className="p-1.5 sm:p-2 rounded bg-black/60 border border-slate-700 hover:border-amber-400 text-slate-300 hover:text-white transition cursor-pointer"
            title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
            aria-label={isMuted ? 'Unmute audio' : 'Mute audio'}
            tabIndex={-1}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />}
          </button>
        </div>
      </div>

      {/* Center Hero Title Lockup */}
      <div className="flex flex-col items-center text-center my-auto max-w-xl mx-auto space-y-3 sm:space-y-6 py-2">
        {/* Bespoke SVG Title Lockup */}
        <div className="relative flex flex-col items-center">
          <svg className="w-56 sm:w-80 md:w-full max-w-md h-auto" viewBox="0 0 520 140" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="titleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fef08a" />
                <stop offset="40%" stopColor="#f97316" />
                <stop offset="85%" stopColor="#dc2626" />
                <stop offset="100%" stopColor="#9333ea" />
              </linearGradient>
              <filter id="glow" x="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="8" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>
            {/* Ambient Background Silhouette Rune */}
            <circle cx="260" cy="70" r="58" stroke="rgba(249, 115, 22, 0.25)" strokeWidth="1.5" strokeDasharray="6 6" />
            <ellipse cx="260" cy="70" rx="90" ry="24" stroke="rgba(56, 189, 248, 0.2)" strokeWidth="1" transform="rotate(-15 260 70)" />

            {/* Main Title Typography */}
            <text
              x="260"
              y="58"
              textAnchor="middle"
              className="font-display font-extrabold tracking-widest text-[44px]"
              fill="url(#titleGrad)"
              filter="url(#glow)"
              style={{ letterSpacing: '0.12em', fontWeight: 900 }}
            >
              ASTEROID
            </text>
            <text
              x="260"
              y="108"
              textAnchor="middle"
              className="font-display font-bold tracking-widest text-[28px]"
              fill="#e2e8f0"
              style={{ letterSpacing: '0.24em' }}
            >
              THROUGH TIME
            </text>
          </svg>
        </div>

        <p className="text-xs sm:text-sm md:text-base text-slate-300/90 leading-snug sm:leading-relaxed font-normal px-4 max-w-md">
          Navigate a molten asteroid through cosmic cavern rifts, dodge celestial bodies,
          and witness prehistoric creatures drifting through the deep void of space-time.
        </p>

        {/* Primary Start CTA and Tips Link */}
        <div className="flex flex-col items-center space-y-2 sm:space-y-3 pt-1 sm:pt-2 pointer-events-auto">
          <button
            data-start="true"
            onClick={onStart}
            className="group relative inline-flex items-center space-x-2.5 sm:space-x-3 px-6 sm:px-8 py-2.5 sm:py-3.5 rounded bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 text-slate-950 font-bold text-sm sm:text-base tracking-wider uppercase shadow-lg shadow-orange-500/30 hover:shadow-orange-500/60 active:scale-95 transition-all duration-150 cursor-pointer"
          >
            <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current text-slate-950 transition-transform group-hover:translate-x-0.5" />
            <span className="font-display">LAUNCH RUN</span>
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-200 animate-pulse" />
          </button>

          {onOpenTips && (
            <button
              onClick={onOpenTips}
              className="text-[11px] sm:text-xs font-mono text-amber-300/80 hover:text-amber-200 flex items-center space-x-1.5 transition underline-offset-4 hover:underline cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
              <span>Time Warp Encounter Tips & Creature Guide</span>
            </button>
          )}

          {isPortrait && (
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-cyan-950/70 border border-cyan-500/30 text-cyan-300 text-[10px] font-mono tracking-wide mt-1">
              <span>📱 Best in Landscape Mode</span>
            </div>
          )}
        </div>
      </div>

      {/* Control Hints in Bottom Margin */}
      <div className="w-full text-center pb-1">
        <p className="text-[10px] sm:text-xs text-slate-400 font-mono tracking-wider">
          <span className="hidden sm:inline">Space / Click / Tap Impulse &nbsp;·&nbsp; Esc / P Pause &nbsp;·&nbsp; M Mute &nbsp;·&nbsp; R Restart</span>
          <span className="sm:hidden">Tap & Hold to Thrust · Release to Fall</span>
        </p>
      </div>
    </div>
  );
};
