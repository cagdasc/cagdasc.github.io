import React from 'react';
import { X, Sparkles, AlertTriangle, ShieldCheck, HelpCircle, Orbit } from 'lucide-react';

interface TipsModalProps {
  onClose: () => void;
}

export const TipsModal: React.FC<TipsModalProps> = ({ onClose }) => {
  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center p-3 sm:p-4 bg-black/80 select-none animate-fadeIn">
      <div className="w-full max-w-lg rounded-xl bg-[#0a0f1e] border border-amber-500/40 p-4 sm:p-6 md:p-8 shadow-2xl shadow-orange-950/60 flex flex-col space-y-4 sm:space-y-5 text-slate-100 max-h-[92dvh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <HelpCircle className="w-5 h-5 text-amber-400" />
            <h2 className="text-xl md:text-2xl font-display font-bold text-white tracking-wide">
              TIME WARP ENCOUNTER TIPS
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            aria-label="Close tips"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Core Tip 1: Hazard vs Decorative */}
        <div className="rounded-lg bg-slate-900/90 border border-slate-800 p-4 space-y-2">
          <div className="flex items-center space-x-2 text-amber-400 text-xs font-mono font-bold uppercase tracking-wider">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            <span>Hazard vs. Decorative Anomalies</span>
          </div>
          <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
            Most prehistoric creatures in the cosmic cave are <strong className="text-emerald-400">harmless anomalies</strong> that you can fly right past to gain bonus encounter stats.
          </p>
          <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
            <div className="p-2 rounded bg-emerald-950/40 border border-emerald-500/30 flex items-start space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-emerald-300 block">Harmless Dino</strong>
                <span className="text-slate-400 text-[11px]">Normal colors, no outline. Fly freely near them!</span>
              </div>
            </div>
            <div className="p-2 rounded bg-rose-950/40 border border-rose-500/30 flex items-start space-x-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-rose-300 block">Solid Hazard</strong>
                <span className="text-slate-400 text-[11px]">Surrounded by a <span className="text-rose-300 font-bold">dashed red glow</span>. Fatal impact!</span>
              </div>
            </div>
          </div>
        </div>

        {/* Encounter Archetypes */}
        <div className="space-y-3">
          <span className="text-xs font-mono uppercase tracking-widest text-slate-400 block">
            CREATURE RECOGNITION GUIDE
          </span>

          <div className="space-y-2 text-xs md:text-sm">
            <div className="p-2.5 rounded bg-black/40 border border-slate-800/80 flex items-center justify-between">
              <div>
                <strong className="text-emerald-400 block font-display">Spacewalking T-Rex</strong>
                <span className="text-slate-400 text-xs">Wears a glass helmet & mini rocket pack. Bobs gently in place.</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">Stationary Bob</span>
            </div>

            <div className="p-2.5 rounded bg-black/40 border border-slate-800/80 flex items-center justify-between">
              <div>
                <strong className="text-yellow-400 block font-display">Gliding Pterosaur</strong>
                <span className="text-slate-400 text-xs">Flaps wings and glides leftward toward you. React early!</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950 border border-amber-600/40 text-amber-300">Fast Approach</span>
            </div>

            <div className="p-2.5 rounded bg-black/40 border border-slate-800/80 flex items-center justify-between">
              <div>
                <strong className="text-purple-400 block font-display">Sauropod Nebula Rift</strong>
                <span className="text-slate-400 text-xs">Curved neck peering out of a time vortex. Give it wide berth.</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950 border border-purple-600/40 text-purple-300">Large Rift</span>
            </div>

            <div className="p-2.5 rounded bg-black/40 border border-slate-800/80 flex items-center justify-between">
              <div>
                <strong className="text-sky-400 block font-display">Ammonite Space Fossil</strong>
                <span className="text-slate-400 text-xs">Cratered asteroid carrying a glowing golden fossil spiral.</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">Dense Meteor</span>
            </div>
          </div>
        </div>

        {/* Wormholes vs Black Holes Mechanics */}
        <div className="rounded-lg bg-cyan-950/30 border border-cyan-500/30 p-4 space-y-2.5">
          <div className="flex items-center space-x-2 text-cyan-300 text-xs font-mono font-bold uppercase tracking-wider">
            <Orbit className="w-4 h-4 text-cyan-400" />
            <span>ANOMALIES: WORMHOLES vs. BLACK HOLES</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs">
            {/* Wormhole */}
            <div className="p-3 rounded bg-cyan-950/50 border border-cyan-500/40 space-y-1.5">
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping inline-block" />
                <strong className="text-cyan-200 font-display text-xs">Cyan Wormhole</strong>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                Teleports you <span className="text-cyan-300 font-bold">+2.5M Years</span> forward!
              </p>
              <div className="text-[10px] text-amber-300 bg-black/40 p-1.5 rounded border border-amber-500/30">
                ⚠️ <strong>Slalom Exit:</strong> You do NOT emerge into empty space! You drop into an immediate obstacle slalom with crossing hazards. Stay alert!
              </div>
            </div>

            {/* Black Hole */}
            <div className="p-3 rounded bg-amber-950/50 border border-amber-500/40 space-y-1.5">
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
                <strong className="text-amber-200 font-display text-xs">Spinning Black Hole</strong>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                Watch the <span className="text-amber-300 font-bold">Spin Chevrons (↻ or ↺)</span>!
              </p>
              <div className="space-y-1 text-[10px] text-slate-300 bg-black/40 p-1.5 rounded border border-slate-700">
                <div>🚀 <strong className="text-emerald-300">With Spin:</strong> Fling slingshot assist along tangent.</div>
                <div>⚡ <strong className="text-rose-300">Counter-Spin:</strong> Violent turbulence pushes/kicks you away!</div>
                <div>💀 <strong className="text-red-400">Center Core:</strong> Fatal singularity collision.</div>
              </div>
            </div>
          </div>
        </div>

        {/* Flight Navigation Tips */}
        <div className="rounded-lg bg-orange-950/20 border border-orange-500/20 p-3.5 space-y-1.5 text-xs">
          <div className="flex items-center space-x-1.5 text-amber-300 font-bold font-mono">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>FLIGHT MASTERY HINTS</span>
          </div>
          <ul className="list-disc list-inside text-slate-300 space-y-1 pl-1 text-[11px]">
            <li><strong>Rhythm Over Spam:</strong> Use short, rhythmic impulses to maintain central cruising height.</li>
            <li><strong>Hold-Time Gravity Experiment:</strong> Holding Space / Click / Tap dynamically modulates gravity in real-time (Floatier, Heavy Dive, Mario Arc, or Jetpack). Experiment with modes in the <strong className="text-purple-300">Tuning Menu</strong>!</li>
            <li><strong>Live Cave Tuning:</strong> Cave too tight or not fluctuating enough? Open the <strong className="text-cyan-300">Tuning Menu (Sliders)</strong> to adjust corridor height and wave waves in real-time!</li>
            <li><strong>65M Year Threshold:</strong> Crossing into the Cretaceous Void ramps up encounter frequency.</li>
          </ul>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-display font-bold text-sm tracking-wider uppercase transition cursor-pointer"
        >
          GOT IT, READY TO FLY
        </button>
      </div>
    </div>
  );
};
