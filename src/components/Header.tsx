import React, { useState } from 'react';
import { 
  Volume2, 
  VolumeX, 
  Music, 
  HelpCircle, 
  Users, 
  User, 
  ArrowLeft, 
  Award,
  Radio,
  Sparkles
} from 'lucide-react';
import { soundFx } from '../utils/audio';

interface Props {
  currentStep: number;
  onStepChange: (step: number) => void;
  scenarioTitle?: string;
  isTeamMode: boolean;
  onToggleTeamMode: () => void;
  onOpenHelp: () => void;
  audioEnabled: boolean;
  onToggleAudio: () => void;
  scienceXP?: number;
}

export const Header: React.FC<Props> = ({
  currentStep,
  onStepChange,
  scenarioTitle,
  isTeamMode,
  onToggleTeamMode,
  onOpenHelp,
  audioEnabled,
  onToggleAudio,
  scienceXP = 650
}) => {
  const [ambientActive, setAmbientActive] = useState<boolean>(false);

  const steps = [
    { num: 1, label: '1. Destination' },
    { num: 2, label: '2. Ship Outfitting' },
    { num: 3, label: '3. Launch Simulation' },
    { num: 4, label: '4. Mission Debrief' },
  ];

  const handleToggleAmbient = () => {
    const active = soundFx.toggleAmbientDrone();
    setAmbientActive(active);
  };

  return (
    <header className="w-full bg-[#070B19]/90 border-b border-cyan-500/25 sticky top-0 z-40 px-4 py-2.5 backdrop-blur-xl shadow-[0_4px_20px_rgba(0,229,255,0.08)]">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        {/* Left: NASA Meatball & Game Title */}
        <div className="flex items-center gap-3">
          {currentStep > 1 && (
            <button
              onClick={() => {
                soundFx.playClick();
                onStepChange(currentStep - 1);
              }}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition border border-white/10"
              title="Return to Previous Phase"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}

          <div 
            onClick={() => onStepChange(1)}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            {/* NASA Meatball Logo */}
            <div className="w-9 h-9 rounded-full bg-[#0B3D91] flex items-center justify-center border border-cyan-400 shadow-[0_0_12px_rgba(0,229,255,0.4)] relative overflow-hidden shrink-0">
              <span className="text-[11px] font-black tracking-tight text-white font-mono">NASA</span>
              <div className="absolute inset-0 border-t-2 border-[#FC3D21] -rotate-45 pointer-events-none" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-extrabold text-white tracking-wider text-base group-hover:text-cyan-400 transition flex items-center gap-1.5">
                  AEROQUEST
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                  MISSION CONTROL
                </span>
              </div>
              {scenarioTitle && currentStep > 1 && (
                <div className="text-[11px] text-slate-400 font-mono truncate max-w-[180px] sm:max-w-none">
                  ACTIVE: <span className="text-white">{scenarioTitle}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Center: Sci-Fi Flight Pipeline Stages */}
        <div className="hidden md:flex items-center gap-1 bg-[#091226] p-1 rounded-xl border border-cyan-500/20 shadow-inner">
          {steps.map((s) => {
            const isCurrent = currentStep === s.num;
            const isDone = currentStep > s.num;
            return (
              <button
                key={s.num}
                onClick={() => {
                  if (s.num <= currentStep || isDone) {
                    soundFx.playClick();
                    onStepChange(s.num);
                  }
                }}
                disabled={s.num > currentStep}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono transition flex items-center gap-1.5 ${
                  isCurrent
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-[0_0_12px_rgba(0,229,255,0.35)] font-bold'
                    : isDone
                    ? 'text-cyan-400 hover:text-white cursor-pointer'
                    : 'text-slate-600 cursor-not-allowed'
                }`}
              >
                <span>{s.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right: Flight Rank & Game HUD Controls */}
        <div className="flex items-center gap-2">
          
          {/* Commander Rank Badge */}
          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0E1B38] border border-cyan-500/30 text-xs font-mono text-cyan-300">
            <Award className="w-3.5 h-3.5 text-yellow-400" />
            <span className="text-slate-400">RANK:</span>
            <span className="font-bold text-white">FLIGHT DIRECTOR</span>
          </div>

          {/* 4-Player Team Mode Toggle */}
          <button
            onClick={() => {
              soundFx.playClick();
              onToggleTeamMode();
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono border transition ${
              isTeamMode
                ? 'bg-purple-950/80 border-purple-500/50 text-purple-200 shadow-[0_0_12px_rgba(168,85,247,0.25)]'
                : 'bg-white/5 border-white/10 text-slate-300 hover:text-white'
            }`}
            title="Toggle 4-Player Team Command or Solo Flight"
          >
            {isTeamMode ? <Users className="w-3.5 h-3.5 text-purple-400" /> : <User className="w-3.5 h-3.5 text-slate-400" />}
            <span className="hidden sm:inline">{isTeamMode ? '4-PLAYER TEAM' : 'SOLO'}</span>
          </button>

          {/* Sci-Fi Space Drone Ambient Soundscape Toggle */}
          <button
            onClick={handleToggleAmbient}
            className={`p-2 rounded-lg border transition ${
              ambientActive
                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_12px_rgba(0,229,255,0.4)]'
                : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
            }`}
            title="Toggle Sci-Fi Space Ambient Drone"
          >
            <Music className="w-4 h-4" />
          </button>

          {/* Sound FX Toggle */}
          <button
            onClick={onToggleAudio}
            className="p-2 rounded-lg bg-white/5 border border-white/10 text-slate-300 hover:text-cyan-400 hover:bg-white/10 transition"
            title="Sound FX"
          >
            {audioEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>

          {/* Flight Manual / Guide */}
          <button
            onClick={onOpenHelp}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600/30 hover:bg-blue-600/50 border border-cyan-400/40 text-cyan-200 text-xs font-mono font-medium transition"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">MANUAL</span>
          </button>
        </div>

      </div>
    </header>
  );
};
