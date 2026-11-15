import React from 'react';
import { NASA_SCENARIOS } from '../data/nasaData';
import { soundFx } from '../utils/audio';
import { 
  Rocket, 
  ArrowRight, 
  Sun, 
  ShieldAlert, 
  Radio, 
  DollarSign, 
  Sparkles,
  Users,
  Compass
} from 'lucide-react';

interface Props {
  onSelectScenario: (scenarioId: string) => void;
  selectedId: string;
  isTeamMode: boolean;
}

export const ScenarioSelector: React.FC<Props> = ({ 
  onSelectScenario, 
  selectedId, 
  isTeamMode 
}) => {
  const currentScenario = NASA_SCENARIOS.find(s => s.id === selectedId) || NASA_SCENARIOS[0];

  const getTargetIcon = (type: string) => {
    switch (type) {
      case 'lunar': return '🌙';
      case 'mars': return '🔴';
      case 'deep_space': return '🪐';
      case 'earth_observation': return '🌍';
      default: return '🛰️';
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto py-6 space-y-8">
      
      {/* Clean Hero Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-400/30 text-sky-400 text-xs font-medium">
          <Sparkles className="w-3.5 h-3.5" />
          <span>NASA MISSION DESIGN LAB</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
          Select Your Space Mission
        </h1>
        <p className="text-slate-400 max-w-xl mx-auto text-sm">
          Pick a destination, design your spacecraft, balance mass, power, and budget, and simulate the mission in real-time.
        </p>
      </div>

      {/* 4 Clean Mission Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {NASA_SCENARIOS.slice(0, 4).map((sc) => {
          const isSelected = sc.id === selectedId;
          return (
            <div
              key={sc.id}
              onClick={() => {
                soundFx.playClick();
                onSelectScenario(sc.id);
              }}
              className={`p-5 rounded-2xl cursor-pointer transition-all border text-left flex flex-col justify-between ${
                isSelected
                  ? 'bg-[#0B1E46] border-cyan-400 shadow-[0_0_25px_rgba(0,229,255,0.25)] ring-1 ring-cyan-400'
                  : 'bg-[#0E172F]/80 border-white/10 hover:border-white/30 hover:bg-[#121E3E]'
              }`}
            >
              <div>
                {/* Destination & Budget Header */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{getTargetIcon(sc.type)}</span>
                    <span className="text-xs font-semibold text-cyan-300 uppercase tracking-wider">
                      {sc.destination}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-amber-300 bg-amber-400/10 px-2.5 py-1 rounded-lg border border-amber-400/20">
                    ${sc.maxBudgetM}M Budget
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-lg font-bold text-white mb-2 leading-snug">
                  {sc.title}
                </h3>

                {/* Plain-English Goal */}
                <p className="text-xs text-slate-300 leading-relaxed mb-4">
                  {sc.primaryObjective}
                </p>
              </div>

              {/* Simple Bottom Specs */}
              <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-3">
                  <span title="Solar availability at target">
                    ☀️ {sc.environmentHazards.solarFluxPercent}% Sun
                  </span>
                  <span title="Radiation environment">
                    🛡️ {sc.environmentHazards.radiation.toUpperCase()} Radiation
                  </span>
                </div>
                <div className="text-cyan-400 font-medium flex items-center gap-1">
                  <span>{isSelected ? 'Selected' : 'Select'}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 4-Player Team Preview Banner if Team Mode Active */}
      {isTeamMode && (
        <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-500/30 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Users className="w-5 h-5 text-purple-400 shrink-0" />
            <div>
              <div className="text-xs font-bold text-white">4-Player Team Mode Active</div>
              <div className="text-[11px] text-slate-300">
                Your team roles: Flight Director, Payload Scientist, Systems Engineer, and Flight Navigator.
              </div>
            </div>
          </div>
          <span className="text-xs text-purple-300 font-medium px-3 py-1 rounded-lg bg-purple-900/50 border border-purple-400/30">
            Cooperative Flight
          </span>
        </div>
      )}

      {/* Launch Mission Design Button */}
      <div className="flex justify-center pt-2">
        <button
          onClick={() => {
            soundFx.playQuindarBeep('intro');
            onSelectScenario(selectedId);
          }}
          className="btn-nasa-primary px-8 py-3.5 rounded-xl text-base font-bold flex items-center gap-2.5 group"
        >
          <span>Continue to Build Spacecraft</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

    </div>
  );
};
