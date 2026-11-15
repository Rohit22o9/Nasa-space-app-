import React from 'react';
import { MissionDesignState, EngineeringBudgets } from '../../types/mission';
import { 
  NASA_CHASSIS, 
  NASA_POWER_SYSTEMS, 
  NASA_BATTERIES, 
  NASA_ADCS, 
  NASA_PROPULSION,
  NASA_SCENARIOS 
} from '../../data/nasaData';
import { soundFx } from '../../utils/audio';
import { 
  Cpu, 
  Sun, 
  Battery, 
  Compass, 
  Flame, 
  ShieldCheck, 
  Check, 
  AlertTriangle,
  Zap,
  Weight
} from 'lucide-react';

interface Props {
  state: MissionDesignState;
  setState: React.Dispatch<React.SetStateAction<MissionDesignState>>;
  budgets: EngineeringBudgets;
}

export const SpacecraftBusTab: React.FC<Props> = ({ state, setState, budgets }) => {
  const scenario = NASA_SCENARIOS.find(s => s.id === state.scenarioId) || NASA_SCENARIOS[0];

  const updateField = <K extends keyof MissionDesignState>(key: K, value: MissionDesignState[K]) => {
    soundFx.playClick();
    setState(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      {/* 1. CHASSIS / STRUCTURAL BUS */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-cyan-400" />
            1. Spacecraft Structural Bus & Chassis Frame
          </h4>
          <span className="text-xs font-mono text-slate-400">
            Payload limit vs Dry mass
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {NASA_CHASSIS.map((chassis) => {
            const isSelected = state.chassisId === chassis.id;
            const payloadExceeded = budgets.payloadMassKg > chassis.maxPayloadMassKg;

            return (
              <div
                key={chassis.id}
                onClick={() => updateField('chassisId', chassis.id)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'bg-space-850 border-cyan-400 shadow-glow-cyan'
                    : 'bg-space-900/70 border-white/10 hover:border-white/25 hover:bg-space-850/50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-white">{chassis.name}</span>
                    {isSelected && <Check className="w-4 h-4 text-cyan-400 shrink-0" />}
                  </div>
                  <p className="text-[11px] text-slate-400 mb-3 leading-snug">
                    {chassis.description}
                  </p>
                </div>

                <div className="space-y-1 pt-2 border-t border-white/5 text-[11px] font-mono text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Dry Mass:</span>
                    <span>{chassis.dryMassKg} kg</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Max Payload:</span>
                    <span className={payloadExceeded ? 'text-red-400 font-bold' : 'text-emerald-400'}>
                      {chassis.maxPayloadMassKg} kg
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Shielding:</span>
                    <span>{chassis.radiationShieldingMm} mm Al</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Cost:</span>
                    <span className="text-amber-400 font-semibold">${chassis.costM}M</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. POWER GENERATION (SOLAR vs RTG) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Sun className="w-4 h-4 text-yellow-400" />
            2. Primary Power Architecture (Solar Arrays vs Nuclear RTG)
          </h4>
          <span className="text-xs font-mono text-yellow-400">
            Solar Flux at {scenario.destination}: {scenario.environmentHazards.solarFluxPercent}%
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {NASA_POWER_SYSTEMS.map((power) => {
            const isSelected = state.powerSystemId === power.id;
            const distAu = scenario.distanceAU;
            const effectiveW = power.type === 'rtg_nextgen' 
              ? power.basePowerEarthW 
              : power.basePowerEarthW * (1 / (distAu * distAu));

            return (
              <div
                key={power.id}
                onClick={() => updateField('powerSystemId', power.id)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'bg-space-850 border-cyan-400 shadow-glow-cyan'
                    : 'bg-space-900/70 border-white/10 hover:border-white/25 hover:bg-space-850/50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-white">{power.name}</span>
                    {isSelected && <Check className="w-4 h-4 text-cyan-400 shrink-0" />}
                  </div>
                  <p className="text-[11px] text-slate-400 mb-3 leading-snug">
                    {power.description}
                  </p>
                </div>

                <div className="space-y-1 pt-2 border-t border-white/5 text-[11px] font-mono text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Output at Target:</span>
                    <span className={effectiveW < budgets.totalDayPowerConsumptionW ? 'text-red-400 font-bold' : 'text-yellow-400 font-bold'}>
                      {effectiveW.toFixed(0)} W
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">System Mass:</span>
                    <span>{power.massKg} kg</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Cost:</span>
                    <span className="text-amber-400 font-semibold">${power.costM}M</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. BATTERY & ECLIPSE ENERGY STORAGE */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Battery className="w-4 h-4 text-emerald-400" />
            3. Energy Storage & Depth of Discharge (DoD)
          </h4>
          <span className="text-xs font-mono text-emerald-400">
            Eclipse Duration: {budgets.eclipseDurationMin.toFixed(0)} min
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {NASA_BATTERIES.map((battery) => {
            const isSelected = state.batterySystemId === battery.id;
            const dod = budgets.energyRequiredInEclipseWh / battery.capacityWh;

            return (
              <div
                key={battery.id}
                onClick={() => updateField('batterySystemId', battery.id)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'bg-space-850 border-cyan-400 shadow-glow-cyan'
                    : 'bg-space-900/70 border-white/10 hover:border-white/25 hover:bg-space-850/50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-white">{battery.name}</span>
                    {isSelected && <Check className="w-4 h-4 text-cyan-400 shrink-0" />}
                  </div>
                  <p className="text-[11px] text-slate-400 mb-3 leading-snug">
                    {battery.description}
                  </p>
                </div>

                <div className="space-y-1 pt-2 border-t border-white/5 text-[11px] font-mono text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Capacity:</span>
                    <span className="text-white font-bold">{battery.capacityWh} Wh</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Eclipse DoD:</span>
                    <span className={dod > battery.maxDepthOfDischarge ? 'text-red-400 font-bold' : 'text-emerald-400'}>
                      {(dod * 100).toFixed(0)}% (Max {(battery.maxDepthOfDischarge * 100)}%)
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Cost:</span>
                    <span className="text-amber-400 font-semibold">${battery.costM}M</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. ADCS & POINTING ACCURACY */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Compass className="w-4 h-4 text-sky-400" />
            4. Attitude Determination & Control System (ADCS)
          </h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {NASA_ADCS.map((adcs) => {
            const isSelected = state.adcsSystemId === adcs.id;
            return (
              <div
                key={adcs.id}
                onClick={() => updateField('adcsSystemId', adcs.id)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'bg-space-850 border-cyan-400 shadow-glow-cyan'
                    : 'bg-space-900/70 border-white/10 hover:border-white/25 hover:bg-space-850/50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-white">{adcs.name}</span>
                    {isSelected && <Check className="w-4 h-4 text-cyan-400 shrink-0" />}
                  </div>
                  <p className="text-[11px] text-slate-400 mb-3 leading-snug">
                    {adcs.description}
                  </p>
                </div>

                <div className="space-y-1 pt-2 border-t border-white/5 text-[11px] font-mono text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Pointing Precision:</span>
                    <span className="text-cyan-400 font-semibold">{adcs.pointingAccuracyArcsec} arcsec</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Power Draw:</span>
                    <span>{adcs.powerW} W</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Cost:</span>
                    <span className="text-amber-400 font-semibold">${adcs.costM}M</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. PROPULSION & PROPELLANT LOAD */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Flame className="w-4 h-4 text-orange-400" />
            5. In-Space Propulsion & Propellant Budget
          </h4>
          <span className="text-xs font-mono text-orange-400">
            Available Delta-V: {budgets.availableDeltaVMs.toFixed(0)} m/s (Req: {budgets.requiredDeltaVMs} m/s)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 mb-4">
          {NASA_PROPULSION.map((prop) => {
            const isSelected = state.propulsionSystemId === prop.id;
            return (
              <div
                key={prop.id}
                onClick={() => updateField('propulsionSystemId', prop.id)}
                className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'bg-space-850 border-cyan-400 shadow-glow-cyan'
                    : 'bg-space-900/70 border-white/10 hover:border-white/25 hover:bg-space-850/50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-white">{prop.name.split('(')[0]}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0" />}
                  </div>
                  <p className="text-[10px] text-slate-400 mb-2 leading-snug">
                    {prop.fuelType}
                  </p>
                </div>

                <div className="space-y-0.5 pt-1.5 border-t border-white/5 text-[10px] font-mono text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Specific Impulse (Isp):</span>
                    <span className="text-orange-400 font-bold">{prop.ispSec} s</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Dry Mass:</span>
                    <span>{prop.dryMassKg} kg</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Cost:</span>
                    <span className="text-amber-400 font-semibold">${prop.costM}M</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Propellant Slider */}
        {state.propulsionSystemId !== 'prop_none' && (
          <div className="p-4 rounded-xl bg-space-900/80 border border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="w-full md:w-2/3">
              <div className="flex justify-between text-xs font-mono text-slate-300 mb-2">
                <span>Loaded Propellant Mass: <strong className="text-orange-400">{state.propellantMassKg} kg</strong></span>
                <span>Tsiolkovsky $\Delta v$: <strong className={budgets.availableDeltaVMs < budgets.requiredDeltaVMs ? 'text-red-400' : 'text-emerald-400'}>{budgets.availableDeltaVMs.toFixed(0)} m/s</strong></span>
              </div>
              <input
                type="range"
                min="0"
                max="800"
                step="10"
                value={state.propellantMassKg}
                onChange={(e) => updateField('propellantMassKg', Number(e.target.value))}
                className="w-full accent-orange-500 cursor-pointer h-2 bg-space-950 rounded-lg"
              />
            </div>
            <div className="text-xs font-mono text-slate-400 text-right shrink-0">
              Wet Mass: <strong className="text-white">{budgets.totalWetMassKg.toFixed(0)} kg</strong>
            </div>
          </div>
        )}
      </div>

      {/* 6. REDUNDANCY & RADIATION SHIELDING */}
      <div className="p-4 rounded-xl bg-space-900/70 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <div>
            <div className="text-xs font-bold text-white">Dual-Redundant Class-A Avionics Architecture</div>
            <div className="text-[11px] text-slate-400">Prevents single-point failures (+8% reliability score, +$16M, +10 kg mass)</div>
          </div>
        </div>
        <button
          onClick={() => updateField('redundantAvionics', !state.redundantAvionics)}
          className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition ${
            state.redundantAvionics
              ? 'bg-emerald-500 text-space-950 shadow-glow-emerald'
              : 'bg-space-800 text-slate-300 hover:bg-space-700'
          }`}
        >
          {state.redundantAvionics ? 'ENABLED (REDUNDANT)' : 'DISABLED (SINGLE STRING)'}
        </button>
      </div>
    </div>
  );
};
