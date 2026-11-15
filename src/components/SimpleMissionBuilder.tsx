import React from 'react';
import { MissionDesignState, EngineeringBudgets } from '../types/mission';
import { 
  NASA_SCENARIOS, 
  NASA_INSTRUMENTS, 
  NASA_POWER_SYSTEMS, 
  NASA_LAUNCH_VEHICLES 
} from '../data/nasaData';
import { soundFx } from '../utils/audio';
import { ThreeSpacecraftViewer } from './ThreeSpacecraftViewer';
import { 
  Check, 
  Plus, 
  Rocket, 
  Zap, 
  Weight, 
  DollarSign, 
  Award, 
  ShieldCheck, 
  Crosshair,
  ChevronRight,
  Radio,
  Flame,
  Battery
} from 'lucide-react';

interface Props {
  state: MissionDesignState;
  setState: React.Dispatch<React.SetStateAction<MissionDesignState>>;
  budgets: EngineeringBudgets;
  onLaunch: () => void;
  isTeamMode: boolean;
}

export const SimpleMissionBuilder: React.FC<Props> = ({
  state,
  setState,
  budgets,
  onLaunch,
  isTeamMode
}) => {
  const scenario = NASA_SCENARIOS.find(s => s.id === state.scenarioId) || NASA_SCENARIOS[0];

  const toggleInstrument = (instId: string) => {
    soundFx.playComponentMount();
    setState(prev => {
      const exists = prev.selectedInstrumentIds.includes(instId);
      const updated = exists
        ? prev.selectedInstrumentIds.filter(id => id !== instId)
        : [...prev.selectedInstrumentIds, instId];
      return { ...prev, selectedInstrumentIds: updated };
    });
  };

  const setPowerSystem = (powerId: string) => {
    soundFx.playComponentMount();
    setState(prev => ({ ...prev, powerSystemId: powerId }));
  };

  const setLaunchVehicle = (lvId: string) => {
    soundFx.playComponentMount();
    setState(prev => ({ ...prev, launchVehicleId: lvId }));
  };

  const canLaunch = budgets.massStatus !== 'critical' && 
                    budgets.powerStatus !== 'critical' && 
                    budgets.costStatus !== 'critical';

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 py-2">
      
      {/* 1. TOP COCKPIT HUD GAUGES (Mass, Power, Credits) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        
        {/* Mass Capacity Gauge */}
        <div className={`p-4 rounded-2xl border flex flex-col justify-between transition-all ${
          budgets.massStatus === 'critical' 
            ? 'bg-red-950/40 border-red-500/60 shadow-[0_0_20px_rgba(239,68,68,0.25)]' 
            : 'bg-[#0A1329]/90 border-cyan-500/30 shadow-[0_0_15px_rgba(0,229,255,0.08)]'
        }`}>
          <div className="flex items-center justify-between text-xs font-mono mb-1">
            <span className="flex items-center gap-1.5 text-cyan-300 font-bold">
              <Weight className="w-4 h-4 text-cyan-400" /> SPACECRAFT MASS
            </span>
            <span className={budgets.massStatus === 'critical' ? 'text-red-400 font-black' : 'text-cyan-400 font-black'}>
              {budgets.totalWetMassKg.toFixed(0)} / {budgets.launchVehicleMaxCapacityKg} kg
            </span>
          </div>
          <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden my-2 border border-white/5">
            <div 
              className={`h-full transition-all duration-300 ${budgets.massStatus === 'critical' ? 'bg-red-500 animate-pulse' : 'bg-gradient-to-r from-sky-400 to-cyan-400'}`}
              style={{ width: `${Math.min(100, (budgets.totalWetMassKg / budgets.launchVehicleMaxCapacityKg) * 100)}%` }}
            />
          </div>
          <div className="text-[11px] font-mono text-slate-300 flex justify-between">
            <span>MGA Safety Reserve:</span>
            <span className={budgets.massMarginPercent < 20 ? 'text-amber-400 font-bold' : 'text-emerald-400 font-bold'}>
              {budgets.massMarginPercent.toFixed(0)}% margin
            </span>
          </div>
        </div>

        {/* Power Grid Gauge */}
        <div className={`p-4 rounded-2xl border flex flex-col justify-between transition-all ${
          budgets.powerStatus === 'critical' 
            ? 'bg-red-950/40 border-red-500/60 shadow-[0_0_20px_rgba(239,68,68,0.25)]' 
            : 'bg-[#0A1329]/90 border-yellow-500/30 shadow-[0_0_15px_rgba(234,179,8,0.08)]'
        }`}>
          <div className="flex items-center justify-between text-xs font-mono mb-1">
            <span className="flex items-center gap-1.5 text-yellow-300 font-bold">
              <Zap className="w-4 h-4 text-yellow-400" /> POWER GENERATION
            </span>
            <span className={budgets.powerStatus === 'critical' ? 'text-red-400 font-black' : 'text-yellow-400 font-black'}>
              {budgets.powerGeneratedSunlightW.toFixed(0)} W / {budgets.totalDayPowerConsumptionW.toFixed(0)} W
            </span>
          </div>
          <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden my-2 border border-white/5">
            <div 
              className={`h-full transition-all duration-300 ${budgets.powerStatus === 'critical' ? 'bg-red-500 animate-pulse' : 'bg-gradient-to-r from-yellow-500 to-amber-300'}`}
              style={{ width: `${Math.min(100, (budgets.totalDayPowerConsumptionW / Math.max(1, budgets.powerGeneratedSunlightW)) * 100)}%` }}
            />
          </div>
          <div className="text-[11px] font-mono text-slate-300 flex justify-between">
            <span>Net Energy Delta:</span>
            <span className={budgets.powerMarginSunlightW < 0 ? 'text-red-400 font-bold' : 'text-yellow-400 font-bold'}>
              {budgets.powerMarginSunlightW > 0 ? `+${budgets.powerMarginSunlightW.toFixed(0)} W surplus` : `${budgets.powerMarginSunlightW.toFixed(0)} W deficit`}
            </span>
          </div>
        </div>

        {/* Mission Budget Credits Gauge */}
        <div className={`p-4 rounded-2xl border flex flex-col justify-between transition-all ${
          budgets.costStatus === 'critical' 
            ? 'bg-red-950/40 border-red-500/60 shadow-[0_0_20px_rgba(239,68,68,0.25)]' 
            : 'bg-[#0A1329]/90 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.08)]'
        }`}>
          <div className="flex items-center justify-between text-xs font-mono mb-1">
            <span className="flex items-center gap-1.5 text-emerald-300 font-bold">
              <DollarSign className="w-4 h-4 text-emerald-400" /> MISSION BUDGET
            </span>
            <span className={budgets.costStatus === 'critical' ? 'text-red-400 font-black' : 'text-emerald-400 font-black'}>
              ${budgets.totalCostM.toFixed(0)}M / ${budgets.budgetCapM}M
            </span>
          </div>
          <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden my-2 border border-white/5">
            <div 
              className={`h-full transition-all duration-300 ${budgets.costStatus === 'critical' ? 'bg-red-500 animate-pulse' : 'bg-gradient-to-r from-emerald-500 to-teal-400'}`}
              style={{ width: `${Math.min(100, (budgets.totalCostM / budgets.budgetCapM) * 100)}%` }}
            />
          </div>
          <div className="text-[11px] font-mono text-slate-300 flex justify-between">
            <span>Contingency Reserve:</span>
            <span className={budgets.remainingBudgetM < 0 ? 'text-red-400 font-bold' : 'text-emerald-400 font-bold'}>
              ${budgets.remainingBudgetM.toFixed(0)}M available
            </span>
          </div>
        </div>

      </div>

      {/* 2. SPLIT WORKSPACE: 3D Hangar on Left, Sci-Fi Component Racks on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: 3D Spacecraft Shipyard View */}
        <div className="lg:col-span-5 space-y-3 sticky top-20">
          <ThreeSpacecraftViewer state={state} />

          {/* Mission Objectives HUD Display */}
          <div className="p-4 rounded-2xl bg-[#081024]/90 border border-cyan-500/25 text-xs text-slate-300 space-y-2.5 font-mono shadow-md">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <span className="text-cyan-400 font-bold flex items-center gap-1.5">
                <Crosshair className="w-3.5 h-3.5" /> MISSION OBJECTIVE:
              </span>
              <span className="text-white font-bold">{scenario.destination}</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              {scenario.primaryObjective}
            </p>
            <div className="pt-2 border-t border-white/10 flex items-center justify-between">
              <span className="text-slate-400">Total Science Yield:</span>
              <span className="text-cyan-300 font-black text-sm flex items-center gap-1">
                <Award className="w-4 h-4 text-cyan-400" />
                {budgets.totalScienceScore} PTS
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Space Game Component Outfitting Bay */}
        <div className="lg:col-span-7 space-y-6">

          {/* BAY SLOT 1: SCIENCE INSTRUMENTS */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-mono font-bold text-cyan-300 flex items-center gap-2 tracking-wide uppercase">
                <span className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 text-xs flex items-center justify-center font-bold">1</span>
                <span>Science Payload Bay (Sensors & Radar)</span>
              </h3>
              <span className="text-xs font-mono text-cyan-400">
                {state.selectedInstrumentIds.length} Hardpoints Active
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {NASA_INSTRUMENTS.slice(0, 6).map((inst) => {
                const isSelected = state.selectedInstrumentIds.includes(inst.id);
                return (
                  <div
                    key={inst.id}
                    onClick={() => toggleInstrument(inst.id)}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-start justify-between gap-3 ${
                      isSelected
                        ? 'bg-[#0B214D] border-cyan-400 shadow-[0_0_18px_rgba(0,229,255,0.25)] ring-1 ring-cyan-400'
                        : 'bg-[#091226]/80 border-white/10 hover:border-cyan-500/40 hover:bg-[#0e1b38]'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                          {inst.acronym}
                        </span>
                        <span className="text-xs font-bold text-white">{inst.name}</span>
                      </div>
                      <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed">
                        {inst.description}
                      </p>
                      <div className="flex items-center gap-3 text-[10px] text-slate-400 pt-1 font-mono">
                        <span className="text-emerald-400 font-bold">+{inst.scienceValue} pts</span>
                        <span>{inst.massKg} kg</span>
                        <span>{inst.powerW} W</span>
                        <span className="text-amber-400 font-bold">${inst.costM}M</span>
                      </div>
                    </div>

                    <div className={`w-5 h-5 rounded-lg flex items-center justify-center shrink-0 mt-0.5 transition ${
                      isSelected ? 'bg-cyan-500 text-space-950 font-bold' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {isSelected ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Plus className="w-3.5 h-3.5" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* BAY SLOT 2: POWER REACTOR CORE */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-mono font-bold text-yellow-300 flex items-center gap-2 tracking-wide uppercase">
                <span className="w-6 h-6 rounded-lg bg-yellow-500/20 text-yellow-400 border border-yellow-500/40 text-xs flex items-center justify-center font-bold">2</span>
                <span>Spacecraft Power Architecture</span>
              </h3>
              <span className="text-xs font-mono text-yellow-400">
                Solar Irradiance: {scenario.environmentHazards.solarFluxPercent}%
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {[
                {
                  id: 'pwr_solar_deployable',
                  name: 'Dual Deployable Wings',
                  desc: 'High efficiency for Moon/Earth. Low power in deep space.',
                  power: '550 W (1 AU)',
                  cost: '$18M'
                },
                {
                  id: 'pwr_solar_ultraflex',
                  name: 'MegaFlex Circular Solar',
                  desc: 'Unfolding fan wings with ultra-high surface area.',
                  power: '1,600 W',
                  cost: '$44M'
                },
                {
                  id: 'pwr_rtg_nextgen',
                  name: 'Nuclear RTG (Plutonium)',
                  desc: 'Continuous nuclear decay power independent of solar distance.',
                  power: '500 W Constant',
                  cost: '$95M'
                }
              ].map((pwr) => {
                const isSelected = state.powerSystemId === pwr.id;
                return (
                  <div
                    key={pwr.id}
                    onClick={() => setPowerSystem(pwr.id)}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-[#1a233a] border-yellow-400 shadow-[0_0_18px_rgba(234,179,8,0.25)] ring-1 ring-yellow-400'
                        : 'bg-[#091226]/80 border-white/10 hover:border-yellow-500/40 hover:bg-[#0e1b38]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-white">{pwr.name}</span>
                        {isSelected && <Check className="w-4 h-4 text-yellow-400" />}
                      </div>
                      <p className="text-[11px] text-slate-300 mb-2 leading-relaxed">
                        {pwr.desc}
                      </p>
                    </div>
                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-300 pt-2 border-t border-white/10">
                      <span className="text-yellow-400 font-bold">{pwr.power}</span>
                      <span className="text-amber-400">{pwr.cost}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* BAY SLOT 3: HEAVY LAUNCH VEHICLE */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-mono font-bold text-purple-300 flex items-center gap-2 tracking-wide uppercase">
                <span className="w-6 h-6 rounded-lg bg-purple-500/20 text-purple-400 border border-purple-500/40 text-xs flex items-center justify-center font-bold">3</span>
                <span>Booster Launch Vehicle Drive</span>
              </h3>
              <span className="text-xs font-mono text-slate-400">
                Payload mass must fit booster limit
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {[
                {
                  id: 'lv_electron',
                  name: 'Rocket Lab Electron',
                  desc: 'Small dedicated launcher for micro-sats.',
                  cost: '$8.5M',
                  cap: '220 kg'
                },
                {
                  id: 'lv_falcon9',
                  name: 'SpaceX Falcon 9',
                  desc: 'Reliable workhorse medium launcher.',
                  cost: '$67M',
                  cap: '4,000 kg (TLI)'
                },
                {
                  id: 'lv_falcon_heavy',
                  name: 'SpaceX Falcon Heavy',
                  desc: 'Triple-core heavy lift for deep space probes.',
                  cost: '$130M',
                  cap: '18,000 kg'
                }
              ].map((lv) => {
                const isSelected = state.launchVehicleId === lv.id;
                return (
                  <div
                    key={lv.id}
                    onClick={() => setLaunchVehicle(lv.id)}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-[#1b1738] border-purple-400 shadow-[0_0_18px_rgba(168,85,247,0.25)] ring-1 ring-purple-400'
                        : 'bg-[#091226]/80 border-white/10 hover:border-purple-500/40 hover:bg-[#0e1b38]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-white">{lv.name}</span>
                        {isSelected && <Check className="w-4 h-4 text-purple-400" />}
                      </div>
                      <p className="text-[11px] text-slate-300 mb-2 leading-relaxed">
                        {lv.desc}
                      </p>
                    </div>
                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-300 pt-2 border-t border-white/10">
                      <span className="text-cyan-300 font-bold">{lv.cap}</span>
                      <span className="text-amber-400">{lv.cost}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 4. PRE-FLIGHT VERIFICATION & BIG TACTILE LAUNCH BUTTON */}
          <div className="p-5 rounded-3xl bg-[#091226] border border-cyan-500/30 space-y-4 shadow-[0_0_25px_rgba(0,229,255,0.1)]">
            <div className="flex items-center justify-between font-mono">
              <span className="text-xs font-bold text-slate-200 uppercase tracking-widest flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                PRE-FLIGHT SYSTEMS CERTIFICATION
              </span>
              <span className={`text-xs font-black px-2.5 py-0.5 rounded-lg border ${
                canLaunch 
                  ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.3)]' 
                  : 'bg-red-950/80 border-red-500 text-red-300 shadow-[0_0_12px_rgba(239,68,68,0.3)]'
              }`}>
                {canLaunch ? 'ALL SYSTEMS GO FOR LAUNCH' : 'ABORT: CONSTRAINTS EXCEEDED'}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2.5 text-xs font-mono">
              <div className={`p-2.5 rounded-xl border flex items-center justify-center gap-1.5 ${
                budgets.massStatus !== 'critical' ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300' : 'bg-red-950/30 border-red-500/40 text-red-300'
              }`}>
                {budgets.massStatus !== 'critical' ? '✓ Mass Safe' : '✗ Overweight'}
              </div>

              <div className={`p-2.5 rounded-xl border flex items-center justify-center gap-1.5 ${
                budgets.powerStatus !== 'critical' ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300' : 'bg-red-950/30 border-red-500/40 text-red-300'
              }`}>
                {budgets.powerStatus !== 'critical' ? '✓ Power Surplus' : '✗ Power Deficit'}
              </div>

              <div className={`p-2.5 rounded-xl border flex items-center justify-center gap-1.5 ${
                budgets.costStatus !== 'critical' ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300' : 'bg-red-950/30 border-red-500/40 text-red-300'
              }`}>
                {budgets.costStatus !== 'critical' ? '✓ Under Budget' : '✗ Over Budget'}
              </div>
            </div>

            {/* Glowing Space Game Launch Sequence Button */}
            <button
              onClick={() => {
                if (canLaunch) {
                  soundFx.playThruster(3.0);
                  onLaunch();
                }
              }}
              disabled={!canLaunch}
              className={`w-full py-4 rounded-2xl font-display font-extrabold text-base md:text-lg flex items-center justify-center gap-3 transition-all tracking-wide ${
                canLaunch
                  ? 'btn-nasa-accent shadow-[0_0_25px_rgba(252,61,33,0.5)] cursor-pointer hover:scale-[1.01] active:scale-[0.99]'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-white/5'
              }`}
            >
              <Rocket className="w-5 h-5 text-white" />
              <span>INITIATE LAUNCH SEQUENCE TO {scenario.destination.toUpperCase()}</span>
              <ChevronRight className="w-5 h-5 text-white" />
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
