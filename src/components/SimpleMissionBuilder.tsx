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
  Moon,
  ChevronRight,
  ShieldCheck,
  Check,
  RotateCcw,
  Sliders,
  Users
} from 'lucide-react';

interface Props {
  state: MissionDesignState;
  setState: React.Dispatch<React.SetStateAction<MissionDesignState>>;
  budgets: EngineeringBudgets;
  onLaunch: () => void;
  isChiefEngineerMode: boolean;
  onToggleMode: () => void;
}

export const SimpleMissionBuilder: React.FC<Props> = ({
  state,
  setState,
  budgets,
  onLaunch,
  isChiefEngineerMode,
  onToggleMode
}) => {
  const scenario = NASA_SCENARIOS.find(s => s.id === state.scenarioId) || NASA_SCENARIOS[0];
  const [activeCategory, setActiveCategory] = useState<'payload' | 'power' | 'rocket' | 'engineering'>('payload');

  // Interactive Sun / Eclipse shadow simulator slider (0 = full sunlight, 1 = deep shadow)
  const [eclipseSimFraction, setEclipseSimFraction] = useState<number>(0);

  const payloadOptions = [
    {
      id: 'inst_multispectral_cam',
      name: 'HD Surface Camera',
      icon: <Camera className="w-4 h-4 text-sky-400" />,
      science: '+130 pts',
      specs: '38kg • 65W • $28M',
      desc: 'Visible & near-IR camera for sub-meter high-resolution surface mapping.'
    },
    {
      id: 'inst_subsurface_radar',
      name: 'Ice Sounding Radar',
      icon: <Radio className="w-4 h-4 text-cyan-400" />,
      science: '+220 pts',
      specs: '82kg • 240W • $68M',
      desc: 'Penetrates 3km deep to detect underground ice and liquid reservoirs.'
    },
    {
      id: 'inst_mass_spec',
      name: 'Gas & Plume Sniffer',
      icon: <Atom className="w-4 h-4 text-purple-400" />,
      science: '+190 pts',
      specs: '24kg • 42W • $35M',
      desc: 'Samples water plumes and exospheres for organic molecules and carbon.'
    },
    {
      id: 'inst_neutron_spectrometer',
      name: 'Neutron Water Hunter',
      icon: <Sparkles className="w-4 h-4 text-amber-400" />,
      science: '+140 pts',
      specs: '19kg • 32W • $22M',
      desc: 'Directly detects water-equivalent hydrogen buried beneath the surface.'
    }
  ];

  const powerOptions = [
    {
      id: 'pwr_solar_deployable',
      name: 'Dual Solar Array Wings',
      icon: <Sun className="w-4 h-4 text-yellow-400" />,
      science: 'Clean Solar',
      specs: '550W (at Earth/Moon) • $18M',
      desc: 'Generates free power from sunlight. Drops to 0W during eclipse shadow.'
    },
    {
      id: 'pwr_rtg_nextgen',
      name: 'Plutonium Nuclear RTG',
      icon: <Zap className="w-4 h-4 text-orange-400" />,
      science: '24/7 Deep Space',
      specs: '500W Constant • $95M',
      desc: 'Continuous nuclear power. Works in permanent shadow and deep space.'
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
    soundFx.playSnap();
    setState(prev => {
      const exists = prev.selectedInstrumentIds.includes(instId);
      const updated = exists
        ? prev.selectedInstrumentIds.filter(id => id !== instId)
        : [...prev.selectedInstrumentIds, instId];
      return { ...prev, selectedInstrumentIds: updated };
    });
  };

  const setPower = (id: string) => {
    soundFx.playSnap();
    setState(prev => ({ ...prev, powerSystemId: id }));
  };

  const setRocket = (id: string) => {
    soundFx.playSnap();
    setState(prev => ({ ...prev, launchVehicleId: id }));
  };

  // Real-time simulated power considering Sun / Eclipse slider
  const simulatedGenerationW = state.powerSystemId === 'pwr_rtg_nextgen'
    ? budgets.powerGeneratedSunlightW
    : budgets.powerGeneratedSunlightW * (1.0 - eclipseSimFraction);

  const simulatedPowerSurplusW = simulatedGenerationW - (eclipseSimFraction > 0.5 ? budgets.totalNightPowerConsumptionW : budgets.totalDayPowerConsumptionW);

  const isOverweight = budgets.massStatus === 'critical';
  const canLaunch = !isOverweight && budgets.powerStatus !== 'critical' && budgets.costStatus !== 'critical';

  return (
    <div className="relative w-full h-[80vh] min-h-[600px] rounded-3xl overflow-hidden bg-[#050814] border border-cyan-500/25 shadow-2xl flex flex-col justify-between">
      
      {/* 1. 3D SPACECRAFT STAGE AS FULL BACKGROUND */}
      <div className="absolute inset-0 w-full h-full z-0">
        <ThreeSpacecraftViewer 
          state={state} 
          className="relative w-full h-full bg-transparent overflow-hidden flex flex-col justify-between"
          onSelectSlot={(cat) => setActiveCategory(cat)}
          activeCategory={activeCategory}
        />
      </div>

      {/* Shading gradients for HUD contrast */}
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#050814]/95 via-[#050814]/60 to-transparent pointer-events-none z-10" />
      <div className="absolute inset-x-0 bottom-0 h-52 bg-gradient-to-t from-[#050814] via-[#050814]/90 to-transparent pointer-events-none z-10" />

      {/* 2. TOP HUD: 3 VITAL CAUSE-AND-EFFECT LIVING METERS */}
      <div className="relative z-20 px-4 sm:px-6 pt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pointer-events-none">
        
        {/* Mission Destination & Mode Badge */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <div className="flex items-center gap-2 bg-[#070e24]/90 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-cyan-500/30 text-xs font-mono text-cyan-300 shadow-md">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span>MISSION: <strong>{scenario.destination}</strong></span>
          </div>

          <button
            onClick={onToggleMode}
            className={`px-3 py-1.5 rounded-full text-xs font-mono font-bold transition flex items-center gap-1.5 border backdrop-blur-md ${
              isChiefEngineerMode
                ? 'bg-purple-900/80 border-purple-400 text-purple-200 shadow-glow-purple'
                : 'bg-[#0b1633]/80 border-cyan-400/40 text-cyan-300 hover:text-white'
            }`}
            title="Toggle Beginner Cadet vs Advanced Chief Engineer Mode"
          >
            <Sliders className="w-3.5 h-3.5 text-cyan-400" />
            <span>{isChiefEngineerMode ? 'CHIEF ENGINEER MODE' : 'CADET MODE'}</span>
          </button>
        </div>

        {/* 3 Living Vital Meters (Mass vs Rocket, Power Balance, Budget) */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-4 bg-[#070e24]/90 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 text-xs font-mono shadow-xl pointer-events-auto">
          
          {/* Science Score Gauge */}
          <div className="flex items-center gap-1.5">
            <Award className="w-4 h-4 text-cyan-400" />
            <span className="text-white font-bold">{budgets.totalScienceScore}</span>
            <span className="text-[10px] text-cyan-400 font-semibold">{budgets.totalScienceScore >= scenario.minScienceTarget ? '⭐⭐⭐' : '⭐'}</span>
          </div>

          <span className="text-slate-600">•</span>

          {/* Mass vs Rocket Silhouette */}
          <div className={`flex items-center gap-1.5 ${isOverweight ? 'text-red-400 font-bold animate-pulse' : 'text-slate-200'}`}>
            <Weight className="w-4 h-4 text-sky-400" />
            <span>{budgets.totalWetMassKg.toFixed(0)} kg</span>
            <span className="text-[10px] text-slate-400">/ {budgets.launchVehicleMaxCapacityKg} kg</span>
          </div>

          <span className="text-slate-600">•</span>

          {/* Power Balance with simulated lighting */}
          <div className={`flex items-center gap-1.5 ${simulatedPowerSurplusW < 0 ? 'text-red-400 font-bold' : 'text-yellow-400 font-bold'}`}>
            <Zap className="w-4 h-4" />
            <span>{simulatedPowerSurplusW > 0 ? `+${simulatedPowerSurplusW.toFixed(0)}W` : `${simulatedPowerSurplusW.toFixed(0)}W`}</span>
          </div>

          <span className="text-slate-600">•</span>

          {/* Budget Piggy Bank */}
          <div className={`flex items-center gap-1.5 ${budgets.costStatus === 'critical' ? 'text-red-400 font-bold' : 'text-emerald-300 font-bold'}`}>
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <span>${budgets.totalCostM.toFixed(0)}M</span>
            <span className="text-[10px] text-slate-400 font-normal">(${budgets.remainingBudgetM.toFixed(0)}M left)</span>
          </div>

        </div>

      </div>

      {/* 3. INTERACTIVE SUN / ECLIPSE TIME-SLIDER (EDUCATIONAL CAUSE & EFFECT) */}
      <div className="relative z-20 px-6 max-w-sm ml-auto pointer-events-auto">
        <div className="bg-[#070e24]/85 backdrop-blur-md p-2.5 rounded-2xl border border-white/10 shadow-lg text-xs space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-300">
            <span className="flex items-center gap-1 text-yellow-400">
              <Sun className="w-3.5 h-3.5" /> Sunlight Test
            </span>
            <span className="flex items-center gap-1 text-sky-400">
              <Moon className="w-3.5 h-3.5" /> Eclipse Shadow
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={eclipseSimFraction}
            onChange={(e) => setEclipseSimFraction(parseFloat(e.target.value))}
            className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
          />
          <div className="text-[10px] font-mono text-slate-400 text-center">
            {eclipseSimFraction === 0 ? '☀️ In Full Sunlight (+550W generated)' : 
             eclipseSimFraction < 1 ? `Entering Shadow: ${(simulatedGenerationW).toFixed(0)}W solar output` :
             state.powerSystemId === 'pwr_rtg_nextgen' ? '🌑 In Shadow: Nuclear RTG supplies 500W constantly!' :
             '🌑 Deep Shadow: Solar=0W, running on batteries!'}
          </div>
        </div>
      </div>

      {/* 4. BOTTOM FLOATING GAME DOCK (SLOT TRAY & LAUNCH BAR) */}
      <div className="relative z-20 p-4 sm:p-5 max-w-5xl mx-auto w-full space-y-3">
        
        {/* Category Tabs */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 bg-[#070e24]/95 p-1 rounded-2xl border border-white/10 backdrop-blur-md">
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

          {/* Chief Engineer Mode Advanced Options */}
          {isChiefEngineerMode && (
            <div className="hidden sm:flex items-center gap-3 text-xs font-mono text-cyan-300 bg-[#070e24]/80 px-3 py-1 rounded-xl border border-purple-500/30">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
              <span>Avionics: Redundant • Delta-V Margin: +{budgets.deltaVMarginMs.toFixed(0)} m/s</span>
            </div>
          )}
        </div>

        {/* Modules Tray */}
        <div className="bg-[#070e24]/95 border border-white/10 rounded-2xl p-2.5 backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xl">
          
          <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
            
            {/* PAYLOAD MODULES */}
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

            {/* POWER MODULES */}
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

            {/* ROCKET MODULES */}
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

          {/* Big Launch Button */}
          <button
            onClick={() => {
              if (canLaunch) {
                soundFx.playQuindarBeep('intro');
                onLaunch();
              }
            }}
            disabled={!canLaunch}
            className={`w-full sm:w-auto px-7 py-3.5 rounded-xl font-bold text-sm tracking-wide flex items-center justify-center gap-2 shrink-0 transition-all ${
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
