import React from 'react';
import { X, Sliders, Shield, Zap, Sparkles, RotateCcw, Orbit, Flame, Timer, Activity } from 'lucide-react';
import { DebugConfig, HoldGravityTelemetry, HoldGravityMode } from '../game/types';

interface DebugMenuProps {
  config: DebugConfig;
  onChange: (partial: Partial<DebugConfig>) => void;
  onReset: () => void;
  onSpawnWormhole: () => void;
  onSpawnBlackHole: (spin: 'clockwise' | 'counter_clockwise') => void;
  onClose: () => void;
  telemetry?: HoldGravityTelemetry | null;
}

export const DebugMenu: React.FC<DebugMenuProps> = ({
  config,
  onChange,
  onReset,
  onSpawnWormhole,
  onSpawnBlackHole,
  onClose,
  telemetry
}) => {
  return (
    <div className="absolute right-4 top-16 z-40 w-80 md:w-96 rounded-xl bg-[#090e1c]/95 border border-cyan-500/40 p-4 shadow-2xl shadow-cyan-950/70 text-slate-100 max-h-[85vh] overflow-y-auto select-none debug-panel">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 mb-3">
        <div className="flex items-center space-x-2">
          <Sliders className="w-4 h-4 text-cyan-400" />
          <h3 className="font-display font-bold text-sm text-cyan-300 tracking-wider uppercase">
            CAVE & PHYSICS TUNING
          </h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          aria-label="Close debug menu"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-4 text-xs">
        {/* God Mode Toggle */}
        <div className="flex items-center justify-between p-2.5 rounded bg-slate-900 border border-slate-800">
          <div className="flex items-center space-x-2">
            <Shield className={`w-4 h-4 ${config.godMode ? 'text-emerald-400' : 'text-slate-500'}`} />
            <div>
              <strong className="block text-slate-200">God Mode (Invulnerable)</strong>
              <span className="text-[10px] text-slate-400">Ignore all wall & obstacle collisions</span>
            </div>
          </div>
          <button
            onClick={() => onChange({ godMode: !config.godMode })}
            className={`px-3 py-1 rounded font-bold font-mono text-[11px] transition cursor-pointer ${
              config.godMode
                ? 'bg-emerald-500 text-slate-950 shadow-sm shadow-emerald-500/40'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            {config.godMode ? 'ENABLED' : 'DISABLED'}
          </button>
        </div>

        {/* Cave Dimensions & Fluctuation */}
        <div className="space-y-3 p-2.5 rounded bg-black/40 border border-slate-800/80">
          <span className="font-mono text-[11px] font-bold text-amber-400 uppercase tracking-wider block">
            Cave Geometry & Waves
          </span>

          {/* Base Corridor Gap */}
          <div className="space-y-1">
            <div className="flex justify-between font-mono text-[11px]">
              <span className="text-slate-300">Corridor Passage Width</span>
              <span className="text-cyan-300 font-bold tabular-nums">{config.corridorBaseHeight}px</span>
            </div>
            <input
              type="range"
              min="200"
              max="520"
              step="10"
              value={config.corridorBaseHeight}
              onChange={(e) => onChange({ corridorBaseHeight: Number(e.target.value) })}
              className="w-full accent-cyan-400 cursor-pointer"
            />
          </div>

          {/* Fluctuation Amplitude */}
          <div className="space-y-1">
            <div className="flex justify-between font-mono text-[11px]">
              <span className="text-slate-300">Wave Fluctuation (Amplitude)</span>
              <span className="text-cyan-300 font-bold tabular-nums">{config.fluctuationAmplitude}px</span>
            </div>
            <input
              type="range"
              min="0"
              max="140"
              step="5"
              value={config.fluctuationAmplitude}
              onChange={(e) => onChange({ fluctuationAmplitude: Number(e.target.value) })}
              className="w-full accent-cyan-400 cursor-pointer"
            />
            <span className="text-[9px] text-slate-400 block">Higher value = deeper peaks and valleys</span>
          </div>

          {/* Fluctuation Frequency */}
          <div className="space-y-1">
            <div className="flex justify-between font-mono text-[11px]">
              <span className="text-slate-300">Fluctuation Frequency</span>
              <span className="text-cyan-300 font-bold tabular-nums">{(config.fluctuationFrequency * 1000).toFixed(1)}</span>
            </div>
            <input
              type="range"
              min="0.001"
              max="0.008"
              step="0.0005"
              value={config.fluctuationFrequency}
              onChange={(e) => onChange({ fluctuationFrequency: Number(e.target.value) })}
              className="w-full accent-cyan-400 cursor-pointer"
            />
          </div>
        </div>

        {/* Physics & Movement */}
        <div className="space-y-3 p-2.5 rounded bg-black/40 border border-slate-800/80">
          <span className="font-mono text-[11px] font-bold text-amber-400 uppercase tracking-wider block">
            Physics & Speed
          </span>

          <div className="space-y-1">
            <div className="flex justify-between font-mono text-[11px]">
              <span className="text-slate-300">Base Scroll Speed</span>
              <span className="text-cyan-300 font-bold tabular-nums">{config.scrollSpeed} px/s</span>
            </div>
            <input
              type="range"
              min="100"
              max="450"
              step="10"
              value={config.scrollSpeed}
              onChange={(e) => onChange({ scrollSpeed: Number(e.target.value) })}
              className="w-full accent-cyan-400 cursor-pointer"
            />
            <p className="text-[10px] text-slate-400">
              Cruising speed starts at {config.scrollSpeed} px/s and automatically accelerates up to 350 px/s across eras.
            </p>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between font-mono text-[11px]">
              <span className="text-slate-300">Gravity</span>
              <span className="text-cyan-300 font-bold tabular-nums">{config.gravity}</span>
            </div>
            <input
              type="range"
              min="400"
              max="1300"
              step="20"
              value={config.gravity}
              onChange={(e) => onChange({ gravity: Number(e.target.value) })}
              className="w-full accent-cyan-400 cursor-pointer"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between font-mono text-[11px]">
              <span className="text-slate-300">Upward Thrust Impulse</span>
              <span className="text-cyan-300 font-bold tabular-nums">{config.upwardImpulse}</span>
            </div>
            <input
              type="range"
              min="-520"
              max="-200"
              step="10"
              value={config.upwardImpulse}
              onChange={(e) => onChange({ upwardImpulse: Number(e.target.value) })}
              className="w-full accent-cyan-400 cursor-pointer"
            />
          </div>
        </div>

        {/* Experiment: Hold-Duration Variable Gravity */}
        <div className="space-y-3 p-3 rounded-lg bg-gradient-to-br from-indigo-950/60 to-purple-950/40 border border-purple-500/40 shadow-inner">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1.5">
              <Activity className="w-4 h-4 text-purple-400" />
              <span className="font-mono text-[11px] font-bold text-purple-300 uppercase tracking-wider">
                Hold-Time Gravity Experiment
              </span>
            </div>
            <button
              onClick={() => onChange({ variableGravityOnHold: !config.variableGravityOnHold })}
              className={`px-2.5 py-0.5 rounded font-bold font-mono text-[10px] transition cursor-pointer ${
                config.variableGravityOnHold
                  ? 'bg-purple-500 text-slate-950 shadow-sm shadow-purple-500/40'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {config.variableGravityOnHold ? 'ENABLED' : 'DISABLED'}
            </button>
          </div>

          <p className="text-[10px] text-slate-300 leading-snug">
            {config.variableGravityOnHold
              ? 'Gravity dynamically responds in real-time to how long you hold Space / Click / Tap.'
              : 'Holding is inactive (pure Flappy Bird fixed tap gravity). Enable to test variable gravity.'}
          </p>

          {config.variableGravityOnHold && (
            <div className="space-y-3 pt-1 border-t border-purple-900/50">
              {/* Mode Selector Tabs */}
              <div className="space-y-1">
                <span className="text-[10px] font-mono text-purple-300 uppercase tracking-wider block">
                  Gravity Hold Behavior
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    onClick={() => onChange({ holdGravityMode: 'progressive_float' })}
                    className={`p-1.5 rounded text-[10px] font-mono text-left transition cursor-pointer border ${
                      config.holdGravityMode === 'progressive_float'
                        ? 'bg-purple-900/80 border-purple-400 text-purple-100 font-bold'
                        : 'bg-slate-900/70 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span className="block text-cyan-300">1. Float (Lighter)</span>
                    <span className="text-[9px] text-slate-400">Hold softens gravity</span>
                  </button>

                  <button
                    onClick={() => onChange({ holdGravityMode: 'progressive_heavy' })}
                    className={`p-1.5 rounded text-[10px] font-mono text-left transition cursor-pointer border ${
                      config.holdGravityMode === 'progressive_heavy'
                        ? 'bg-purple-900/80 border-purple-400 text-purple-100 font-bold'
                        : 'bg-slate-900/70 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span className="block text-rose-300">2. Plunge (Heavier)</span>
                    <span className="text-[9px] text-slate-400">Hold increases weight</span>
                  </button>

                  <button
                    onClick={() => onChange({ holdGravityMode: 'dampened_arc' })}
                    className={`p-1.5 rounded text-[10px] font-mono text-left transition cursor-pointer border ${
                      config.holdGravityMode === 'dampened_arc'
                        ? 'bg-purple-900/80 border-purple-400 text-purple-100 font-bold'
                        : 'bg-slate-900/70 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span className="block text-amber-300">3. Mario Jump Arc</span>
                    <span className="text-[9px] text-slate-400">Fixed low-G while held</span>
                  </button>

                  <button
                    onClick={() => onChange({ holdGravityMode: 'jetpack_thruster' })}
                    className={`p-1.5 rounded text-[10px] font-mono text-left transition cursor-pointer border ${
                      config.holdGravityMode === 'jetpack_thruster'
                        ? 'bg-purple-900/80 border-purple-400 text-purple-100 font-bold'
                        : 'bg-slate-900/70 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span className="block text-emerald-300">4. Jetpack Hover</span>
                    <span className="text-[9px] text-slate-400">Continuous thrust</span>
                  </button>
                </div>
              </div>

              {/* Max Hold Duration Slider */}
              <div className="space-y-1">
                <div className="flex justify-between font-mono text-[11px]">
                  <span className="text-slate-300">Hold Window Duration</span>
                  <span className="text-purple-300 font-bold tabular-nums">
                    {config.holdMaxDuration.toFixed(2)}s
                  </span>
                </div>
                <input
                  type="range"
                  min="0.10"
                  max="1.00"
                  step="0.05"
                  value={config.holdMaxDuration}
                  onChange={(e) => onChange({ holdMaxDuration: Number(e.target.value) })}
                  className="w-full accent-purple-400 cursor-pointer"
                />
                <span className="text-[9px] text-slate-400 block">
                  How long the hold continues to influence gravity before capping
                </span>
              </div>

              {/* Gravity Multiplier Slider (for float, heavy, and arc modes) */}
              {config.holdGravityMode !== 'jetpack_thruster' ? (
                <div className="space-y-1">
                  <div className="flex justify-between font-mono text-[11px]">
                    <span className="text-slate-300">Hold Gravity Multiplier</span>
                    <span className="text-purple-300 font-bold tabular-nums">
                      {(config.holdGravityMultiplier * 100).toFixed(0)}% ({config.holdGravityMultiplier.toFixed(2)}x)
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.05"
                    max={config.holdGravityMode === 'progressive_heavy' ? '3.00' : '1.00'}
                    step="0.05"
                    value={config.holdGravityMultiplier}
                    onChange={(e) => onChange({ holdGravityMultiplier: Number(e.target.value) })}
                    className="w-full accent-purple-400 cursor-pointer"
                  />
                  <span className="text-[9px] text-slate-400 block">
                    {config.holdGravityMode === 'progressive_heavy'
                      ? 'Target peak heavy gravity reached at max hold'
                      : 'Target minimum float gravity reached at max hold'}
                  </span>
                </div>
              ) : (
                /* Jetpack Thrust Power Slider */
                <div className="space-y-1">
                  <div className="flex justify-between font-mono text-[11px]">
                    <span className="text-slate-300">Jetpack Thrust Power</span>
                    <span className="text-purple-300 font-bold tabular-nums">
                      {config.holdThrustPower} px/s²
                    </span>
                  </div>
                  <input
                    type="range"
                    min="200"
                    max="1200"
                    step="50"
                    value={config.holdThrustPower}
                    onChange={(e) => onChange({ holdThrustPower: Number(e.target.value) })}
                    className="w-full accent-purple-400 cursor-pointer"
                  />
                  <span className="text-[9px] text-slate-400 block">
                    Counter-acceleration opposing gravity while held
                  </span>
                </div>
              )}

              {/* Quick Experiment Presets */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] font-mono text-purple-300 uppercase tracking-wider block">
                  Experiment Presets
                </span>
                <div className="grid grid-cols-2 gap-1.5 text-[10px] font-mono">
                  <button
                    onClick={() =>
                      onChange({
                        variableGravityOnHold: true,
                        holdGravityMode: 'progressive_float',
                        holdMaxDuration: 0.50,
                        holdGravityMultiplier: 0.15
                      })
                    }
                    className="p-1 rounded bg-slate-900 hover:bg-purple-900/60 border border-slate-700 hover:border-purple-400 text-cyan-200 transition cursor-pointer text-center"
                  >
                    Float Glider
                  </button>

                  <button
                    onClick={() =>
                      onChange({
                        variableGravityOnHold: true,
                        holdGravityMode: 'progressive_heavy',
                        holdMaxDuration: 0.40,
                        holdGravityMultiplier: 2.20
                      })
                    }
                    className="p-1 rounded bg-slate-900 hover:bg-rose-900/60 border border-slate-700 hover:border-rose-400 text-rose-200 transition cursor-pointer text-center"
                  >
                    Heavy Slam
                  </button>

                  <button
                    onClick={() =>
                      onChange({
                        variableGravityOnHold: true,
                        holdGravityMode: 'dampened_arc',
                        holdMaxDuration: 0.35,
                        holdGravityMultiplier: 0.25
                      })
                    }
                    className="p-1 rounded bg-slate-900 hover:bg-amber-900/60 border border-slate-700 hover:border-amber-400 text-amber-200 transition cursor-pointer text-center"
                  >
                    Mario Jump
                  </button>

                  <button
                    onClick={() =>
                      onChange({
                        variableGravityOnHold: true,
                        holdGravityMode: 'jetpack_thruster',
                        holdMaxDuration: 0.60,
                        holdThrustPower: 700
                      })
                    }
                    className="p-1 rounded bg-slate-900 hover:bg-emerald-900/60 border border-slate-700 hover:border-emerald-400 text-emerald-200 transition cursor-pointer text-center"
                  >
                    Jetpack Hover
                  </button>
                </div>
              </div>

              {/* Real-time Telemetry Monitor */}
              <div className="p-2 rounded bg-black/60 border border-purple-800/60 space-y-1.5 font-mono text-[10px]">
                <div className="flex justify-between items-center text-slate-400">
                  <span>INPUT STATUS:</span>
                  <span
                    className={`font-bold px-1.5 py-0.5 rounded ${
                      telemetry?.isHeld ? 'bg-purple-500 text-slate-950 animate-pulse' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {telemetry?.isHeld ? `HOLDING (${telemetry.holdDuration.toFixed(2)}s)` : 'RELEASED'}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-400">EFFECTIVE GRAVITY:</span>
                  <span className="font-bold text-purple-300 tabular-nums">
                    {telemetry ? `${telemetry.effectiveGravity.toFixed(0)} px/s²` : `${config.gravity} px/s²`}
                  </span>
                </div>

                {/* Visual hold progress bar */}
                <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-400 to-purple-400 transition-all duration-75"
                    style={{
                      width: telemetry?.isHeld
                        ? `${Math.min(100, (telemetry.holdDuration / Math.max(0.05, telemetry.maxDuration)) * 100)}%`
                        : '0%'
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Wormhole & Black Hole Spawns */}
        <div className="space-y-3 p-2.5 rounded bg-black/40 border border-slate-800/80">
          <span className="font-mono text-[11px] font-bold text-amber-400 uppercase tracking-wider block">
            Wormhole & Black Hole Rates
          </span>

          <div className="space-y-1">
            <div className="flex justify-between font-mono text-[11px]">
              <span className="text-slate-300">Wormhole Chance</span>
              <span className="text-cyan-300 font-bold tabular-nums">{(config.wormholeSpawnChance * 100).toFixed(0)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={config.wormholeSpawnChance}
              onChange={(e) => onChange({ wormholeSpawnChance: Number(e.target.value) })}
              className="w-full accent-cyan-400 cursor-pointer"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between font-mono text-[11px]">
              <span className="text-slate-300">Black Hole Chance</span>
              <span className="text-cyan-300 font-bold tabular-nums">{(config.blackholeSpawnChance * 100).toFixed(0)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={config.blackholeSpawnChance}
              onChange={(e) => onChange({ blackholeSpawnChance: Number(e.target.value) })}
              className="w-full accent-cyan-400 cursor-pointer"
            />
          </div>
        </div>

        {/* Instant Action Spawns */}
        <div className="space-y-2 pt-1">
          <span className="font-mono text-[10px] text-slate-400 uppercase tracking-wider block">
            Instant Test Spawns (Ahead in Cave)
          </span>

          <div className="space-y-2">
            <button
              onClick={onSpawnWormhole}
              className="w-full py-2 px-2.5 rounded bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-200 font-display font-semibold flex items-center justify-center space-x-1.5 transition cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>+ Spawn Wormhole (Slalom Exit)</span>
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onSpawnBlackHole('clockwise')}
                className="py-1.5 px-2 rounded bg-amber-950/80 hover:bg-amber-900 border border-amber-500/40 text-amber-200 font-mono text-[11px] font-semibold flex items-center justify-center space-x-1 transition cursor-pointer"
                title="Enter along top to sling forward; enter along bottom to trigger turbulence"
              >
                <Orbit className="w-3.5 h-3.5 text-amber-400" />
                <span>+ BH Clockwise (↻)</span>
              </button>

              <button
                onClick={() => onSpawnBlackHole('counter_clockwise')}
                className="py-1.5 px-2 rounded bg-rose-950/80 hover:bg-rose-900 border border-rose-500/40 text-rose-200 font-mono text-[11px] font-semibold flex items-center justify-center space-x-1 transition cursor-pointer"
                title="Enter along bottom to sling forward; enter along top to trigger turbulence"
              >
                <Orbit className="w-3.5 h-3.5 text-rose-400 transform -scale-x-100" />
                <span>+ BH Counter-CW (↺)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Reset Defaults */}
        <button
          onClick={onReset}
          className="w-full py-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono flex items-center justify-center space-x-1.5 border border-slate-700 transition cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>RESET DEFAULTS</span>
        </button>
      </div>
    </div>
  );
};
