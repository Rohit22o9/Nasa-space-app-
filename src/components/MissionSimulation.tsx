import React, { useState, useEffect, useRef } from 'react';
import { 
  MissionDesignState, 
  EngineeringBudgets, 
  SimulationEvent, 
  MissionTelemetry, 
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
  FastForward, 
  ShieldAlert, 
  CheckCircle2, 
  Radio, 
  Zap, 
  Database, 
  Award, 
  AlertTriangle, 
  Compass, 
  Flame, 
  Activity, 
  Volume2, 
  ChevronRight,
  Sparkles
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

  const [phase, setPhase] = useState<'countdown' | 'launch' | 'deployment' | 'insertion' | 'operations' | 'completed'>('countdown');
  const [countdown, setCountdown] = useState<number>(5);
  const [simSpeed, setSimSpeed] = useState<number>(1);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [simTimeSec, setSimTimeSec] = useState<number>(0);

  // Live Telemetry
  const [altitudeKm, setAltitudeKm] = useState<number>(0);
  const [velocityKms, setVelocityKms] = useState<number>(0);
  const [batterySoc, setBatterySoc] = useState<number>(100);
  const [scienceYield, setScienceYield] = useState<number>(0);
  const [dataBufferGb, setDataBufferGb] = useState<number>(0);
  const [fuelKg, setFuelKg] = useState<number>(state.propellantMassKg);
  const [healthPercent, setHealthPercent] = useState<number>(budgets.overallReliabilityScore);
  const [telemetryLogs, setTelemetryLogs] = useState<string[]>([]);
  const [currentEvent, setCurrentEvent] = useState<SimulationEvent | null>(null);

  const eventTriggeredRef = useRef<{ [key: string]: boolean }>({});

  const addLog = (msg: string) => {
    setTelemetryLogs(prev => [
      `[T+${Math.floor(simTimeSec)}s] ${msg}`,
      ...prev.slice(0, 30)
    ]);
  };

  // Pre-launch countdown
  useEffect(() => {
    if (phase !== 'countdown') return;

    if (countdown > 0) {
      const timer = setTimeout(() => {
        soundFx.playQuindarBeep('intro');
        setCountdown(c => c - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      soundFx.playThruster(2.5);
      setPhase('launch');
      addLog(`LIFTOFF! Booster ignition sequence completed. ${state.launchVehicleId.toUpperCase()} clearing the pad.`);
    }
  }, [countdown, phase]);

  // Main simulation tick
  useEffect(() => {
    if (phase === 'countdown' || phase === 'completed' || isPaused) return;

    const interval = setInterval(() => {
      setSimTimeSec(prev => {
        const next = prev + simSpeed;

        // Phase transitions
        if (next >= 10 && phase === 'launch') {
          setPhase('deployment');
          soundFx.playQuindarBeep('outro');
          addLog('STAGING: Fairing jettisoned and spacecraft separated. Deploying solar wings & antenna array.');
        } else if (next >= 22 && phase === 'deployment') {
          setPhase('insertion');
          soundFx.playThruster(1.5);
          addLog(`PROPULSION BURN: Trajectory insertion burn initiated (${budgets.requiredDeltaVMs} m/s $\\Delta v$).`);
          setFuelKg(f => Math.max(0, f - (budgets.requiredDeltaVMs > 0 ? 35 : 0)));
        } else if (next >= 35 && phase === 'insertion') {
          setPhase('operations');
          soundFx.playQuindarBeep('intro');
          addLog(`ORBIT INSERTION CONFIRMED: Spacecraft captured into ${orbit.name}. Science operations commencing.`);
        }

        // Orbital Flight dynamics
        if (phase === 'operations') {
          // Accumulate science points
          setScienceYield(sy => {
            const increment = (budgets.totalScienceScore / 60) * simSpeed;
            return Math.min(budgets.totalScienceScore, Math.round(sy + increment));
          });

          // Data generation & Downlink pass
          const isDownlinkPass = Math.sin(next * 0.1) > 0.3;
          setDataBufferGb(buf => {
            const generated = (budgets.dataGeneratedPerDayGb / 86400) * 100 * simSpeed;
            const downlinked = isDownlinkPass ? (budgets.maxDownlinkCapacityPerDayGb / 86400) * 250 * simSpeed : 0;
            return Math.max(0, +(buf + generated - downlinked).toFixed(2));
          });

          // Battery charge / discharge cycle
          const inShadow = Math.sin(next * 0.08) < -0.2;
          setBatterySoc(soc => {
            if (inShadow) {
              const drain = (budgets.energyRequiredInEclipseWh / (budgets.energyRequiredInEclipseWh * 2)) * 0.4 * simSpeed;
              return Math.max(25, +(soc - drain).toFixed(1));
            } else {
              const charge = 0.6 * simSpeed;
              return Math.min(100, +(soc + charge).toFixed(1));
            }
          });

          // In-Flight Dynamic Anomalies / Events
          if (next >= 45 && !eventTriggeredRef.current['event_cme'] && !currentEvent) {
            eventTriggeredRef.current['event_cme'] = true;
            soundFx.playAlarm();
            setCurrentEvent({
              id: 'event_cme',
              timeSec: next,
              title: 'SOLAR PARTICLE STORM & CME DETECTED',
              description: 'Space Weather Prediction Center reports an energetic X-class solar flare heading toward the orbital plane.',
              severity: 'warning',
              options: [
                {
                  text: 'Orient into Safe Mode & Power Down Sensitive Sensors (Protects hardware)',
                  action: 'safe_mode',
                  costPowerWh: 10,
                  logMessage: 'COMMAND: Safe mode active. Instruments shielded from cosmic rays.'
                },
                {
                  text: 'Keep Science Instruments Active (Risk sensor degradation for bonus science!)',
                  action: 'risk_science',
                  scienceBonus: 85,
                  riskFactor: 12,
                  logMessage: 'COMMAND: Instruments kept active! Captured rare solar wind magnetosphere interaction data.'
                }
              ]
            });
          } else if (next >= 85 && !eventTriggeredRef.current['event_plume'] && !currentEvent) {
            eventTriggeredRef.current['event_plume'] = true;
            soundFx.playQuindarBeep('intro');
            setCurrentEvent({
              id: 'event_plume',
              timeSec: next,
              title: 'TRANSIENT OPPORTUNITY: CRYIC PLUME BURST',
              description: 'Onboard navigation cameras detect a surprise active vapor eruption venting into space!',
              severity: 'opportunity',
              options: [
                {
                  text: 'Execute Rapid Slew Maneuver & Sample Plume (Consumes 15 kg fuel)',
                  action: 'slew_sample',
                  costPropellantKg: 15,
                  scienceBonus: 120,
                  logMessage: 'MANEUVER: Thrusters fired to skim through plume. Mass spectrometer recorded pristine volatiles!'
                },
                {
                  text: 'Maintain Standard Survey Profile (Conserves propellant)',
                  action: 'maintain_survey',
                  logMessage: 'STATUS: Maintained baseline nominal survey attitude.'
                }
              ]
            });
          }

          // Complete Mission after duration
          if (next >= 120) {
            handleCompleteMission();
          }
        }

        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [phase, isPaused, simSpeed, budgets, currentEvent]);

  // Handle Event Choice
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

    addLog(choice.logMessage);
    setCurrentEvent(null);
  };

  const handleCompleteMission = () => {
    setPhase('completed');
    soundFx.playSuccess();
    try {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });
    } catch {}

    // Generate comprehensive evaluation report
    const scienceRatio = scienceYield / Math.max(1, scenario.minScienceTarget);
    const massMarginScore = Math.max(0, Math.min(250, budgets.massMarginPercent * 7));
    const budgetScore = Math.max(0, Math.min(250, (budgets.remainingBudgetM / scenario.maxBudgetM) * 500));
    const scienceScore = Math.min(400, Math.round(scienceRatio * 350));
    const reliabilityScore = budgets.overallReliabilityScore;

    const overallScore = Math.min(1000, Math.round(scienceScore + massMarginScore + budgetScore + reliabilityScore));
    
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
      keyInstruments: ['High-Resolution Optical Bench', 'Spectrometer'],
      costM: scenario.recommendedBudgetM,
      comparisonVerdict: 'Your spacecraft design exhibited solid systems engineering discipline, successfully balancing competing mission demands!'
    };

    const report: MissionEvaluationReport = {
      missionName: state.missionName || `${scenario.title} Flight Unit 1`,
      scenarioTitle: scenario.title,
      status: overallScore >= 650 ? 'FULL_SUCCESS' : 'PARTIAL_SUCCESS',
      overallScore,
      grade,
      scienceYieldScore: scienceScore,
      engineeringMarginScore: Math.round(massMarginScore),
      budgetEfficiencyScore: Math.round(budgetScore),
      riskMitigationScore: reliabilityScore,
      milestonesUnlocked: [
        'Orbital Injection & Array Deployment Certified',
        'Payload Telemetry & Science Downlink Verified',
        'Autonomous Event Anomaly Successfully Resolved',
        'NASA MDL Concurrent Engineering Compliance Achieved'
      ],
      postMissionDebrief: `The mission completed nominal operations in ${orbit.name}. Collected ${scienceYield} science points with ${budgets.massMarginPercent.toFixed(1)}% mass margin and $${budgets.remainingBudgetM.toFixed(1)}M in budget reserve.`,
      comparableNasaMission: historicMatch,
      budgetsSummary: budgets
    };

    onFinishMission(report);
  };

  return (
    <div className="space-y-6">
      {/* 3D Celestial Orbit Simulator */}
      <ThreeOrbitViewer 
        state={state} 
        simulationTimeSec={simTimeSec} 
        isSimulating={phase !== 'countdown' && !isPaused} 
      />

      {/* Mission Phase Tracker & Countdown overlay */}
      {phase === 'countdown' && (
        <div className="p-8 rounded-2xl bg-space-950/90 border border-cyan-400 text-center shadow-glow-cyan">
          <div className="text-xs font-mono text-cyan-400 uppercase tracking-widest mb-2">
            KENNEDY SPACE CENTER • LAUNCH CONTROL CENTER
          </div>
          <div className="text-6xl md:text-8xl font-mono font-black text-white tracking-tighter mb-4 animate-pulse">
            T-{countdown}
          </div>
          <div className="text-sm font-mono text-slate-300">
            Flight Director Go / No-Go poll completed. Terminal countdown sequencer active.
          </div>
        </div>
      )}

      {/* Flight Control HUD Console */}
      <div className="p-5 rounded-2xl bg-space-900/95 border border-white/10 backdrop-blur-md">
        {/* Top Control Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
            <div>
              <div className="text-xs font-mono font-bold text-white uppercase">
                MISSION ELAPSED TIME (MET): <span className="text-cyan-400">{Math.floor(simTimeSec / 60)}m {simTimeSec % 60}s</span>
              </div>
              <div className="text-[11px] font-mono text-slate-400">
                PHASE: <strong className="text-yellow-400 uppercase">{phase}</strong>
              </div>
            </div>
          </div>

          {/* Time Warp Speed Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPaused(!isPaused)}
              className="p-2 rounded-lg bg-space-800 text-slate-200 hover:bg-space-700 transition"
              title={isPaused ? 'Resume Simulation' : 'Pause Simulation'}
            >
              {isPaused ? <Play className="w-4 h-4 text-emerald-400" /> : <Pause className="w-4 h-4 text-amber-400" />}
            </button>

            {[1, 5, 20].map(spd => (
              <button
                key={spd}
                onClick={() => setSimSpeed(spd)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition ${
                  simSpeed === spd
                    ? 'bg-cyan-500 text-space-950 shadow-glow-cyan'
                    : 'bg-space-800 text-slate-300 hover:bg-space-700'
                }`}
              >
                {spd}x
              </button>
            ))}

            <button
              onClick={handleCompleteMission}
              className="ml-2 px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold transition"
            >
              FINISH SIMULATION
            </button>
          </div>
        </div>

        {/* Real-Time Telemetry Gauges */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 my-4">
          <div className="p-3 rounded-xl bg-space-950/70 border border-white/5 font-mono">
            <span className="text-[10px] text-slate-500 block flex items-center gap-1">
              <Zap className="w-3 h-3 text-yellow-400" />
              BATTERY SOC
            </span>
            <div className="text-xl font-bold text-yellow-400 mt-1">
              {batterySoc}%
            </div>
            <div className="w-full bg-space-800 h-1.5 rounded-full mt-2 overflow-hidden">
              <div 
                className="h-full bg-yellow-400 transition-all duration-300"
                style={{ width: `${batterySoc}%` }}
              />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-space-950/70 border border-white/5 font-mono">
            <span className="text-[10px] text-slate-500 block flex items-center gap-1">
              <Award className="w-3 h-3 text-emerald-400" />
              SCIENCE POINTS
            </span>
            <div className="text-xl font-bold text-cyan-400 mt-1">
              {scienceYield} <span className="text-xs font-normal text-slate-500">pts</span>
            </div>
            <div className="text-[10px] text-slate-500 mt-1">
              Target: {scenario.minScienceTarget} pts
            </div>
          </div>

          <div className="p-3 rounded-xl bg-space-950/70 border border-white/5 font-mono">
            <span className="text-[10px] text-slate-500 block flex items-center gap-1">
              <Database className="w-3 h-3 text-purple-400" />
              DATA RECORDER
            </span>
            <div className="text-xl font-bold text-white mt-1">
              {dataBufferGb} <span className="text-xs font-normal text-slate-500">Gb</span>
            </div>
            <div className="text-[10px] text-slate-500 mt-1">
              Solid-State Buffer
            </div>
          </div>

          <div className="p-3 rounded-xl bg-space-950/70 border border-white/5 font-mono">
            <span className="text-[10px] text-slate-500 block flex items-center gap-1">
              <Flame className="w-3 h-3 text-orange-400" />
              FUEL REMAINING
            </span>
            <div className="text-xl font-bold text-orange-400 mt-1">
              {fuelKg} <span className="text-xs font-normal text-slate-500">kg</span>
            </div>
            <div className="text-[10px] text-slate-500 mt-1">
              Propellant mass
            </div>
          </div>

          <div className="p-3 rounded-xl bg-space-950/70 border border-white/5 font-mono">
            <span className="text-[10px] text-slate-500 block flex items-center gap-1">
              <Activity className="w-3 h-3 text-sky-400" />
              BUS INTEGRITY
            </span>
            <div className="text-xl font-bold text-emerald-400 mt-1">
              {healthPercent}%
            </div>
            <div className="text-[10px] text-slate-500 mt-1">
              Subsystems Health
            </div>
          </div>
        </div>

        {/* Dynamic Anomaly Event Popup Modal / Card */}
        {currentEvent && (
          <div className="my-4 p-5 rounded-2xl bg-amber-950/80 border border-amber-500/60 shadow-glow-gold animate-bounce-short">
            <div className="flex items-center gap-2 text-amber-300 font-mono text-xs font-bold uppercase mb-2">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <span>FLIGHT DIRECTOR TACTICAL DECISION REQUIRED</span>
            </div>
            <h4 className="text-base font-bold text-white mb-1">
              {currentEvent.title}
            </h4>
            <p className="text-xs text-slate-300 mb-4 leading-relaxed font-mono">
              {currentEvent.description}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {currentEvent.options.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleResolveEvent(idx)}
                  className="p-3 rounded-xl bg-space-950/80 border border-white/20 hover:border-amber-400 hover:bg-space-900 text-left transition-all group"
                >
                  <div className="text-xs font-semibold text-white group-hover:text-amber-300 mb-1 leading-snug">
                    {opt.text}
                  </div>
                  {opt.scienceBonus && (
                    <span className="text-[10px] font-mono text-emerald-400 font-bold block">
                      +{opt.scienceBonus} Bonus Science
                    </span>
                  )}
                  {opt.costPropellantKg && (
                    <span className="text-[10px] font-mono text-orange-400 font-bold block">
                      Requires {opt.costPropellantKg} kg Propellant
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Flight Telemetry Event Stream */}
        <div className="mt-4 pt-3 border-t border-white/10">
          <div className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
            <Radio className="w-3.5 h-3.5 text-cyan-400" />
            NASA Flight Director Telemetry Stream
          </div>
          <div className="h-28 overflow-y-auto font-mono text-xs text-slate-300 space-y-1 bg-space-950/60 p-2.5 rounded-xl border border-white/5">
            {telemetryLogs.map((log, idx) => (
              <div key={idx} className="leading-snug">
                {log}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
