import React, { useState } from 'react';
import { MissionDesignState, EngineeringBudgets } from '../types/mission';
import { NASA_SCENARIOS } from '../data/nasaData';
import { soundFx } from '../utils/audio';
import { ThreeSpacecraftViewer } from './ThreeSpacecraftViewer';
import { 
  Rocket, 
  Zap, 
  Weight, 
  DollarSign, 
  Award, 
  Camera, 
  Radio, 
  Atom, 
  Sparkles, 
  Sun, 
  Layers, 
  ChevronRight,
  ShieldCheck,
  Check
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
}) => {
  const scenario = NASA_SCENARIOS.find(s => s.id === state.scenarioId) || NASA_SCENARIOS[0];
  const [activeCategory, setActiveCategory] = useState<'payload' | 'power' | 'rocket'>('payload');

  const payloadOptions = [
    {
      id: 'inst_multispectral_cam',
      name: 'HD Surface Camera',
      icon: <Camera className="w-4 h-4 text-sky-400" />,
      science: '+130 pts',
      specs: '38kg • 65W • $28M',
      desc: 'Visible & near-IR camera for high-resolution surface mapping.'
    },
    {
      id: 'inst_subsurface_radar',
      name: 'Ice Sounding Radar',
      icon: <Radio className="w-4 h-4 text-cyan-400" />,
      science: '+220 pts',
      specs: '82kg • 240W • $68M',
      desc: 'Penetrates 3km deep to detect underground ice and liquid layers.'
    },
    {
      id: 'inst_mass_spec',
      name: 'Gas & Plume Sniffer',
      icon: <Atom className="w-4 h-4 text-purple-400" />,
      science: '+190 pts',
      specs: '24kg • 42W • $35M',
      desc: 'Measures organic molecules, water vapor, and prebiotic traces.'
    },
    {
      id: 'inst_neutron_spectrometer',
      name: 'Neutron Water Hunter',
      icon: <Sparkles className="w-4 h-4 text-amber-400" />,
      science: '+140 pts',
      specs: '19kg • 32W • $22M',
      desc: 'Directly detects water-equivalent hydrogen buried in regolith.'
    }
  ];

  const powerOptions = [
    {
      id: 'pwr_solar_deployable',
      name: 'Dual Solar Array Wings',
      icon: <Sun className="w-4 h-4 text-yellow-400" />,
      science: 'Clean Solar',
      specs: '550W (at Earth/Moon) • $18M',
      desc: 'Generates free power from sunlight. Loses output in eclipse shadow.'
    },
    {
      id: 'pwr_rtg_nextgen',
      name: 'Plutonium Nuclear RTG',
      icon: <Zap className="w-4 h-4 text-orange-400" />,
      science: '24/7 Deep Space',
      specs: '500W Constant • $95M',
      desc: 'Continuous nuclear power. Works in permanent darkness and deep space.'
    }
  ];

  const rocketOptions = [
    {
      id: 'lv_falcon9',
      name: 'SpaceX Falcon 9',
      icon: <Rocket className="w-4 h-4 text-blue-400" />,
      science: 'Medium Lift',
      specs: '4,000 kg capacity • $67M',
      desc: 'Workhorse launcher for Earth orbit, Lunar missions, and Mars.'
    },
    {
      id: 'lv_falcon_heavy',
      name: 'SpaceX Falcon Heavy',
      icon: <Rocket className="w-4 h-4 text-purple-400" />,
      science: 'Heavy Lift',
      specs: '18,000 kg capacity • $130M',
      desc: 'Triple-core heavy booster for outer planet probes and massive payloads.'
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

  const setPower = (id: string) => {
    soundFx.playClick();
    setState(prev => ({ ...prev, powerSystemId: id }));
  };

  const setRocket = (id: string) => {
    soundFx.playClick();
    setState(prev => ({ ...prev, launchVehicleId: id }));
  };

  const canLaunch = budgets.massStatus !== 'critical' && 
                    budgets.powerStatus !== 'critical' && 
                    budgets.costStatus !== 'critical';

  return (
    <div className="relative w-full h-[78vh] min-h-[560px] rounded-3xl overflow-hidden bg-[#070B19] border border-cyan-500/20 shadow-2xl flex flex-col justify-between">
      
      {/* 1. 3D SPACECRAFT STAGE (FULL BACKGROUND HERO) */}
      <div className="absolute inset-0 w-full h-full z-0">
        <ThreeSpacecraftViewer state={state} />
      </div>

      {/* Subtle Dark Vignette at Top and Bottom for HUD legibility */}
      <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-[#070B19]/90 via-[#070B19]/50 to-transparent pointer-events-none z-10" />
      <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-[#070B19] via-[#070B19]/80 to-transparent pointer-events-none z-10" />

      {/* 2. FLOATING TOP HUD (SLEEK HORIZONTAL RIBBON) */}
      <div className="relative z-20 px-4 sm:px-6 pt-4 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        
        {/* Mission Destination Pill */}
        <div className="flex items-center gap-2.5 bg-[#070B19]/85 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-cyan-500/30 text-xs font-mono text-cyan-300 shadow-md pointer-events-auto">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span>DESTINATION: <strong>{scenario.destination}</strong></span>
        </div>

        {/* Live RPG-style Stats Ribbon */}
        <div className="flex items-center gap-2 sm:gap-4 bg-[#070B19]/85 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10 text-xs font-mono shadow-lg pointer-events-auto">
          {/* Science Score */}
          <div className="flex items-center gap-1.5 text-cyan-400">
            <Award className="w-3.5 h-3.5" />
            <span className="text-white font-bold">{budgets.totalScienceScore}</span>
            <span className="text-[10px] text-slate-400">pts</span>
          </div>

          <span className="text-slate-600">•</span>

          {/* Mass */}
          <div className="flex items-center gap-1.5">
            <Weight className="w-3.5 h-3.5 text-sky-400" />
            <span className={budgets.massStatus === 'critical' ? 'text-red-400 font-bold' : 'text-slate-200'}>
              {budgets.totalWetMassKg.toFixed(0)} kg
            </span>
          </div>

          <span className="text-slate-600">•</span>

          {/* Power */}
          <div className="flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-yellow-400" />
            <span className={budgets.powerStatus === 'critical' ? 'text-red-400 font-bold' : 'text-yellow-400 font-bold'}>
              {budgets.powerMarginSunlightW > 0 ? `+${budgets.powerMarginSunlightW.toFixed(0)}W` : `${budgets.powerMarginSunlightW.toFixed(0)}W`}
            </span>
          </div>

          <span className="text-slate-600">•</span>

          {/* Budget */}
          <div className="flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
            <span className={budgets.costStatus === 'critical' ? 'text-red-400 font-bold' : 'text-emerald-300 font-bold'}>
              ${budgets.totalCostM.toFixed(0)}M
            </span>
          </div>
        </div>

      </div>

      {/* 3. FLOATING BOTTOM CUSTOMIZATION DOCK (GAME LOADOUT TRAY) */}
      <div className="relative z-20 p-4 sm:p-5 max-w-5xl mx-auto w-full space-y-3">
        
        {/* Category Pills (Tabs) */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 bg-[#070B19]/90 p-1 rounded-2xl border border-white/10 backdrop-blur-md">
            {[
              { id: 'payload' as const, label: '🔬 Science Payload', count: `${state.selectedInstrumentIds.length}/4` },
              { id: 'power' as const, label: '⚡ Power Core', count: state.powerSystemId === 'pwr_rtg_nextgen' ? 'RTG' : 'Solar' },
              { id: 'rocket' as const, label: '🚀 Launch Rocket', count: state.launchVehicleId === 'lv_falcon_heavy' ? 'Heavy' : 'Falcon 9' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  soundFx.playClick();
                  setActiveCategory(tab.id);
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition flex items-center gap-2 ${
                  activeCategory === tab.id
                    ? 'bg-blue-600 text-white font-bold shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-md ${
                  activeCategory === tab.id ? 'bg-black/20 text-sky-200' : 'bg-white/10 text-slate-400'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Quick Instructions badge */}
          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            <span>Click modules to mount onto spacecraft</span>
          </div>
        </div>

        {/* Module Chips Tray (Active Category Items) */}
        <div className="bg-[#070B19]/90 border border-white/10 rounded-2xl p-2.5 backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xl">
          
          <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
            
            {/* PAYLOAD CATEGORY */}
            {activeCategory === 'payload' && payloadOptions.map(item => {
              const isSelected = state.selectedInstrumentIds.includes(item.id);
              return (
                <div
                  key={item.id}
                  onClick={() => toggleInstrument(item.id)}
                  className={`p-2.5 rounded-xl cursor-pointer transition-all flex items-center justify-between gap-2 border ${
                    isSelected
                      ? 'bg-blue-600/30 border-cyan-400 shadow-[0_0_12px_rgba(0,229,255,0.3)]'
                      : 'bg-white/5 border-white/5 hover:border-white/20 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="p-1.5 rounded-lg bg-black/40 shrink-0">
                      {item.icon}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-white truncate">{item.name}</div>
                      <div className="text-[10px] text-cyan-300 font-mono">{item.science} • {item.specs.split('•')[0]}</div>
                    </div>
                  </div>
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 text-[10px] ${
                    isSelected ? 'bg-cyan-400 text-black font-bold' : 'border border-slate-600'
                  }`}>
                    {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                </div>
              );
            })}

            {/* POWER CATEGORY */}
            {activeCategory === 'power' && powerOptions.map(item => {
              const isSelected = state.powerSystemId === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => setPower(item.id)}
                  className={`p-2.5 rounded-xl cursor-pointer transition-all flex items-center justify-between gap-2 border col-span-2 ${
                    isSelected
                      ? 'bg-yellow-600/20 border-yellow-400 shadow-[0_0_12px_rgba(250,204,21,0.25)]'
                      : 'bg-white/5 border-white/5 hover:border-white/20 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="p-2 rounded-lg bg-black/40 shrink-0">
                      {item.icon}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-white truncate">{item.name}</div>
                      <div className="text-[10px] text-yellow-300 font-mono">{item.specs}</div>
                    </div>
                  </div>
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 text-[10px] ${
                    isSelected ? 'bg-yellow-400 text-black font-bold' : 'border border-slate-600'
                  }`}>
                    {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                </div>
              );
            })}

            {/* ROCKET CATEGORY */}
            {activeCategory === 'rocket' && rocketOptions.map(item => {
              const isSelected = state.launchVehicleId === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => setRocket(item.id)}
                  className={`p-2.5 rounded-xl cursor-pointer transition-all flex items-center justify-between gap-2 border col-span-2 ${
                    isSelected
                      ? 'bg-purple-600/20 border-purple-400 shadow-[0_0_12px_rgba(192,132,252,0.25)]'
                      : 'bg-white/5 border-white/5 hover:border-white/20 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="p-2 rounded-lg bg-black/40 shrink-0">
                      {item.icon}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-white truncate">{item.name}</div>
                      <div className="text-[10px] text-purple-300 font-mono">{item.specs}</div>
                    </div>
                  </div>
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 text-[10px] ${
                    isSelected ? 'bg-purple-400 text-black font-bold' : 'border border-slate-600'
                  }`}>
                    {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                </div>
              );
            })}

          </div>

          {/* Big Glowing Launch Button on Right */}
          <button
            onClick={() => {
              if (canLaunch) {
                soundFx.playQuindarBeep('intro');
                onLaunch();
              }
            }}
            disabled={!canLaunch}
            className={`w-full sm:w-auto px-6 py-3.5 rounded-xl font-bold text-sm tracking-wide flex items-center justify-center gap-2 shrink-0 transition-all ${
              canLaunch
                ? 'btn-nasa-accent shadow-lg hover:scale-105 active:scale-95 cursor-pointer animate-pulse'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-white/5'
            }`}
          >
            <Rocket className="w-4 h-4" />
            <span>LAUNCH MISSION</span>
            <ChevronRight className="w-4 h-4" />
          </button>

        </div>

      </div>

    </div>
  );
};
