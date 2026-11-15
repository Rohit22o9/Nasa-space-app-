import React from 'react';
import { MissionDesignState, EngineeringBudgets } from '../../types/mission';
import { NASA_SCENARIOS, NASA_INSTRUMENTS } from '../../data/nasaData';
import { soundFx } from '../../utils/audio';
import { 
  Atom, 
  Check, 
  Plus, 
  Trash2, 
  Zap, 
  Database, 
  DollarSign, 
  Weight, 
  Award, 
  Sparkles,
  HelpCircle,
  FileQuestion
} from 'lucide-react';

interface Props {
  state: MissionDesignState;
  setState: React.Dispatch<React.SetStateAction<MissionDesignState>>;
  budgets: EngineeringBudgets;
}

export const SciencePayloadTab: React.FC<Props> = ({ state, setState, budgets }) => {
  const scenario = NASA_SCENARIOS.find(s => s.id === state.scenarioId) || NASA_SCENARIOS[0];

  const toggleInstrument = (instId: string) => {
    soundFx.playClick();
    setState(prev => {
      const exists = prev.selectedInstrumentIds.includes(instId);
      const updated = exists
        ? prev.selectedInstrumentIds.filter(id => id !== instId)
        : [...prev.selectedInstrumentIds, instId];
      return { ...prev, selectedInstrumentIds: updated };
    });
  };

  return (
    <div className="space-y-6">
      {/* Science Mission Objectives Banner */}
      <div className="bg-space-900/90 border border-cyan-500/20 rounded-2xl p-4 md:p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-cyan-300">
              CML 2: Scientific Objectives & Measurement Requirements
            </h3>
          </div>
          <div className="text-xs font-mono px-2.5 py-1 rounded bg-space-950 border border-white/10 text-amber-300">
            Target Science Score: {scenario.minScienceTarget} pts
          </div>
        </div>

        <p className="text-xs md:text-sm text-slate-300 mb-4 leading-relaxed">
          {scenario.primaryObjective}
        </p>

        {/* Scientific Questions Checklist */}
        <div className="space-y-2">
          <div className="text-xs font-mono text-slate-400 flex items-center gap-1.5 mb-1">
            <FileQuestion className="w-3.5 h-3.5 text-cyan-400" />
            <span>Target Scientific Questions (Instrument Alignment):</span>
          </div>
          {scenario.scientificQuestions.map((q, idx) => {
            // Check if covered by any selected instrument
            const isCovered = NASA_INSTRUMENTS
              .filter(inst => state.selectedInstrumentIds.includes(inst.id))
              .some(inst => inst.bestFitObjectives.some(obj => q.toLowerCase().includes(obj.toLowerCase()) || obj.toLowerCase().includes(q.toLowerCase().slice(0, 15))));

            return (
              <div 
                key={idx} 
                className={`flex items-start gap-2.5 p-2.5 rounded-xl border text-xs transition ${
                  isCovered 
                    ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-200' 
                    : 'bg-space-950/40 border-white/5 text-slate-400'
                }`}
              >
                <div className={`w-4 h-4 rounded-full mt-0.5 flex items-center justify-center shrink-0 text-[10px] ${
                  isCovered ? 'bg-emerald-500 text-space-950 font-bold' : 'bg-space-800 text-slate-500'
                }`}>
                  {isCovered ? <Check className="w-3 h-3 stroke-[3]" /> : idx + 1}
                </div>
                <div className="leading-snug">{q}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Payload Summary Quick Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 rounded-xl bg-space-900 border border-white/10 font-mono">
          <div className="text-[11px] text-slate-400 flex items-center gap-1">
            <Weight className="w-3.5 h-3.5 text-sky-400" />
            Payload Mass
          </div>
          <div className="text-lg font-bold text-white mt-1">
            {budgets.payloadMassKg} <span className="text-xs font-normal text-slate-400">kg</span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-space-900 border border-white/10 font-mono">
          <div className="text-[11px] text-slate-400 flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-yellow-400" />
            Day Power Draw
          </div>
          <div className="text-lg font-bold text-white mt-1">
            {budgets.totalDayPowerConsumptionW.toFixed(0)} <span className="text-xs font-normal text-slate-400">W</span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-space-900 border border-white/10 font-mono">
          <div className="text-[11px] text-slate-400 flex items-center gap-1">
            <Database className="w-3.5 h-3.5 text-purple-400" />
            Daily Data Volume
          </div>
          <div className="text-lg font-bold text-white mt-1">
            {budgets.dataGeneratedPerDayGb.toFixed(1)} <span className="text-xs font-normal text-slate-400">Gb/day</span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-space-900 border border-white/10 font-mono">
          <div className="text-[11px] text-slate-400 flex items-center gap-1">
            <Award className="w-3.5 h-3.5 text-emerald-400" />
            Science Yield
          </div>
          <div className="text-lg font-bold text-cyan-400 mt-1">
            {budgets.totalScienceScore} <span className="text-xs font-normal text-slate-400">pts</span>
          </div>
        </div>
      </div>

      {/* Available Instruments Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Atom className="w-4 h-4 text-cyan-400" />
            Available Scientific Instruments Catalog
          </h4>
          <span className="text-xs font-mono text-cyan-400">
            {state.selectedInstrumentIds.length} Selected
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {NASA_INSTRUMENTS.map((inst) => {
            const isSelected = state.selectedInstrumentIds.includes(inst.id);
            const matchesScenario = scenario.scientificQuestions.some(q =>
              inst.bestFitObjectives.some(obj => q.toLowerCase().includes(obj.toLowerCase()) || obj.toLowerCase().includes(q.toLowerCase().slice(0, 15)))
            );

            return (
              <div
                key={inst.id}
                onClick={() => toggleInstrument(inst.id)}
                className={`relative p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'bg-space-850 border-cyan-400 shadow-glow-cyan'
                    : 'bg-space-900/70 border-white/10 hover:border-white/20 hover:bg-space-850/50'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                          {inst.acronym}
                        </span>
                        <span className="text-xs font-mono text-slate-400 uppercase">
                          {inst.category.replace('_', ' ')}
                        </span>
                        {matchesScenario && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            HIGH PRIORITY MATCH
                          </span>
                        )}
                      </div>
                      <h4 className="text-sm font-bold text-white mt-1 leading-snug">
                        {inst.name}
                      </h4>
                    </div>

                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition ${
                      isSelected ? 'bg-cyan-500 text-space-950' : 'bg-space-800 text-slate-400'
                    }`}>
                      {isSelected ? <Check className="w-4 h-4 stroke-[3]" /> : <Plus className="w-4 h-4" />}
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 mb-3 leading-relaxed">
                    {inst.description}
                  </p>
                </div>

                {/* Instrument Specifications Grid */}
                <div>
                  <div className="grid grid-cols-4 gap-1.5 p-2 rounded-lg bg-space-950/60 border border-white/5 text-[11px] font-mono text-slate-300 mb-2">
                    <div>
                      <span className="text-[10px] text-slate-500 block">MASS</span>
                      <span className="font-semibold text-white">{inst.massKg} kg</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">POWER</span>
                      <span className="font-semibold text-yellow-400">{inst.powerW} W</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">COST</span>
                      <span className="font-semibold text-amber-400">${inst.costM}M</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">DATA RATE</span>
                      <span className="font-semibold text-purple-400">{inst.dataRateMbps} Mbps</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                    <span>TRL {inst.trl}/9 (Maturity)</span>
                    <span className="text-emerald-400 font-semibold">+{inst.scienceValue} Science Pts</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
