import React from 'react';
import { Volume2, VolumeX, HelpCircle, Users, User, ArrowLeft } from 'lucide-react';
import { soundFx } from '../utils/audio';

interface Props {
  currentStep: number; // 1: Choose Scenario, 2: Design Spacecraft, 3: Flight Simulation, 4: Results
  onStepChange: (step: number) => void;
  scenarioTitle?: string;
  isTeamMode: boolean;
  onToggleTeamMode: () => void;
  onOpenHelp: () => void;
  audioEnabled: boolean;
  onToggleAudio: () => void;
}

export const Header: React.FC<Props> = ({
  currentStep,
  onStepChange,
  scenarioTitle,
  isTeamMode,
  onToggleTeamMode,
  onOpenHelp,
  audioEnabled,
  onToggleAudio
}) => {
  const steps = [
    { num: 1, label: '1. Destination' },
    { num: 2, label: '2. Build Spacecraft' },
    { num: 3, label: '3. Launch & Fly' },
    { num: 4, label: '4. Mission Results' },
  ];

  return (
    <header className="w-full bg-[#070B19]/90 border-b border-white/10 sticky top-0 z-40 px-4 py-3 backdrop-blur-md">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
        
        {/* Left: Official NASA Meatball & Title */}
        <div className="flex items-center gap-3">
          {currentStep > 1 && (
            <button
              onClick={() => {
                soundFx.playClick();
                onStepChange(currentStep - 1);
              }}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition"
              title="Go Back"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}

          <div 
            onClick={() => onStepChange(1)}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            {/* NASA Meatball Logo */}
            <div className="w-9 h-9 rounded-full bg-[#0B3D91] flex items-center justify-center border border-sky-400 shadow-md relative overflow-hidden shrink-0">
              <span className="text-[11px] font-black tracking-tight text-white font-mono">NASA</span>
              <div className="absolute inset-0 border-t-2 border-[#FC3D21] -rotate-45 pointer-events-none" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white tracking-wide text-base group-hover:text-cyan-400 transition">
                  AEROQUEST
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-medium bg-blue-500/20 text-sky-300 border border-blue-400/30">
                  Mission Simulator
                </span>
              </div>
              {scenarioTitle && currentStep > 1 && (
                <div className="text-[11px] text-slate-400 truncate max-w-[200px] sm:max-w-none">
                  {scenarioTitle}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Center: Clean, Simple Progress Steps */}
        <div className="hidden md:flex items-center gap-1.5 bg-white/5 p-1 rounded-xl border border-white/10">
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
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
                  isCurrent
                    ? 'bg-blue-600 text-white shadow-sm font-semibold'
                    : isDone
                    ? 'text-cyan-400 hover:text-white cursor-pointer'
                    : 'text-slate-500 cursor-not-allowed'
                }`}
              >
                <span>{s.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right: Quick Controls (Team Mode, Sound, Help) */}
        <div className="flex items-center gap-2">
          {/* Team Mode Pill */}
          <button
            onClick={() => {
              soundFx.playClick();
              onToggleTeamMode();
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs border transition ${
              isTeamMode
                ? 'bg-purple-900/60 border-purple-500/50 text-purple-200'
                : 'bg-white/5 border-white/10 text-slate-300 hover:text-white'
            }`}
            title="Toggle Single-Player or 4-Player Team Mode"
          >
            {isTeamMode ? <Users className="w-3.5 h-3.5 text-purple-400" /> : <User className="w-3.5 h-3.5 text-slate-400" />}
            <span className="hidden sm:inline">{isTeamMode ? '4-Player Team' : 'Solo'}</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={onToggleAudio}
            className="p-2 rounded-lg bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 transition"
            title="Audio FX"
          >
            {audioEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>

          {/* Guide Modal */}
          <button
            onClick={onOpenHelp}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600/30 hover:bg-blue-600/50 border border-blue-400/40 text-sky-200 text-xs font-medium transition"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Guide</span>
          </button>
        </div>

      </div>
    </header>
  );
};
