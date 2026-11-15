import React from 'react';
import { MissionDesignState, EngineeringBudgets } from '../types/mission';
import { 
  NASA_SCENARIOS, 
  NASA_INSTRUMENTS, 
  NASA_POWER_SYSTEMS, 
  NASA_LAUNCH_VEHICLES,
  NASA_CHASSIS
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
  AlertCircle, 
  CheckCircle2, 
  ChevronRight,
  Sun,
  ShieldCheck,
  Radio,
  Users
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
    soundFx.playClick();
    setState(prev => {
      const exists = prev.selectedInstrumentIds.includes(instId);
      const updated = exists
        ? prev.selectedInstrumentIds.filter(id => id !== instId)
        : [...prev.selectedInstrumentIds, instId];
      return { ...prev, selectedInstrumentIds: updated };
    });
  };

  const setPowerSystem = (powerId: string) => {
    soundFx.playClick();
    setState(prev => ({ ...prev, powerSystemId: powerId }));
  };

  const setLaunchVehicle = (lvId: string) => {
    soundFx.playClick();
    setState(prev => ({ ...prev, launchVehicleId: lvId }));
  };

  const setChassis = (chassisId: string) => {
    soundFx.playClick();
    setState(prev => ({ ...prev, chassisId }));
  };

  const canLaunch = budgets.massStatus !== 'critical' && 
                    budgets.powerStatus !== 'critical' && 
                    budgets.costStatus !== 'critical';

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 py-2">
      
      {/* 1. TOP 3 KEY HEALTH GAUGES (Mass, Power, Budget) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Mass Gauge */}
        <div className={`p-4 rounded-xl border flex flex-col justify-between ${
          budgets.massStatus === 'critical' ? 'bg-red-950/40 border-red-500/50' : 'bg-[#0E172F]/90 border-white/10'
        }`}>
          <div className="flex items-center justify-between text-xs text-slate-300 mb-1">
            <span className="flex items-center gap-1.5 font-medium">
              <Weight className="w-4 h-4 text-sky-400" /> Total Mass
            </span>
            <span className={budgets.massStatus === 'critical' ? 'text-red-400 font-bold' : 'text-emerald-400 font-bold'}>
              {budgets.totalWetMassKg.toFixed(0)} kg / {budgets.launchVehicleMaxCapacityKg} kg max
            </span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mt-1 mb-2">
            <div 
              className={`h-full transition-all duration-300 ${budgets.massStatus === 'critical' ? 'bg-red-500' : 'bg-sky-400'}`}
              style={{ width: `${Math.min(100, (budgets.totalWetMassKg / budgets.launchVehicleMaxCapacityKg) * 100)}%` }}
            />
          </div>
          <div className="text-[11px] text-slate-400">
            {budgets.massStatus === 'critical' ? '⚠️ Exceeds rocket capacity! Upgrade rocket.' : `✓ ${budgets.massMarginPercent.toFixed(0)}% safe weight reserve`}
          </div>
        </div>

        {/* Power Gauge */}
        <div className={`p-4 rounded-xl border flex flex-col justify-between ${
          budgets.powerStatus === 'critical' ? 'bg-red-950/40 border-red-500/50' : 'bg-[#0E172F]/90 border-white/10'
        }`}>
          <div className="flex items-center justify-between text-xs text-slate-300 mb-1">
            <span className="flex items-center gap-1.5 font-medium">
              <Zap className="w-4 h-4 text-yellow-400" /> Power Balance
            </span>
            <span className={budgets.powerStatus === 'critical' ? 'text-red-400 font-bold' : 'text-yellow-400 font-bold'}>
              {budgets.powerGeneratedSunlightW.toFixed(0)} W / {budgets.totalDayPowerConsumptionW.toFixed(0)} W used
            </span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mt-1 mb-2">
            <div 
              className={`h-full transition-all duration-300 ${budgets.powerStatus === 'critical' ? 'bg-red-500' : 'bg-yellow-400'}`}
              style={{ width: `${Math.min(100, (budgets.totalDayPowerConsumptionW / Math.max(1, budgets.powerGeneratedSunlightW)) * 100)}%` }}
            />
          </div>
          <div className="text-[11px] text-slate-400">
            {budgets.powerStatus === 'critical' ? '⚠️ Negative power! Switch to Nuclear RTG.' : `✓ +${budgets.powerMarginSunlightW.toFixed(0)} W surplus power`}
          </div>
        </div>

        {/* Budget Gauge */}
        <div className={`p-4 rounded-xl border flex flex-col justify-between ${
          budgets.costStatus === 'critical' ? 'bg-red-950/40 border-red-500/50' : 'bg-[#0E172F]/90 border-white/10'
        }`}>
          <div className="flex items-center justify-between text-xs text-slate-300 mb-1">
            <span className="flex items-center gap-1.5 font-medium">
              <DollarSign className="w-4 h-4 text-emerald-400" /> Mission Cost
            </span>
            <span className={budgets.costStatus === 'critical' ? 'text-red-400 font-bold' : 'text-emerald-400 font-bold'}>
              ${budgets.totalCostM.toFixed(0)}M / ${budgets.budgetCapM}M
            </span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mt-1 mb-2">
            <div 
              className={`h-full transition-all duration-300 ${budgets.costStatus === 'critical' ? 'bg-red-500' : 'bg-emerald-400'}`}
              style={{ width: `${Math.min(100, (budgets.totalCostM / budgets.budgetCapM) * 100)}%` }}
            />
          </div>
          <div className="text-[11px] text-slate-400">
            {budgets.costStatus === 'critical' ? '⚠️ Over budget cap! Remove items.' : `✓ $${budgets.remainingBudgetM.toFixed(0)}M remaining reserve`}
          </div>
        </div>
      </div>

      {/* 2. SPLIT WORKSPACE: 3D CAD on Left, Simple Choice Cards on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: 3D CAD Spacecraft Visualizer */}
        <div className="lg:col-span-5 space-y-3 sticky top-20">
          <ThreeSpacecraftViewer state={state} />

          {/* Mission Target Quick Box */}
          <div className="p-3.5 rounded-xl bg-[#0E172F]/80 border border-white/10 text-xs text-slate-300 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-medium">Mission Goal:</span>
              <span className="text-cyan-300 font-semibold">{scenario.destination}</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              {scenario.primaryObjective}
            </p>
            <div className="pt-2 border-t border-white/10 flex items-center justify-between">
              <span className="text-slate-400">Total Science Yield:</span>
              <span className="text-cyan-400 font-bold flex items-center gap-1">
                <Award className="w-3.5 h-3.5" />
                {budgets.totalScienceScore} points
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Clean Step-by-Step Component Pickers */}
        <div className="lg:col-span-7 space-y-6">

          {/* STEP 1: SCIENCE INSTRUMENTS */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">1</span>
                <span>Select Scientific Instruments</span>
              </h3>
              <span className="text-xs text-slate-400">
                {state.selectedInstrumentIds.length} chosen
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {NASA_INSTRUMENTS.slice(0, 6).map((inst) => {
                const isSelected = state.selectedInstrumentIds.includes(inst.id);
                return (
                  <div
                    key={inst.id}
                    onClick={() => toggleInstrument(inst.id)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start justify-between gap-3 ${
                      isSelected
                        ? 'bg-[#0B1E46] border-cyan-400 shadow-sm'
                        : 'bg-[#0E172F]/70 border-white/10 hover:border-white/25 hover:bg-[#121E3E]'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-white">{inst.name}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-2">
                        {inst.description}
                      </p>
                      <div className="flex items-center gap-3 text-[10px] text-slate-300 pt-1 font-mono">
                        <span className="text-cyan-300">+{inst.scienceValue} pts</span>
                        <span>{inst.massKg} kg</span>
                        <span>{inst.powerW} W</span>
                        <span className="text-amber-300">${inst.costM}M</span>
                      </div>
                    </div>

                    <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 ${
                      isSelected ? 'bg-cyan-500 text-space-950 font-bold' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {isSelected ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Plus className="w-3.5 h-3.5" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* STEP 2: POWER SOURCE */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">2</span>
                <span>Choose Power Source</span>
              </h3>
              <span className="text-xs text-yellow-300">
                ☀️ Solar at Target: {scenario.environmentHazards.solarFluxPercent}%
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {[
                {
                  id: 'pwr_solar_deployable',
                  name: 'Deployable Solar Arrays',
                  desc: 'High efficiency near Earth/Moon. Loses power in deep space.',
                  power: '550 W (at Earth)',
                  cost: '$18M',
                  recommended: scenario.distanceAU <= 1.5
                },
                {
                  id: 'pwr_solar_ultraflex',
                  name: 'MegaFlex Circular Wings',
                  desc: 'Massive surface area for deep space solar generation.',
                  power: '1,600 W',
                  cost: '$44M',
                  recommended: false
                },
                {
                  id: 'pwr_rtg_nextgen',
                  name: 'Nuclear RTG (Plutonium)',
                  desc: 'Continuous power anywhere, even in pitch-black Jupiter orbits.',
                  power: '500 W (Constant)',
                  cost: '$95M',
                  recommended: scenario.distanceAU > 2.0
                }
              ].map((pwr) => {
                const isSelected = state.powerSystemId === pwr.id;
                return (
                  <div
                    key={pwr.id}
                    onClick={() => setPowerSystem(pwr.id)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-[#0B1E46] border-cyan-400 shadow-sm'
                        : 'bg-[#0E172F]/70 border-white/10 hover:border-white/25 hover:bg-[#121E3E]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-white">{pwr.name}</span>
                        {isSelected && <Check className="w-4 h-4 text-cyan-400" />}
                      </div>
                      <p className="text-[11px] text-slate-400 mb-2 leading-snug">
                        {pwr.desc}
                      </p>
                    </div>
                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-300 pt-2 border-t border-white/10">
                      <span className="text-yellow-400 font-semibold">{pwr.power}</span>
                      <span className="text-amber-400">{pwr.cost}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* STEP 3: ROCKET BOOSTER */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">3</span>
                <span>Select Launch Rocket</span>
              </h3>
              <span className="text-xs text-slate-400">
                Payload must fit rocket lift limit
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {[
                {
                  id: 'lv_electron',
                  name: 'Rocket Lab Electron',
                  desc: 'Lightweight rocket for small CubeSats.',
                  cost: '$8.5M',
                  capacity: '220 kg'
                },
                {
                  id: 'lv_falcon9',
                  name: 'SpaceX Falcon 9',
                  desc: 'Workhorse medium launcher for Earth, Moon, and Mars.',
                  cost: '$67M',
                  capacity: '4,000 kg (TLI)'
                },
                {
                  id: 'lv_falcon_heavy',
                  name: 'SpaceX Falcon Heavy',
                  desc: 'Heavy lift rocket for deep space probes and outer planets.',
                  cost: '$130M',
                  capacity: '18,000 kg'
                }
              ].map((lv) => {
                const isSelected = state.launchVehicleId === lv.id;
                return (
                  <div
                    key={lv.id}
                    onClick={() => setLaunchVehicle(lv.id)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-[#0B1E46] border-cyan-400 shadow-sm'
                        : 'bg-[#0E172F]/70 border-white/10 hover:border-white/25 hover:bg-[#121E3E]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-white">{lv.name}</span>
                        {isSelected && <Check className="w-4 h-4 text-cyan-400" />}
                      </div>
                      <p className="text-[11px] text-slate-400 mb-2 leading-snug">
                        {lv.desc}
                      </p>
                    </div>
                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-300 pt-2 border-t border-white/10">
                      <span className="text-sky-300 font-semibold">{lv.capacity}</span>
                      <span className="text-amber-400">{lv.cost}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* STEP 4: TEAM READINESS CHECKLIST & LAUNCH BUTTON */}
          <div className="p-4 rounded-2xl bg-[#0E172F] border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Pre-Flight Systems Check
              </span>
              <span className={`text-xs font-bold ${canLaunch ? 'text-emerald-400' : 'text-red-400'}`}>
                {canLaunch ? 'ALL SYSTEMS GO' : 'SYSTEM CHECKS FAILED'}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className={`p-2 rounded-lg border flex items-center gap-1.5 ${
                budgets.massStatus !== 'critical' ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300' : 'bg-red-950/30 border-red-500/30 text-red-300'
              }`}>
                {budgets.massStatus !== 'critical' ? '✓ Mass Safe' : '✗ Overweight'}
              </div>

              <div className={`p-2 rounded-lg border flex items-center gap-1.5 ${
                budgets.powerStatus !== 'critical' ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300' : 'bg-red-950/30 border-red-500/30 text-red-300'
              }`}>
                {budgets.powerStatus !== 'critical' ? '✓ Power Positive' : '✗ Negative Power'}
              </div>

              <div className={`p-2 rounded-lg border flex items-center gap-1.5 ${
                budgets.costStatus !== 'critical' ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300' : 'bg-red-950/30 border-red-500/30 text-red-300'
              }`}>
                {budgets.costStatus !== 'critical' ? '✓ In Budget' : '✗ Over Budget'}
              </div>
            </div>

            {/* Big Launch Button */}
            <button
              onClick={() => {
                if (canLaunch) {
                  soundFx.playQuindarBeep('intro');
                  onLaunch();
                }
              }}
              disabled={!canLaunch}
              className={`w-full py-4 rounded-xl font-bold text-base flex items-center justify-center gap-2.5 transition-all ${
                canLaunch
                  ? 'btn-nasa-accent shadow-lg cursor-pointer'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-white/5'
              }`}
            >
              <Rocket className="w-5 h-5" />
              <span>LAUNCH MISSION TO {scenario.destination.toUpperCase()}</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
