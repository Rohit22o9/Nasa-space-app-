import React from 'react';
import { MissionDesignState, EngineeringBudgets } from '../types/mission';
import { NASA_SCENARIOS } from '../data/nasaData';
import { soundFx } from '../utils/audio';
import { ThreeSpacecraftViewer } from './ThreeSpacecraftViewer';
import { 
  Check, 
  Rocket, 
  Zap, 
  Weight, 
  DollarSign, 
  Award, 
  Sparkles,
  Camera,
  Radio,
  Atom,
  Sun,
  ShieldCheck,
  ChevronRight
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

  // Simplified Game Science Instruments Loadout
  const gameInstruments = [
    {
      id: 'inst_multispectral_cam',
      name: 'High-Res Optical Camera',
      type: 'Surface Mapping',
      icon: <Camera className="w-5 h-5 text-sky-400" />,
      sciencePts: 130,
      massKg: 38,
      powerW: 65,
      costM: 28,
      badge: 'Visual HD',
      desc: 'Takes high-definition images of surface craters and landing sites.'
    },
    {
      id: 'inst_subsurface_radar',
      name: 'Ice-Sounding Radar',
      type: 'Subsurface Scan',
      icon: <Radio className="w-5 h-5 text-cyan-400" />,
      sciencePts: 220,
      massKg: 82,
      powerW: 240,
      costM: 68,
      badge: 'Deep Scan',
      desc: 'Penetrates up to 3 km through ice to detect underground water layers.'
    },
    {
      id: 'inst_mass_spec',
      name: 'Gas & Plume Sniffer',
      type: 'Organic Analysis',
      icon: <Atom className="w-5 h-5 text-purple-400" />,
      sciencePts: 190,
      massKg: 24,
      powerW: 42,
      costM: 35,
      badge: 'Bio-Trace',
      desc: 'Samples water plumes and exospheres for organic molecules and carbon.'
    },
    {
      id: 'inst_neutron_spectrometer',
      name: 'Neutron Water Detector',
      type: 'Hydrogen Sensor',
      icon: <Sparkles className="w-5 h-5 text-amber-400" />,
      sciencePts: 140,
      massKg: 19,
      powerW: 32,
      costM: 22,
      badge: 'Ice Hunter',
      desc: 'Directly detects water-equivalent hydrogen buried beneath the surface.'
    }
  ];

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

  const canLaunch = budgets.massStatus !== 'critical' && 
                    budgets.powerStatus !== 'critical' && 
                    budgets.costStatus !== 'critical';

  return (
    <div className="w-full max-w-6xl mx-auto space-y-5 py-2">
      
      {/* 1. TOP GAME HUD METERS (Science, Mass, Power, Budget) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        
        {/* Science Score Meter */}
        <div className="p-3.5 rounded-2xl bg-[#0E172F]/90 border border-cyan-500/30 shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-300 mb-1">
            <span className="flex items-center gap-1.5 font-bold text-cyan-400">
              <Award className="w-4 h-4 text-cyan-400" /> SCIENCE YIELD
            </span>
            <span className="font-mono font-bold text-white">
              {budgets.totalScienceScore} pts
            </span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mt-2">
            <div 
              className="h-full bg-gradient-to-r from-cyan-500 to-sky-400 transition-all duration-300"
              style={{ width: `${Math.min(100, (budgets.totalScienceScore / scenario.minScienceTarget) * 100)}%` }}
            />
          </div>
          <div className="text-[10px] text-slate-400 mt-1.5 flex justify-between">
            <span>Target: {scenario.minScienceTarget} pts</span>
            <span className="text-cyan-300 font-semibold">{budgets.totalScienceScore >= scenario.minScienceTarget ? '⭐⭐⭐ 3-STAR' : '⭐ 1-STAR'}</span>
          </div>
        </div>

        {/* Mass Balance Meter */}
        <div className={`p-3.5 rounded-2xl border transition-all ${
          budgets.massStatus === 'critical' ? 'bg-red-950/40 border-red-500/50 shadow-glow-red' : 'bg-[#0E172F]/90 border-white/10'
        }`}>
          <div className="flex items-center justify-between text-xs text-slate-300 mb-1">
            <span className="flex items-center gap-1.5 font-bold text-sky-400">
              <Weight className="w-4 h-4 text-sky-400" /> SHIP MASS
            </span>
            <span className={`font-mono font-bold ${budgets.massStatus === 'critical' ? 'text-red-400' : 'text-white'}`}>
              {budgets.totalWetMassKg.toFixed(0)} kg
            </span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mt-2">
            <div 
              className={`h-full transition-all duration-300 ${budgets.massStatus === 'critical' ? 'bg-red-500' : 'bg-sky-400'}`}
              style={{ width: `${Math.min(100, (budgets.totalWetMassKg / budgets.launchVehicleMaxCapacityKg) * 100)}%` }}
            />
          </div>
          <div className="text-[10px] text-slate-400 mt-1.5">
            {budgets.massStatus === 'critical' ? '⚠️ Overweight! Upgrade rocket.' : `✓ ${budgets.massMarginPercent.toFixed(0)}% safe weight buffer`}
          </div>
        </div>

        {/* Power Balance Meter */}
        <div className={`p-3.5 rounded-2xl border transition-all ${
          budgets.powerStatus === 'critical' ? 'bg-red-950/40 border-red-500/50 shadow-glow-red' : 'bg-[#0E172F]/90 border-white/10'
        }`}>
          <div className="flex items-center justify-between text-xs text-slate-300 mb-1">
            <span className="flex items-center gap-1.5 font-bold text-yellow-400">
              <Zap className="w-4 h-4 text-yellow-400" /> POWER SURPLUS
            </span>
            <span className={`font-mono font-bold ${budgets.powerStatus === 'critical' ? 'text-red-400' : 'text-yellow-400'}`}>
              {budgets.powerMarginSunlightW > 0 ? `+${budgets.powerMarginSunlightW.toFixed(0)} W` : `${budgets.powerMarginSunlightW.toFixed(0)} W`}
            </span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mt-2">
            <div 
              className={`h-full transition-all duration-300 ${budgets.powerStatus === 'critical' ? 'bg-red-500' : 'bg-yellow-400'}`}
              style={{ width: `${Math.min(100, (budgets.totalDayPowerConsumptionW / Math.max(1, budgets.powerGeneratedSunlightW)) * 100)}%` }}
            />
          </div>
          <div className="text-[10px] text-slate-400 mt-1.5">
            {budgets.powerStatus === 'critical' ? '⚠️ Power Brownout! Switch to RTG.' : `✓ Generating ${budgets.powerGeneratedSunlightW.toFixed(0)} W`}
          </div>
        </div>

        {/* Mission Budget Meter */}
        <div className={`p-3.5 rounded-2xl border transition-all ${
          budgets.costStatus === 'critical' ? 'bg-red-950/40 border-red-500/50 shadow-glow-red' : 'bg-[#0E172F]/90 border-white/10'
        }`}>
          <div className="flex items-center justify-between text-xs text-slate-300 mb-1">
            <span className="flex items-center gap-1.5 font-bold text-emerald-400">
              <DollarSign className="w-4 h-4 text-emerald-400" /> BUDGET
            </span>
            <span className={`font-mono font-bold ${budgets.costStatus === 'critical' ? 'text-red-400' : 'text-emerald-400'}`}>
              ${budgets.totalCostM.toFixed(0)}M / ${budgets.budgetCapM}M
            </span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mt-2">
            <div 
              className={`h-full transition-all duration-300 ${budgets.costStatus === 'critical' ? 'bg-red-500' : 'bg-emerald-400'}`}
              style={{ width: `${Math.min(100, (budgets.totalCostM / budgets.budgetCapM) * 100)}%` }}
            />
          </div>
          <div className="text-[10px] text-slate-400 mt-1.5">
            {budgets.costStatus === 'critical' ? '⚠️ Over Budget! Trim payload.' : `✓ $${budgets.remainingBudgetM.toFixed(0)}M contingency reserve`}
          </div>
        </div>

      </div>

      {/* 2. MAIN HANGAR: 3D SPACECRAFT (LEFT) + LOADOUT SLOTS (RIGHT) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* Left Column: 3D Spacecraft Bay */}
        <div className="lg:col-span-5 space-y-3 sticky top-20">
          <ThreeSpacecraftViewer state={state} />

          {/* Mission Target Badge */}
          <div className="p-3.5 rounded-xl bg-[#0E172F]/90 border border-white/10 flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-mono">MISSION TARGET</span>
              <span className="font-bold text-white">{scenario.destination}</span>
            </div>
            <div className="text-right">
              <span className="text-slate-400 block text-[10px] uppercase font-mono">PRIMARY GOAL</span>
              <span className="text-cyan-300 font-medium text-[11px] max-w-[200px] truncate block">
                {scenario.primaryObjective}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Game Equipment Slots */}
        <div className="lg:col-span-7 space-y-5">
          
          {/* SLOT 1: SCIENCE INSTRUMENTS (GRID OF CARDS) */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                <span>SLOT 1 • SCIENCE PAYLOAD INSTRUMENTS</span>
              </h3>
              <span className="text-xs font-mono text-slate-400">
                {state.selectedInstrumentIds.length} Mounted
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {gameInstruments.map((inst) => {
                const isSelected = state.selectedInstrumentIds.includes(inst.id);
                return (
                  <div
                    key={inst.id}
                    onClick={() => toggleInstrument(inst.id)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-[#0B2559] border-cyan-400 shadow-[0_0_15px_rgba(0,229,255,0.25)] ring-1 ring-cyan-400'
                        : 'bg-[#0E172F]/80 border-white/10 hover:border-white/30 hover:bg-[#121E3E]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-2">
                          {inst.icon}
                          <span className="text-xs font-bold text-white">{inst.name}</span>
                        </div>
                        <span className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 ${
                          isSelected ? 'bg-cyan-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400'
                        }`}>
                          {isSelected ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : '+'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300 leading-snug mb-2">
                        {inst.desc}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-[10px] font-mono pt-2 border-t border-white/10">
                      <span className="text-cyan-300 font-bold">+{inst.sciencePts} Science</span>
                      <span className="text-slate-400">{inst.massKg} kg • {inst.powerW} W</span>
                      <span className="text-amber-300 font-semibold">${inst.costM}M</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SLOT 2: POWER SOURCE */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-yellow-400 flex items-center gap-2">
                <span>SLOT 2 • POWER ARCHITECTURE</span>
              </h3>
              <span className="text-xs font-mono text-yellow-300">
                ☀️ Target Solar Flux: {scenario.environmentHazards.solarFluxPercent}%
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {[
                {
                  id: 'pwr_solar_deployable',
                  name: 'Dual Solar Array Wings',
                  desc: 'Lightweight & clean. High power near Moon/Earth, but zero power during eclipse shadow.',
                  badge: '☀️ Solar Power',
                  stat: '550 W (at 1 AU)',
                  cost: '$18M',
                },
                {
                  id: 'pwr_rtg_nextgen',
                  name: 'Plutonium Nuclear RTG',
                  desc: 'Heavy radioisotope nuclear battery. Generates continuous power 24/7 anywhere in deep space.',
                  badge: '☢️ Nuclear RTG',
                  stat: '500 W Constant',
                  cost: '$95M',
                }
              ].map((pwr) => {
                const isSelected = state.powerSystemId === pwr.id;
                return (
                  <div
                    key={pwr.id}
                    onClick={() => setPowerSystem(pwr.id)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-[#0B2559] border-cyan-400 shadow-[0_0_15px_rgba(0,229,255,0.25)] ring-1 ring-cyan-400'
                        : 'bg-[#0E172F]/80 border-white/10 hover:border-white/30 hover:bg-[#121E3E]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-white">{pwr.name}</span>
                        {isSelected && <Check className="w-4 h-4 text-cyan-400" />}
                      </div>
                      <p className="text-[11px] text-slate-300 leading-snug mb-2">
                        {pwr.desc}
                      </p>
                    </div>
                    <div className="flex items-center justify-between text-[10px] font-mono pt-2 border-t border-white/10">
                      <span className="text-yellow-400 font-bold">{pwr.stat}</span>
                      <span className="text-amber-300 font-semibold">{pwr.cost}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SLOT 3: LAUNCH ROCKET BOOSTER */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-purple-400 flex items-center gap-2">
                <span>SLOT 3 • LAUNCH VEHICLE BOOSTER</span>
              </h3>
              <span className="text-xs font-mono text-slate-400">
                Lift capacity must exceed wet mass
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {[
                {
                  id: 'lv_falcon9',
                  name: 'SpaceX Falcon 9',
                  desc: 'Reliable medium rocket. 4,000 kg capacity to Moon / 2,800 kg to Mars.',
                  capacity: '4,000 kg Lift',
                  cost: '$67M'
                },
                {
                  id: 'lv_falcon_heavy',
                  name: 'SpaceX Falcon Heavy',
                  desc: 'Triple-core heavy booster. 18,000 kg capacity for outer planet flagship probes.',
                  capacity: '18,000 kg Heavy Lift',
                  cost: '$130M'
                }
              ].map((lv) => {
                const isSelected = state.launchVehicleId === lv.id;
                return (
                  <div
                    key={lv.id}
                    onClick={() => setLaunchVehicle(lv.id)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-[#0B2559] border-cyan-400 shadow-[0_0_15px_rgba(0,229,255,0.25)] ring-1 ring-cyan-400'
                        : 'bg-[#0E172F]/80 border-white/10 hover:border-white/30 hover:bg-[#121E3E]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-white">{lv.name}</span>
                        {isSelected && <Check className="w-4 h-4 text-cyan-400" />}
                      </div>
                      <p className="text-[11px] text-slate-300 leading-snug mb-2">
                        {lv.desc}
                      </p>
                    </div>
                    <div className="flex items-center justify-between text-[10px] font-mono pt-2 border-t border-white/10">
                      <span className="text-sky-300 font-bold">{lv.capacity}</span>
                      <span className="text-amber-300 font-semibold">${lv.cost}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3. PRE-FLIGHT LAUNCH PAD BAR */}
          <div className="p-4 rounded-2xl bg-[#0B1E46]/90 border border-cyan-400/30 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-cyan-300 uppercase flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                PRE-FLIGHT SYSTEMS CHECK
              </span>
              <span className={`text-xs font-mono font-bold ${canLaunch ? 'text-emerald-400' : 'text-red-400'}`}>
                {canLaunch ? 'ALL SYSTEMS GO FOR LAUNCH' : 'ENGINEERING WARNINGS DETECTED'}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-xs font-mono">
              <div className={`p-2 rounded-lg border text-center ${
                budgets.massStatus !== 'critical' ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300' : 'bg-red-950/40 border-red-500/40 text-red-300'
              }`}>
                {budgets.massStatus !== 'critical' ? '✓ Mass Margin OK' : '✗ Overweight'}
              </div>

              <div className={`p-2 rounded-lg border text-center ${
                budgets.powerStatus !== 'critical' ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300' : 'bg-red-950/40 border-red-500/40 text-red-300'
              }`}>
                {budgets.powerStatus !== 'critical' ? '✓ Power Positive' : '✗ Power Deficit'}
              </div>

              <div className={`p-2 rounded-lg border text-center ${
                budgets.costStatus !== 'critical' ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300' : 'bg-red-950/40 border-red-500/40 text-red-300'
              }`}>
                {budgets.costStatus !== 'critical' ? '✓ In Budget' : '✗ Over Budget'}
              </div>
            </div>

            {/* Launch Button */}
            <button
              onClick={() => {
                if (canLaunch) {
                  soundFx.playQuindarBeep('intro');
                  onLaunch();
                }
              }}
              disabled={!canLaunch}
              className={`w-full py-4 rounded-xl font-bold text-base flex items-center justify-center gap-2.5 transition-all shadow-xl ${
                canLaunch
                  ? 'btn-nasa-accent cursor-pointer hover:scale-[1.01]'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-white/5'
              }`}
            >
              <Rocket className="w-5 h-5" />
              <span>READY TO LAUNCH MISSION</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
