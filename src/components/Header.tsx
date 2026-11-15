import React from 'react';
import { CMLStage, MissionDesignState } from '../types/mission';
import { NASA_SCENARIOS } from '../data/nasaData';
import { soundFx } from '../utils/audio';
import { 
  Rocket, 
  Volume2, 
  VolumeX, 
  HelpCircle, 
  CheckCircle2, 
  Users, 
  User, 
  RotateCcw,
  Sparkles
} from 'lucide-react';

interface Props {
  state: MissionDesignState;
  setState: React.Dispatch<React.SetStateAction<MissionDesignState>>;
  onOpenTutorial: () => void;
  onResetScenario: () => void;
  audioEnabled: boolean;
  setAudioEnabled: (val: boolean) => void;
}

export const Header: React.FC<Props> = ({
  state,
  setState,
  onOpenTutorial,
  onResetScenario,
  audioEnabled,
  setAudioEnabled
}) => {
  const scenario = NASA_SCENARIOS.find(s => s.id === state.scenarioId) || NASA_SCENARIOS[0];

  const handleCMLClick = (stage: CMLStage) => {
    soundFx.playClick();
    setState(prev => ({ ...prev, cmlStage: stage }));
  };

  const toggleSound = () => {
    const next = !audioEnabled;
    soundFx.enabled = next;
    setAudioEnabled(next);
    if (next) soundFx.playQuindarBeep('intro');
  };

  const cmlLabels = [
    { num: 1, title: 'CML 1: Formulation', desc: 'Objectives & Destination' },
    { num: 2, title: 'CML 2: Architecture', desc: 'Payload & Instruments' },
    { num: 3, title: 'CML 3: Trade Studies', desc: 'Bus, Launch, Comms' },
    { num: 4, title: 'CML 4: Point Design', desc: 'Readiness Review & Sim' },
  ];

  return (
    <header className="w-full bg-space-950/90 backdrop-blur-xl border-b border-cyan-500/20 sticky top-0 z-40 px-4 py-3">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-4">
        
        {/* Left: NASA Branding & Mission Title */}
        <div className="flex items-center gap-3.5 w-full lg:w-auto justify-between lg:justify-start">
          <div className="flex items-center gap-2.5">
            {/* NASA Meatball Style Badge */}
            <div className="w-10 h-10 rounded-full bg-nasa-blue flex items-center justify-center border border-cyan-400 shadow-glow-blue relative overflow-hidden">
              <span className="text-[11px] font-black tracking-tighter text-white font-mono">NASA</span>
              <div className="absolute inset-0 border-t-2 border-nasa-red -rotate-45 pointer-events-none" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-bold text-base md:text-lg text-white tracking-wide">
                  AEROQUEST
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  Mission Design Lab
                </span>
              </div>
              <div className="text-xs text-slate-400 flex items-center gap-1.5 font-mono">
                <span>{scenario.title}</span>
                <span className="text-slate-600">•</span>
                <span className="text-cyan-400">{scenario.destination}</span>
              </div>
            </div>
          </div>

          {/* Quick Action Buttons for Mobile */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              onClick={toggleSound}
              className="p-2 rounded-lg bg-space-850 border border-white/10 text-slate-300 hover:text-cyan-400"
              title="Toggle Audio"
            >
              {audioEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
            </button>
            <button
              onClick={onOpenTutorial}
              className="p-2 rounded-lg bg-space-850 border border-white/10 text-slate-300 hover:text-cyan-400"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Center: NASA JPL Concept Maturity Level (CML 1-4) Pipeline */}
        <div className="flex items-center gap-1 md:gap-2 w-full lg:w-auto justify-center overflow-x-auto py-1">
          {cmlLabels.map((cml) => {
            const isCurrent = state.cmlStage === cml.num;
            const isPassed = state.cmlStage > cml.num;
            return (
              <button
                key={cml.num}
                onClick={() => handleCMLClick(cml.num as CMLStage)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-left transition-all ${
                  isCurrent
                    ? 'bg-cyan-950/80 border-cyan-400 text-cyan-300 shadow-glow-cyan'
                    : isPassed
                    ? 'bg-space-850/80 border-emerald-500/40 text-emerald-300 hover:border-emerald-400'
                    : 'bg-space-900/60 border-white/5 text-slate-400 hover:border-white/20'
                }`}
              >
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono font-bold ${
                  isCurrent
                    ? 'bg-cyan-500 text-space-950'
                    : isPassed
                    ? 'bg-emerald-500 text-space-950'
                    : 'bg-space-800 text-slate-400'
                }`}>
                  {isPassed ? <CheckCircle2 className="w-3.5 h-3.5" /> : cml.num}
                </div>
                <div className="hidden sm:block">
                  <div className="text-[11px] font-medium leading-tight">{cml.title}</div>
                  <div className="text-[9px] text-slate-500 leading-tight">{cml.desc}</div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right: Team Mode Toggle & Audio & Help Controls */}
        <div className="hidden lg:flex items-center gap-3">
          {/* Team vs Solo Mode Pill */}
          <button
            onClick={() => {
              soundFx.playClick();
              setState(p => ({ ...p, teamMode: !p.teamMode }));
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono border transition ${
              state.teamMode
                ? 'bg-purple-950/80 border-purple-500/50 text-purple-300 shadow-sm'
                : 'bg-space-850 border-white/10 text-slate-300 hover:text-white'
            }`}
            title="Toggle 4-Player Team Mode or Single Engineer Mode"
          >
            {state.teamMode ? <Users className="w-3.5 h-3.5 text-purple-400" /> : <User className="w-3.5 h-3.5 text-slate-400" />}
            <span>{state.teamMode ? '4-PLAYER TEAM' : 'SOLO ENGINEER'}</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            className="p-2 rounded-lg bg-space-850 border border-white/10 text-slate-300 hover:text-cyan-400 transition"
            title="Toggle Authentic NASA Sound FX"
          >
            {audioEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>

          {/* Reset Scenario */}
          <button
            onClick={() => {
              soundFx.playClick();
              onResetScenario();
            }}
            className="p-2 rounded-lg bg-space-850 border border-white/10 text-slate-300 hover:text-red-400 transition"
            title="Change Mission Scenario"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Tutorial / Help */}
          <button
            onClick={() => {
              soundFx.playClick();
              onOpenTutorial();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600/20 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-600/30 text-xs font-mono transition"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>FLIGHT MANUAL</span>
          </button>
        </div>

      </div>
    </header>
  );
};
