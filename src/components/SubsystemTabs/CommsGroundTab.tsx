import React from 'react';
import { MissionDesignState, EngineeringBudgets } from '../../types/mission';
import { 
  NASA_COMMS, 
  NASA_SCENARIOS 
} from '../../data/nasaData';
import { soundFx } from '../../utils/audio';
import { 
  Radio, 
  Antenna, 
  Check, 
  AlertTriangle, 
  Database, 
  Wifi, 
  Globe2, 
  ShieldCheck,
  Server
} from 'lucide-react';

interface Props {
  state: MissionDesignState;
  setState: React.Dispatch<React.SetStateAction<MissionDesignState>>;
  budgets: EngineeringBudgets;
}

export const CommsGroundTab: React.FC<Props> = ({ state, setState, budgets }) => {
  const scenario = NASA_SCENARIOS.find(s => s.id === state.scenarioId) || NASA_SCENARIOS[0];

  const updateField = <K extends keyof MissionDesignState>(key: K, value: MissionDesignState[K]) => {
    soundFx.playClick();
    setState(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      {/* 1. SPACECRAFT TELECOM & ANTENNA ARCHITECTURE */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Radio className="w-4 h-4 text-cyan-400" />
            1. Spacecraft Telecommunications Subsystem (Antenna & Frequency)
          </h4>
          <span className="text-xs font-mono text-cyan-400">
            One-Way Light Delay: {scenario.environmentHazards.commDelaySec > 60 ? `${(scenario.environmentHazards.commDelaySec / 60).toFixed(1)} min` : `${scenario.environmentHazards.commDelaySec} s`}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {NASA_COMMS.map((comms) => {
            const isSelected = state.commsSystemId === comms.id;
            return (
              <div
                key={comms.id}
                onClick={() => updateField('commsSystemId', comms.id)}
                className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'bg-space-850 border-cyan-400 shadow-glow-cyan'
                    : 'bg-space-900/70 border-white/10 hover:border-white/25 hover:bg-space-850/50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono uppercase px-2 py-0.5 rounded bg-space-800 text-cyan-300 border border-cyan-500/20">
                      {comms.frequencyBand}
                    </span>
                    {isSelected && <Check className="w-4 h-4 text-cyan-400 shrink-0" />}
                  </div>

                  <h4 className="text-sm font-bold text-white mb-1.5 leading-snug">
                    {comms.name}
                  </h4>
                  <p className="text-xs text-slate-400 mb-3 leading-relaxed">
                    {comms.description}
                  </p>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-white/5 text-[11px] font-mono text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Peak Downlink:</span>
                    <span className="text-cyan-400 font-bold">{comms.maxDataRateMbps} Mbps</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">RF Power Draw:</span>
                    <span>{comms.powerW} W</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Subsystem Mass:</span>
                    <span>{comms.massKg} kg</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Cost:</span>
                    <span className="text-amber-400 font-semibold">${comms.costM}M</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. DATA LINK BUDGET & DOWNLINK CAPACITY ANALYSIS */}
      <div className="p-5 rounded-2xl bg-space-900/90 border border-white/10">
        <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-2 mb-4">
          <Database className="w-4 h-4 text-purple-400" />
          2. Daily Data Generation vs Downlink Balance (Solid-State Buffer Margin)
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="p-3.5 rounded-xl bg-space-950/70 border border-white/5 font-mono">
            <span className="text-[11px] text-slate-400 block mb-1">DATA GENERATED PER DAY</span>
            <div className="text-xl font-bold text-white">
              {budgets.dataGeneratedPerDayGb.toFixed(1)} <span className="text-xs text-slate-400 font-normal">Gb/day</span>
            </div>
            <div className="text-[10px] text-slate-500 mt-1">Generated across all active science sensors</div>
          </div>

          <div className="p-3.5 rounded-xl bg-space-950/70 border border-white/5 font-mono">
            <span className="text-[11px] text-slate-400 block mb-1">DOWNLINK PASS CAPACITY</span>
            <div className="text-xl font-bold text-cyan-400">
              {budgets.maxDownlinkCapacityPerDayGb.toFixed(1)} <span className="text-xs text-slate-400 font-normal">Gb/day</span>
            </div>
            <div className="text-[10px] text-slate-500 mt-1">To Ground Network stations per 24 hours</div>
          </div>

          <div className="p-3.5 rounded-xl bg-space-950/70 border border-white/5 font-mono">
            <span className="text-[11px] text-slate-400 block mb-1">NET DATA MARGIN</span>
            <div className={`text-xl font-bold ${budgets.dataLinkMarginGb < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
              {budgets.dataLinkMarginGb > 0 ? `+${budgets.dataLinkMarginGb.toFixed(1)}` : budgets.dataLinkMarginGb.toFixed(1)} <span className="text-xs font-normal">Gb/day</span>
            </div>
            <div className="text-[10px] text-slate-500 mt-1">
              {budgets.dataLinkMarginGb < 0 ? 'WARNING: SSR Recorder Buffer will overflow!' : 'Healthy positive downlink link margin'}
            </div>
          </div>
        </div>

        {/* Ground Station Network Selector */}
        <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Globe2 className="w-5 h-5 text-cyan-400" />
            <div>
              <div className="text-xs font-bold text-white">Ground Segment Network</div>
              <div className="text-[11px] text-slate-400">
                NASA Deep Space Network (Goldstone, Madrid, Canberra) & Near Space Network
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {(['NSN', 'DSN', 'Both'] as const).map(net => (
              <button
                key={net}
                onClick={() => updateField('groundNetwork', net)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition ${
                  state.groundNetwork === net
                    ? 'bg-cyan-500 text-space-950 shadow-glow-cyan'
                    : 'bg-space-800 text-slate-300 hover:bg-space-700'
                }`}
              >
                {net === 'Both' ? 'DSN + NSN Hybrids' : net}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
