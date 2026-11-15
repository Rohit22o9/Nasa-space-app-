import React from 'react';
import { soundFx } from '../utils/audio';
import { 
  X, 
  BookOpen, 
  Sparkles, 
  Weight, 
  Sun, 
  Flame, 
  Radio, 
  DollarSign, 
  ShieldCheck, 
  Layers,
  ChevronRight
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const TutorialModal: React.FC<Props> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-space-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-4xl max-h-[85vh] bg-space-900 border border-cyan-500/30 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
        
        {/* Modal Header */}
        <div className="p-5 md:p-6 border-b border-white/10 flex items-center justify-between bg-space-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-display font-bold text-white">
                NASA Systems Engineering Flight Manual
              </h3>
              <p className="text-xs font-mono text-slate-400">
                Core Principles of Space Mission Design, Trade-Offs, and CML Gates
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              soundFx.playClick();
              onClose();
            }}
            className="p-2 rounded-xl bg-space-850 hover:bg-space-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs md:text-sm text-slate-300 leading-relaxed font-sans">
          
          {/* Section 1: The 4 Mission Segments */}
          <div className="p-4 rounded-2xl bg-space-950/70 border border-white/5 space-y-2">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
              <Layers className="w-4 h-4" />
              1. The Four NASA Mission Segments
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-1">
              <div className="p-2.5 rounded-xl bg-space-900/60 border border-white/5">
                <strong className="text-white block mb-0.5 font-mono">Space Segment:</strong>
                The spacecraft bus (structure, power, ADCS, avionics) and payload science instruments.
              </div>
              <div className="p-2.5 rounded-xl bg-space-900/60 border border-white/5">
                <strong className="text-white block mb-0.5 font-mono">Launch Segment:</strong>
                The booster (Falcon 9, SLS, Electron) providing insertion energy (C3 or delta-v) to space.
              </div>
              <div className="p-2.5 rounded-xl bg-space-900/60 border border-white/5">
                <strong className="text-white block mb-0.5 font-mono">Ground Segment:</strong>
                Deep Space Network (DSN) and Near Space Network (NSN) receiving telemetry and tracking.
              </div>
              <div className="p-2.5 rounded-xl bg-space-900/60 border border-white/5">
                <strong className="text-white block mb-0.5 font-mono">User Segment:</strong>
                Planetary scientists analyzing telemetry, calibration curves, and publishing discoveries.
              </div>
            </div>
          </div>

          {/* Section 2: NASA Concept Maturity Levels (CML) */}
          <div className="p-4 rounded-2xl bg-space-950/70 border border-white/5 space-y-2">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              2. Concept Maturity Levels (CML 1 to CML 4)
            </h4>
            <div className="space-y-2 text-xs font-mono pt-1">
              <div><strong className="text-white">CML 1 (Formulation):</strong> Define the primary science question and target destination.</div>
              <div><strong className="text-white">CML 2 (Architecture):</strong> Select compatible science payloads and estimate mass/power loads.</div>
              <div><strong className="text-white">CML 3 (Trade Studies):</strong> Conduct trade-offs between solar vs nuclear RTG, launch boosters, and comms.</div>
              <div><strong className="text-white">CML 4 (Point Design):</strong> Verify all engineering margins (MGA 20%) and conduct Launch Readiness Review (LRR).</div>
            </div>
          </div>

          {/* Section 3: The 5 Fundamental Trade-Offs */}
          <div className="p-4 rounded-2xl bg-space-950/70 border border-white/5 space-y-3">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400">
              3. The 5 Core Systems Engineering Trade-Offs
            </h4>

            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-2.5">
                <Weight className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white font-mono">Mass Trade-off & NASA 20% MGA Rule:</strong> Every added instrument increases dry mass. Heavy wet mass requires a larger, more expensive booster. NASA requires at least a 20% mass growth allowance.
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Sun className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white font-mono">Power & Inverse Square Law ($1/R^2$):</strong> Solar intensity drops dramatically with distance. At Jupiter (5.2 AU), solar energy is only 3.7% of Earth! Nuclear RTGs or massive UltraFlex arrays are needed.
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Flame className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white font-mono">Delta-V & Tsiolkovsky Rocket Equation:</strong> Orbit capture burns require propellant. Electric ion thrusters provide massive fuel economy (Isp 3,450 s) but require high electrical power.
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Radio className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white font-mono">Data Link Budget & Distance Attenuation:</strong> High-resolution sensors generate gigabits of data. If downlink capacity is insufficient, the onboard solid-state recorder overflows and data is lost.
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <DollarSign className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white font-mono">Financial Cost & Reserve Risk:</strong> Every space mission has a congressionally mandated budget cap. Projects must maintain a 15% contingency reserve for unexpected anomalies.
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-white/10 bg-space-950/60 flex justify-end">
          <button
            onClick={() => {
              soundFx.playClick();
              onClose();
            }}
            className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-space-950 font-mono text-xs font-bold transition shadow-glow-cyan"
          >
            ACKNOWLEDGE & RETURN TO LAB
          </button>
        </div>

      </div>
    </div>
  );
};
