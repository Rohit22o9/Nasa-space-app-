import React from 'react';
import { MissionDesignState, EngineeringBudgets } from '../../types/mission';
import { 
  NASA_ORBITS, 
  NASA_LAUNCH_VEHICLES, 
  NASA_SCENARIOS 
} from '../../data/nasaData';
import { soundFx } from '../../utils/audio';
import { 
  Orbit, 
  Rocket, 
  Check, 
  AlertTriangle, 
  Clock, 
  Compass, 
  ShieldAlert, 
  DollarSign,
  TrendingUp,
  Weight
} from 'lucide-react';

interface Props {
  state: MissionDesignState;
  setState: React.Dispatch<React.SetStateAction<MissionDesignState>>;
  budgets: EngineeringBudgets;
}

export const TrajectoryLaunchTab: React.FC<Props> = ({ state, setState, budgets }) => {
  const scenario = NASA_SCENARIOS.find(s => s.id === state.scenarioId) || NASA_SCENARIOS[0];

  const updateField = <K extends keyof MissionDesignState>(key: K, value: MissionDesignState[K]) => {
    soundFx.playClick();
    setState(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      {/* 1. ORBIT / FLIGHT TRAJECTORY SELECTION */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Orbit className="w-4 h-4 text-cyan-400" />
            1. Target Orbit & Flight Dynamics Selection
          </h4>
          <span className="text-xs font-mono text-cyan-400">
            Recommended: {scenario.recommendedOrbit}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {NASA_ORBITS.map((orbit) => {
            const isSelected = state.orbitId === orbit.id;
            const isRecommended = scenario.recommendedOrbit === orbit.id;

            return (
              <div
                key={orbit.id}
                onClick={() => updateField('orbitId', orbit.id)}
                className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'bg-space-850 border-cyan-400 shadow-glow-cyan'
                    : 'bg-space-900/70 border-white/10 hover:border-white/25 hover:bg-space-850/50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono uppercase px-2 py-0.5 rounded bg-space-800 text-cyan-300 border border-cyan-500/20">
                      {orbit.category.toUpperCase()}
                    </span>
                    {isRecommended && (
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded">
                        SCENARIO TARGET
                      </span>
                    )}
                  </div>

                  <h4 className="text-sm font-bold text-white mb-1.5 leading-snug">
                    {orbit.name}
                  </h4>
                  <p className="text-xs text-slate-400 mb-3 leading-relaxed">
                    {orbit.description}
                  </p>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-white/5 text-[11px] font-mono text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Altitude / Pericenter:</span>
                    <span className="text-white">{orbit.altitudeKm} km</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Inclination:</span>
                    <span>{orbit.inclinationDeg}°</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Orbital Period:</span>
                    <span>{orbit.orbitalPeriodMin > 600 ? `${(orbit.orbitalPeriodMin / 1440).toFixed(1)} days` : `${orbit.orbitalPeriodMin.toFixed(0)} min`}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Eclipse Fraction:</span>
                    <span className="text-amber-400">{(orbit.eclipseFraction * 100).toFixed(0)}% shadow</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Insertion $\Delta v$ Req:</span>
                    <span className="text-orange-400 font-bold">{orbit.deltaVRequiredMs} m/s</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. LAUNCH VEHICLE SELECTION */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Rocket className="w-4 h-4 text-purple-400" />
            2. Launch Segment (Booster Matching & Mass Margin)
          </h4>
          <span className="text-xs font-mono text-slate-400">
            Total Spacecraft Wet Mass: <strong className="text-white">{budgets.totalWetMassKg.toFixed(0)} kg</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
          {NASA_LAUNCH_VEHICLES.map((lv) => {
            const isSelected = state.launchVehicleId === lv.id;

            // Capacity to current orbit
            const currentOrbit = NASA_ORBITS.find(o => o.id === state.orbitId) || NASA_ORBITS[0];
            let capKg = 0;
            if (currentOrbit.category === 'leo') capKg = lv.payloadCapacityKg.leo;
            else if (currentOrbit.category === 'sso') capKg = lv.payloadCapacityKg.sso;
            else if (currentOrbit.category === 'geo') capKg = lv.payloadCapacityKg.geo;
            else if (currentOrbit.category === 'lunar') capKg = lv.payloadCapacityKg.tli;
            else if (currentOrbit.category === 'mars') capKg = lv.payloadCapacityKg.tmi;
            else capKg = lv.payloadCapacityKg.deepSpace;

            const isOverCapacity = budgets.totalWetMassKg > capKg || capKg === 0;
            const margin = capKg > 0 ? ((capKg - budgets.totalWetMassKg) / capKg) * 100 : -100;

            return (
              <div
                key={lv.id}
                onClick={() => updateField('launchVehicleId', lv.id)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'bg-space-850 border-cyan-400 shadow-glow-cyan'
                    : 'bg-space-900/70 border-white/10 hover:border-white/25 hover:bg-space-850/50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-white">{lv.name}</span>
                    {isSelected && <Check className="w-4 h-4 text-cyan-400 shrink-0" />}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono mb-2">
                    {lv.provider}
                  </div>
                  <p className="text-[11px] text-slate-400 mb-3 leading-snug">
                    {lv.description}
                  </p>
                </div>

                <div className="space-y-1 pt-2 border-t border-white/5 text-[11px] font-mono text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Orbit Lift Cap:</span>
                    <span className={isOverCapacity ? 'text-red-400 font-bold' : 'text-emerald-400 font-bold'}>
                      {capKg > 0 ? `${capKg.toLocaleString()} kg` : 'INCOMPATIBLE'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Launch Cost:</span>
                    <span className="text-amber-400 font-semibold">${lv.costM}M</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Reliability:</span>
                    <span>{(lv.reliability * 100).toFixed(0)}%</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-white/5">
                    <span className="text-slate-400">Mass Margin:</span>
                    <span className={margin < 20 ? 'text-amber-400 font-bold' : 'text-emerald-400 font-bold'}>
                      {margin > -100 ? `${margin.toFixed(0)}%` : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mass Growth Allowance (MGA) Rule Explanation */}
      <div className="p-4 rounded-xl bg-space-950/70 border border-white/10 flex items-start gap-3">
        <Weight className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-300 leading-relaxed font-mono">
          <strong className="text-cyan-400">NASA Systems Engineering Gold Standard (MGA Margin Rule):</strong> In Phase A/B mission design, space missions must maintain at least a <strong className="text-white">20% Mass Growth Allowance</strong> over dry & wet mass estimates to account for hardware maturation, cabling, and thermal wraps. Current mass margin: <strong className={budgets.massMarginPercent < 20 ? 'text-amber-400' : 'text-emerald-400'}>{budgets.massMarginPercent.toFixed(1)}% ({budgets.massMarginKg.toFixed(0)} kg reserve)</strong>.
        </div>
      </div>
    </div>
  );
};
