import React, { useState, useEffect } from 'react';
import { EngineeringBudgets, MissionDesignState } from '../types/mission';
import { soundFx } from '../utils/audio';
import { 
  Bot, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  Volume2, 
  ChevronUp, 
  ChevronDown,
  X,
  Lightbulb
} from 'lucide-react';

interface Props {
  budgets: EngineeringBudgets;
  state: MissionDesignState;
  currentStep: number;
}

export const EvaAssistant: React.FC<Props> = ({ budgets, state, currentStep }) => {
  const [minimized, setMinimized] = useState<boolean>(false);
  const [lastSpeech, setLastSpeech] = useState<string>('');

  // Determine EVA's emotional state & dialogue
  let mood: 'ready' | 'warning' | 'critical' | 'cheering' = 'ready';
  let message = '';
  let hint = '';

  if (currentStep === 4) {
    mood = 'cheering';
    message = "Outstanding flight, Commander! We captured vital science data and confirmed telemetry back to Earth. Review our press debrief!";
    hint = "You can download your NASA Mission Certificate below!";
  } else if (budgets.massStatus === 'critical') {
    mood = 'critical';
    message = `Whoa, she's way too heavy! We're over the rocket's lift capacity. The booster will fail to reach orbit!`;
    hint = "Switch to a heavier rocket like the Falcon Heavy, or remove heavy instruments.";
  } else if (budgets.powerStatus === 'critical') {
    mood = 'critical';
    message = `Commander, we have a power brownout! Our solar arrays can't generate enough wattage in deep space.`;
    hint = "Equip the Plutonium Nuclear RTG for continuous deep-space electricity!";
  } else if (budgets.costStatus === 'critical') {
    mood = 'critical';
    message = `Congress halted funding! We blew through our budget cap by $${(budgets.totalCostM - budgets.budgetCapM).toFixed(1)}M.`;
    hint = "Trim down non-essential instruments or choose a more economical launch booster.";
  } else if (budgets.massMarginPercent < 20) {
    mood = 'warning';
    message = `Careful! Mass margin is only ${budgets.massMarginPercent.toFixed(0)}%. NASA flight rules recommend at least a 20% safety cushion!`;
    hint = "You can still launch, but unexpected mass growth during assembly might cause issues.";
  } else if (budgets.powerMarginSunlightW < 50 && state.powerSystemId !== 'pwr_rtg_nextgen') {
    mood = 'warning';
    message = `Our power surplus is dangerously thin (+${budgets.powerMarginSunlightW.toFixed(0)}W). When entering shadow, batteries will drain quickly!`;
    hint = "Consider adding an RTG or reducing high-power radar duty cycles.";
  } else {
    mood = 'ready';
    if (currentStep === 1) {
      message = "Welcome aboard, Commander! Choose a destination. The Moon is great for beginners, while Europa will test your deep-space skills!";
      hint = "Click any destination card below to begin spacecraft engineering.";
    } else if (currentStep === 2) {
      message = "All telemetry green! Mass, power, and budget are within nominal bounds. Spacecraft is certified for launch.";
      hint = "Mount any extra instruments you like, then hit LAUNCH MISSION!";
    } else if (currentStep === 3) {
      message = "Orbital dynamics nominal! Ground station telemetry lock confirmed via NASA Deep Space Network.";
      hint = "Watch out for solar storms and transient plume anomalies!";
    }
  }

  // Speak aloud when mood changes to critical/warning
  useEffect(() => {
    if (message !== lastSpeech && (mood === 'critical' || mood === 'cheering')) {
      soundFx.speak(message);
      setLastSpeech(message);
    }
  }, [message, mood, lastSpeech]);

  const speakNow = () => {
    soundFx.playClick();
    soundFx.speak(message);
  };

  const getMoodAvatar = () => {
    switch (mood) {
      case 'critical':
        return (
          <div className="relative w-10 h-10 rounded-full bg-red-500/20 border-2 border-red-500 flex items-center justify-center text-red-400 shadow-glow-red animate-pulse">
            <AlertTriangle className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-red-500 animate-ping" />
          </div>
        );
      case 'warning':
        return (
          <div className="relative w-10 h-10 rounded-full bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center text-amber-300 shadow-glow-gold">
            <Bot className="w-5 h-5" />
          </div>
        );
      case 'cheering':
        return (
          <div className="relative w-10 h-10 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-emerald-300 shadow-glow-emerald">
            <Sparkles className="w-5 h-5" />
          </div>
        );
      default:
        return (
          <div className="relative w-10 h-10 rounded-full bg-cyan-500/20 border-2 border-cyan-400 flex items-center justify-center text-cyan-300 shadow-glow-cyan">
            <Bot className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-cyan-400" />
          </div>
        );
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-40 max-w-sm sm:max-w-md w-full transition-all">
      <div className={`p-4 rounded-2xl border backdrop-blur-xl shadow-2xl transition-all ${
        mood === 'critical'
          ? 'bg-[#180a0a]/95 border-red-500/60 shadow-[0_0_25px_rgba(239,68,68,0.3)]'
          : mood === 'warning'
          ? 'bg-[#1a1407]/95 border-amber-500/60 shadow-[0_0_25px_rgba(245,158,11,0.25)]'
          : 'bg-[#070e24]/95 border-cyan-500/40 shadow-[0_0_25px_rgba(0,229,255,0.2)]'
      }`}>
        
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-cyan-400">
              NASA AI CO-PILOT • FLIGHT DIRECTOR EVA
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={speakNow}
              className="p-1 rounded-md text-slate-400 hover:text-cyan-300 hover:bg-white/5 transition"
              title="Voice EVA"
            >
              <Volume2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setMinimized(!minimized)}
              className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-white/5 transition"
              title={minimized ? "Expand EVA" : "Minimize EVA"}
            >
              {minimized ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Content Body */}
        {!minimized && (
          <div className="flex items-start gap-3">
            {getMoodAvatar()}

            <div className="space-y-1.5 flex-1 min-w-0">
              <p className="text-xs text-white leading-relaxed font-sans font-medium">
                "{message}"
              </p>

              {hint && (
                <div className="flex items-start gap-1.5 pt-1 text-[11px] font-mono text-cyan-300/90 leading-tight">
                  <Lightbulb className="w-3 h-3 text-yellow-400 shrink-0 mt-0.5" />
                  <span>{hint}</span>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
