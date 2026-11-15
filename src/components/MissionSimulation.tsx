import React, { useState, useEffect, useRef } from 'react';
import { 
  MissionDesignState, 
  EngineeringBudgets, 
  SimulationEvent, 
  MissionEvaluationReport 
} from '../types/mission';
import { NASA_SCENARIOS, NASA_ORBITS, NASA_HISTORIC_MISSIONS } from '../data/nasaData';
import { soundFx } from '../utils/audio';
import { ThreeOrbitViewer } from './ThreeOrbitViewer';
import confetti from 'canvas-confetti';
import { 
  Rocket, 
  Play, 
  Pause, 
  ShieldAlert, 
  Zap, 
  Database, 
  Award, 
  Flame, 
  Activity, 
  Sliders,
  ChevronRight,
  Sun,
  Moon,
  Clock,
  Radio
} from 'lucide-react';

interface Props {
  state: MissionDesignState;
  budgets: EngineeringBudgets;
  onFinishMission: (report: MissionEvaluationReport) => void;
  onAbortSimulation: () => void;
}

export const MissionSimulation: React.FC<Props> = ({
  state,
  budgets,
  onFinishMission,
  onAbortSimulation
}) => {
  const scenario = NASA_SCENARIOS.find(s => s.id === state.scenarioId) || NASA_SCENARIOS[0];
  const orbit = NASA_ORBITS.find(o => o.id === state.orbitId) || NASA_ORBITS[0];

  const [phase, setPhase] = useState<'ready_to_launch' | 'countdown' | 'flight' | 'completed'>('ready_to_launch');
  const [countdown, setCountdown] = useState<number>(5);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [simSpeed, setSimSpeed] = useState<number>(1);
  const [simTimeSec, setSimTimeSec] = useState<number>(0);

  // Time scrubber (0 to 100% of orbit)
  const [orbitScrubberPercent, setOrbitScrubberPercent] = useState<number>(0);

  // Dynamic Telemetry
  const [batterySoc, setBatterySoc] = useState<number>(100);
  const [scienceYield, setScienceYield] = useState<number>(0);
  const [dataBufferGb, setDataBufferGb] = useState<number>(0);
  const [fuelKg, setFuelKg] = useState<number>(state.propellantMassKg);
  const [healthPercent, setHealthPercent] = useState<number>(budgets.overallReliabilityScore);
  const [currentEvent, setCurrentEvent] = useState<SimulationEvent | null>(null);
  const [eventCountdown, setEventCountdown] = useState<number>(30);

  const eventTriggeredRef = useRef<{ [key: string]: boolean }>({});

  // Countdown timer with voice callout
  useEffect(() => {
    if (phase !== 'countdown') return;

    if (countdown > 0) {
      soundFx.playQuindarBeep('intro');
      soundFx.speak(`${countdown}`);
      const timer = setTimeout(() => {
        setCountdown(c => c - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      soundFx.speak("Main engine ignition... and Liftoff!");
      soundFx.playThruster(3.0);
      setPhase('flight');
    }
  }, [countdown, phase]);

  // Main simulation tick
  useEffect(() => {
    if (phase !== 'flight' || isPaused) return;

    const interval = setInterval(() => {
      setSimTimeSec(prev => {
        const next = prev + simSpeed;

        // Advance orbit scrubber
        setOrbitScrubberPercent(p => (p + simSpeed * 0.8) % 100);

        // Accumulate science points
        setScienceYield(sy => {
          const inc = (budgets.totalScienceScore / 45) * simSpeed;
          return Math.min(budgets.totalScienceScore, Math.round(sy + inc));
        });

        // Day/Night simulation cycle
        const inEclipse = Math.sin(next * 0.1) < -0.2;
        setBatterySoc(soc => {
          if (inEclipse) {
            const drain = 0.5 * simSpeed;
            return Math.max(30, +(soc - drain).toFixed(1));
          } else {
            return Math.min(100, +(soc + 0.8 * simSpeed).toFixed(1));
          }
        });

        // Event trigger 1: Solar Particle Storm at 20s
        if (next >= 20 && !eventTriggeredRef.current['event_cme'] && !currentEvent) {
          eventTriggeredRef.current['event_cme'] = true;
          soundFx.playAlarm();
          soundFx.speak("Alert: Coronal Mass Ejection detected! Flight Director decision required.");
          setCurrentEvent({
            id: 'event_cme',
            timeSec: next,
            title: '⚠️ SOLAR PARTICLE STORM & CME DETECTED',
            description: 'Intense cosmic radiation is sweeping across our orbital corridor! How should we respond?',
            severity: 'warning',
            options: [
              {
                text: '🛡️ Turn into Safe Mode (Shields electronics, pauses science)',
                action: 'safe_mode',
                logMessage: 'Command: Safe mode engaged. Avionics shielded from cosmic rays.'
              },
              {
                text: '🔬 Keep Instruments Active for High Science (+120 Science, minor sensor wear)',
                action: 'risk_science',
                scienceBonus: 120,
                riskFactor: 10,
                logMessage: 'Command: Instruments captured groundbreaking solar flare interaction data!'
              }
            ]
          });
        }

        // Event trigger 2: Cryic Plume Discovery at 45s
        if (next >= 45 && !eventTriggeredRef.current['event_plume'] && !currentEvent) {
          eventTriggeredRef.current['event_plume'] = true;
          soundFx.playQuindarBeep('intro');
          soundFx.speak("Opportunity: Active water plume eruption spotted on the surface!");
          setCurrentEvent({
            id: 'event_plume',
            timeSec: next,
            title: '✨ DISCOVERY: ACTIVE CRYIC VAPOUR PLUME',
            description: 'Navigation cameras detect an active cryovolcanic plume venting into space!',
            severity: 'opportunity',
            options: [
              {
                text: '🚀 Fire Thrusters to Fly Through Plume (+150 Science, uses 15kg fuel)',
                action: 'sample_plume',
                costPropellantKg: 15,
                scienceBonus: 150,
                logMessage: 'Maneuver: Thruster burst aligned orbit through plume. Organic organics sampled!'
              },
              {
                text: '📸 Observe from Safe Distance (Conserves propellant)',
                action: 'standoff',
                scienceBonus: 40,
                logMessage: 'Status: Captured long-range optical telephoto sequence.'
              }
            ]
          });
        }

        // Auto complete at 65s
        if (next >= 65) {
          handleCompleteMission();
        }

        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [phase, isPaused, simSpeed, budgets, currentEvent]);

  const handleResolveEvent = (optIndex: number) => {
    if (!currentEvent) return;
    const choice = currentEvent.options[optIndex];
    soundFx.playClick();

    if (choice.costPropellantKg) {
      setFuelKg(f => Math.max(0, f - choice.costPropellantKg!));
    }
    if (choice.scienceBonus) {
      setScienceYield(sy => sy + choice.scienceBonus!);
    }
    if (choice.riskFactor) {
      setHealthPercent(h => Math.max(20, h - choice.riskFactor!));
    }

    setCurrentEvent(null);
  };

  const handleCompleteMission = () => {
    setPhase('completed');
    soundFx.playSuccess();
    soundFx.speak("Mission objectives achieved! Congratulations Flight Team, all telemetry certified.");
    try {
      confetti({
        particleCount: 150,
        spread: 90,
        origin: { y: 0.6 }
      });
    } catch {}

    const scienceScore = Math.min(400, Math.round((scienceYield / scenario.minScienceTarget) * 380));
    const massScore = Math.min(250, Math.round(budgets.massMarginPercent * 7));
    const budgetScore = Math.min(250, Math.round((budgets.remainingBudgetM / scenario.maxBudgetM) * 500));
    const reliabilityScore = budgets.overallReliabilityScore;

    const overallScore = Math.min(1000, scienceScore + massScore + budgetScore + reliabilityScore);
    
    let grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F' = 'B';
    if (overallScore >= 900) grade = 'A+';
    else if (overallScore >= 800) grade = 'A';
    else if (overallScore >= 700) grade = 'B';
    else if (overallScore >= 600) grade = 'C';
    else grade = 'D';

    const historicMatch = (NASA_HISTORIC_MISSIONS as Record<string, any>)[state.scenarioId] || {
      name: 'NASA Flagship Science Mission',
      launchYear: 2024,
      destination: scenario.destination,
      keyInstruments: ['High-Resolution Optical Bench', 'Radar Sounder'],
      costM: scenario.recommendedBudgetM,
      comparisonVerdict: 'Your spacecraft design exhibited solid systems engineering discipline, successfully balancing competing mission demands!'
    };

    const report: MissionEvaluationReport = {
      missionName: state.missionName || `${scenario.title} Unit-1`,
      scenarioTitle: scenario.title,
      status: overallScore >= 650 ? 'FULL_SUCCESS' : 'PARTIAL_SUCCESS',
      overallScore,
      grade,
      scienceYieldScore: scienceScore,
      engineeringMarginScore: Math.max(0, massScore),
      budgetEfficiencyScore: Math.max(0, budgetScore),
      riskMitigationScore: reliabilityScore,
      milestonesUnlocked: [
        'Orbital Injection & Array Deployment Certified',
        'Payload Telemetry & Science Downlink Verified',
        'In-Flight Dynamic Anomaly Successfully Resolved',
        'NASA Systems Engineering Compliance Achieved'
      ],
      postMissionDebrief: `The mission completed nominal flight operations in ${orbit.name}. Collected ${scienceYield} science points with ${budgets.massMarginPercent.toFixed(1)}% mass margin and $${budgets.remainingBudgetM.toFixed(1)}M in budget reserve.`,
      comparableNasaMission: historicMatch,
      budgetsSummary: budgets
    };

    onFinishMission(report);
  };

  return (
    <div className="relative w-full h-[82vh] min-h-[600px] rounded-3xl overflow-hidden bg-[#050814] border border-cyan-500/25 shadow-2xl flex flex-col justify-between">
      
      {/* 3D Orbit Simulator Stage as Full Background */}
      <div className="absolute inset-0 w-full h-full z-0">
        <ThreeOrbitViewer 
          state={state} 
          simulationTimeSec={simTimeSec} 
          isSimulating={phase === 'flight' && !isPaused} 
        />
      </div>

      {/* Shading Gradients */}
      <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-[#050814]/90 via-[#050814]/50 to-transparent pointer-events-none z-10" />
      <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-[#050814] via-[#050814]/90 to-transparent pointer-events-none z-10" />

      {/* STAGE 1: READY TO LAUNCH / IGNITION PROMPT */}
      {phase === 'ready_to_launch' && (
        <div className="relative z-20 m-auto text-center space-y-4 max-w-lg p-8 rounded-3xl bg-[#070e24]/90 border border-cyan-400/40 backdrop-blur-xl shadow-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 font-mono text-xs border border-cyan-400/30">
            <Rocket className="w-3.5 h-3.5 text-cyan-400" />
            <span>LAUNCH VEHICLE ON THE PAD • KENNEDY LC-39A</span>
          </div>

          <h2 className="text-3xl font-extrabold text-white tracking-tight">
            Launch Countdown Ready
          </h2>

          <p className="text-xs text-slate-300 leading-relaxed font-mono">
            Flight Director Go / No-Go poll completed. Spacecraft bus, fuel pressure, and telemetry link are green.
          </p>

          <button
            onClick={() => {
              soundFx.playQuindarBeep('intro');
              setPhase('countdown');
            }}
            className="btn-nasa-accent w-full py-4 rounded-2xl text-lg font-black tracking-wider flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(252,61,33,0.5)] cursor-pointer hover:scale-105 active:scale-95 transition-all animate-pulse"
          >
            <Rocket className="w-6 h-6" />
            <span>IGNITION • START COUNTDOWN</span>
          </button>
        </div>
      )}

      {/* STAGE 2: T-MINUS COUNTDOWN */}
      {phase === 'countdown' && (
        <div className="relative z-20 m-auto text-center space-y-3 max-w-sm p-8 rounded-3xl bg-[#070e24]/95 border border-cyan-400 shadow-[0_0_40px_rgba(0,229,255,0.4)] backdrop-blur-xl">
          <span className="text-xs font-mono tracking-widest uppercase text-cyan-400">
            TERMINAL COUNTDOWN SEQUENCER
          </span>
          <div className="text-7xl sm:text-8xl font-black font-mono text-white tracking-tighter animate-bounce">
            T-{countdown}
          </div>
          <div className="text-xs font-mono text-slate-300">
            Main engine chill active... Igniters armed...
          </div>
        </div>
      )}

      {/* STAGE 3: ACTIVE FLIGHT CONOPS & TELEMETRY */}
      {phase === 'flight' && (
        <>
          {/* Top HUD: Mission Clock & Live Telemetry */}
          <div className="relative z-20 px-4 sm:px-6 pt-4 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
            
            {/* Clock Pill */}
            <div className="flex items-center gap-2.5 bg-[#070e24]/90 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-cyan-500/30 text-xs font-mono text-cyan-300 shadow-md pointer-events-auto">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span>MET: <strong>T+{simTimeSec}s</strong> ({orbit.name.split('(')[0]})</span>
            </div>

            {/* Telemetry Stats */}
            <div className="flex items-center gap-3 sm:gap-4 bg-[#070e24]/90 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10 text-xs font-mono shadow-xl pointer-events-auto">
              <div className="flex items-center gap-1.5 text-cyan-400">
                <Award className="w-3.5 h-3.5" />
                <span className="text-white font-bold">{scienceYield} pts</span>
              </div>
              <span className="text-slate-600">•</span>
              <div className="flex items-center gap-1.5 text-yellow-400">
                <Zap className="w-3.5 h-3.5" />
                <span>Battery: {batterySoc}%</span>
              </div>
              <span className="text-slate-600">•</span>
              <div className="flex items-center gap-1.5 text-orange-400">
                <Flame className="w-3.5 h-3.5" />
                <span>Fuel: {fuelKg} kg</span>
              </div>
            </div>

            {/* Time Warp Speed Controls */}
            <div className="flex items-center gap-1.5 bg-[#070e24]/90 backdrop-blur-md p-1 rounded-xl border border-white/10 pointer-events-auto">
              <button
                onClick={() => setIsPaused(!isPaused)}
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition"
              >
                {isPaused ? <Play className="w-3.5 h-3.5 text-emerald-400" /> : <Pause className="w-3.5 h-3.5 text-amber-400" />}
              </button>
              {[1, 5, 20].map(spd => (
                <button
                  key={spd}
                  onClick={() => setSimSpeed(spd)}
                  className={`px-2 py-0.5 rounded-md text-[11px] font-mono font-bold transition ${
                    simSpeed === spd ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {spd}x
                </button>
              ))}
            </div>

          </div>

          {/* DYNAMIC IN-FLIGHT ANOMALY POPUP */}
          {currentEvent && (
            <div className="relative z-30 m-auto max-w-lg p-5 rounded-3xl bg-[#140b08]/95 border-2 border-amber-500/80 backdrop-blur-xl shadow-[0_0_35px_rgba(245,158,11,0.35)] animate-bounce-short">
              <div className="flex items-center gap-2 text-xs font-mono text-amber-400 font-bold mb-1.5">
                <ShieldAlert className="w-4 h-4 text-amber-400 animate-pulse" />
                <span>FLIGHT DIRECTOR TACTICAL DECISION REQUIRED</span>
              </div>
              <h3 className="text-base font-bold text-white mb-1">
                {currentEvent.title}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed font-mono mb-4">
                {currentEvent.description}
              </p>

              <div className="space-y-2">
                {currentEvent.options.map((opt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleResolveEvent(idx)}
                    className="w-full p-3 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 hover:border-amber-400 text-left transition-all group"
                  >
                    <div className="text-xs font-semibold text-white group-hover:text-amber-300 mb-0.5">
                      {opt.text}
                    </div>
                    {opt.scienceBonus && (
                      <span className="text-[10px] font-mono text-emerald-400 font-bold">
                        +{opt.scienceBonus} Bonus Science Points
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Bottom Dock: Interactive Orbit Time-Scrubber */}
          <div className="relative z-20 p-4 sm:p-5 max-w-5xl mx-auto w-full space-y-2 pointer-events-auto">
            <div className="bg-[#070e24]/90 border border-white/10 rounded-2xl p-3 backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xl">
              
              <div className="flex-1 w-full space-y-1">
                <div className="flex items-center justify-between text-xs font-mono text-slate-300">
                  <span className="flex items-center gap-1.5 text-cyan-400">
                    <Sliders className="w-3.5 h-3.5" /> Orbit Track Position: {orbitScrubberPercent.toFixed(0)}%
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Ground Station: Goldstone 70m Dish (DSN)
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={orbitScrubberPercent}
                  onChange={(e) => setOrbitScrubberPercent(parseFloat(e.target.value))}
                  className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>

              {/* Conclude Button */}
              <button
                onClick={handleCompleteMission}
                className="btn-nasa-primary px-6 py-2.5 rounded-xl text-xs font-bold font-mono tracking-wide flex items-center gap-1.5 shrink-0 shadow-lg cursor-pointer"
              >
                <span>COMPLETE MISSION & DEBRIEF</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

            </div>
          </div>
        </>
      )}

    </div>
  );
};
