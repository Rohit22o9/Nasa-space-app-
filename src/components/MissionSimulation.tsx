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
  CheckCircle2, 
  Radio, 
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

  // Live Game Telemetry
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
      ...prev.slice(0, 25)
    ]);
  };

  // Countdown Sequence
  useEffect(() => {
    if (phase !== 'countdown') return;

    if (countdown > 0) {
      const timer = setTimeout(() => {
        soundFx.playQuindarBeep('intro');
        setCountdown(c => c - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      soundFx.playThruster(3.0);
      setPhase('launch');
      addLog(`LIFTOFF! Ignition sequence start. Rocket booster clearing the launch pad.`);
    }
  }, [countdown, phase]);

  // Main Simulation Loop
  useEffect(() => {
    if (phase === 'countdown' || phase === 'completed' || isPaused) return;

    const interval = setInterval(() => {
      setSimTimeSec(prev => {
        const next = prev + simSpeed;

        if (next >= 10 && phase === 'launch') {
          setPhase('deployment');
          soundFx.playQuindarBeep('outro');
          addLog('STAGING: Fairing jettisoned. Solar array wings deployed and oriented toward Sun.');
        } else if (next >= 22 && phase === 'deployment') {
          setPhase('insertion');
          soundFx.playThruster(1.8);
          addLog(`PROPULSION BURN: Trajectory insertion burn started (${budgets.requiredDeltaVMs} m/s $\\Delta v$).`);
          setFuelKg(f => Math.max(0, f - (budgets.requiredDeltaVMs > 0 ? 35 : 0)));
        } else if (next >= 35 && phase === 'insertion') {
          setPhase('operations');
          soundFx.playQuindarBeep('intro');
          addLog(`ORBIT CAPTURE CONFIRMED: Spacecraft stabilized in ${orbit.name}. Primary science mission active.`);
        }

        if (phase === 'operations') {
          // Accumulate science points
          setScienceYield(sy => {
            const increment = (budgets.totalScienceScore / 60) * simSpeed;
            return Math.min(budgets.totalScienceScore, Math.round(sy + increment));
          });

          // Data link simulation
          const isDownlink = Math.sin(next * 0.1) > 0.25;
          setDataBufferGb(buf => {
            const generated = (budgets.dataGeneratedPerDayGb / 86400) * 120 * simSpeed;
            const downlinked = isDownlink ? (budgets.maxDownlinkCapacityPerDayGb / 86400) * 280 * simSpeed : 0;
            return Math.max(0, +(buf + generated - downlinked).toFixed(2));
          });

          // Battery state of charge cycle
          const inShadow = Math.sin(next * 0.08) < -0.2;
          setBatterySoc(soc => {
            if (inShadow) {
              const drain = 0.35 * simSpeed;
              return Math.max(30, +(soc - drain).toFixed(1));
            } else {
              const charge = 0.5 * simSpeed;
              return Math.min(100, +(soc + charge).toFixed(1));
            }
          });

          // Dynamic Anomaly 1: Solar Particle Storm
          if (next >= 45 && !eventTriggeredRef.current['event_cme'] && !currentEvent) {
            eventTriggeredRef.current['event_cme'] = true;
            soundFx.playAlarm();
            setCurrentEvent({
              id: 'event_cme',
              timeSec: next,
              title: 'EMERGENCY: SOLAR PARTICLE STORM DETECTED',
              description: 'Space Weather Alert! A high-energy coronal mass ejection is impinging upon your orbit.',
              severity: 'warning',
              options: [
                {
                  text: 'Orient into Safe Mode & Power Down Optics (Shields electronics)',
                  action: 'safe_mode',
                  costPowerWh: 10,
                  logMessage: 'COMMAND: Safe mode active. Microchips shielded from ionizing radiation.'
                },
                {
                  text: 'Keep Science Instruments Active (+100 Bonus Science, Risk 10% Sensor Wear)',
                  action: 'risk_science',
                  scienceBonus: 100,
                  riskFactor: 10,
                  logMessage: 'COMMAND: Instruments kept active! Captured historic magnetic shockwave data.'
                }
              ]
            });
          } else if (next >= 85 && !eventTriggeredRef.current['event_plume'] && !currentEvent) {
            eventTriggeredRef.current['event_plume'] = true;
            soundFx.playQuindarBeep('intro');
            setCurrentEvent({
              id: 'event_plume',
              timeSec: next,
              title: 'SERENDIPITOUS TARGET: CRYIC PLUME VENT DETECTED',
              description: 'Optical sensors have detected an active volatile eruption plume venting directly below your flight path!',
              severity: 'opportunity',
              options: [
                {
                  text: 'Fire Reaction Control Thrusters & Skim Plume (+150 Bonus Science, Consumes 15 kg fuel)',
                  action: 'slew_sample',
                  costPropellantKg: 15,
                  scienceBonus: 150,
                  logMessage: 'MANEUVER: Thrusters fired to skim through plume. Mass spectrometer recorded organic molecules!'
                },
                {
                  text: 'Maintain Standard Survey Profile (Conserves propellant)',
                  action: 'maintain_survey',
                  logMessage: 'STATUS: Maintained baseline nominal survey attitude.'
                }
              ]
            });
          }

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

  const handleManualBurnBonus = () => {
    soundFx.playThruster(1.2);
    setScienceYield(sy => sy + 40);
    addLog('MANUAL THRUSTER PULSE: Orbital insertion trimmed with +40 science precision bonus!');
  };

  const handleCompleteMission = () => {
    setPhase('completed');
    soundFx.playSuccess();
    try {
      confetti({
        particleCount: 140,
        spread: 90,
        origin: { y: 0.6 }
      });
    } catch {}

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
      missionName: state.missionName || `${scenario.title} Unit-1`,
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
        'NASA Concurrent Systems Engineering Standards Met'
      ],
      postMissionDebrief: `The mission completed nominal operations in ${orbit.name}. Collected ${scienceYield} science points with ${budgets.massMarginPercent.toFixed(1)}% mass margin and $${budgets.remainingBudgetM.toFixed(1)}M in budget reserve.`,
      comparableNasaMission: historicMatch,
      budgetsSummary: budgets
    };

    onFinishMission(report);
  };

  return (
    <div className="space-y-6">
      
      {/* 3D Celestial Flight Dynamics View */}
      <ThreeOrbitViewer 
        state={state} 
        simulationTimeSec={simTimeSec} 
        isSimulating={phase !== 'countdown' && !isPaused} 
      />

      {/* Retro-Futuristic Countdown Overlay */}
      {phase === 'countdown' && (
        <div className="p-8 rounded-3xl bg-[#070D1F]/95 border-2 border-cyan-400 text-center shadow-[0_0_40px_rgba(0,229,255,0.3)] backdrop-blur-xl">
          <div className="text-xs font-mono text-cyan-400 uppercase tracking-widest mb-2 flex items-center justify-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span>KENNEDY SPACE CENTER • LAUNCH COUNTDOWN IN PROGRESS</span>
          </div>
          <div className="text-7xl md:text-9xl font-mono font-black text-white tracking-tighter my-3 animate-pulse">
            T-{countdown}
          </div>
          <div className="text-sm font-mono text-slate-300">
            Main engine fuel pressurization nominal. Terminal sequencer in control.
          </div>
        </div>
      )}

      {/* Flight Director Gaming Dashboard */}
      <div className="p-5 rounded-3xl bg-[#091226]/95 border border-cyan-500/30 backdrop-blur-xl shadow-xl">
        
        {/* Cockpit Status Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
            <div>
              <div className="text-xs font-mono font-bold text-white uppercase flex items-center gap-2">
                MISSION ELAPSED TIME: <span className="text-cyan-400 text-sm">{Math.floor(simTimeSec / 60)}m {simTimeSec % 60}s</span>
              </div>
              <div className="text-[11px] font-mono text-slate-400">
                STAGE: <strong className="text-yellow-400 uppercase">{phase}</strong>
              </div>
            </div>
          </div>

          {/* Time Warp & Thruster Controls */}
          <div className="flex items-center gap-2">
            {phase === 'operations' && (
              <button
                onClick={handleManualBurnBonus}
                className="px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-mono text-xs font-bold transition flex items-center gap-1 shadow-md"
                title="Pulse Thruster for Bonus Points"
              >
                <Flame className="w-3.5 h-3.5" />
                <span>PULSE RCS THRUST</span>
              </button>
            )}

            <button
              onClick={() => setIsPaused(!isPaused)}
              className="p-2 rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700 transition"
              title={isPaused ? 'Resume' : 'Pause'}
            >
              {isPaused ? <Play className="w-4 h-4 text-emerald-400" /> : <Pause className="w-4 h-4 text-amber-400" />}
            </button>

            {[1, 5, 20].map(spd => (
              <button
                key={spd}
                onClick={() => setSimSpeed(spd)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition ${
                  simSpeed === spd
                    ? 'bg-cyan-500 text-space-950 shadow-[0_0_12px_rgba(0,229,255,0.4)]'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {spd}x
              </button>
            ))}

            <button
              onClick={handleCompleteMission}
              className="ml-2 px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold transition shadow-md"
            >
              FINISH MISSION
            </button>
          </div>
        </div>

        {/* Real-Time Flight Gauges */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 my-4">
          
          <div className="p-3.5 rounded-2xl bg-[#070D1F] border border-yellow-500/30 font-mono">
            <span className="text-[10px] text-yellow-400 block flex items-center gap-1 font-bold">
              <Zap className="w-3 h-3 text-yellow-400" /> BATTERY SOC
            </span>
            <div className="text-2xl font-black text-yellow-400 mt-1">
              {batterySoc}%
            </div>
            <div className="w-full bg-slate-900 h-1.5 rounded-full mt-2 overflow-hidden">
              <div 
                className="h-full bg-yellow-400 transition-all duration-300"
                style={{ width: `${batterySoc}%` }}
              />
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#070D1F] border border-cyan-500/30 font-mono">
            <span className="text-[10px] text-cyan-400 block flex items-center gap-1 font-bold">
              <Award className="w-3 h-3 text-cyan-400" /> SCIENCE YIELD
            </span>
            <div className="text-2xl font-black text-cyan-300 mt-1">
              {scienceYield} <span className="text-xs font-normal text-slate-500">pts</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              Goal: {scenario.minScienceTarget} pts
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#070D1F] border border-purple-500/30 font-mono">
            <span className="text-[10px] text-purple-400 block flex items-center gap-1 font-bold">
              <Database className="w-3 h-3 text-purple-400" /> SSR BUFFER
            </span>
            <div className="text-2xl font-black text-white mt-1">
              {dataBufferGb} <span className="text-xs font-normal text-slate-500">Gb</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              Solid-State Memory
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#070D1F] border border-orange-500/30 font-mono">
            <span className="text-[10px] text-orange-400 block flex items-center gap-1 font-bold">
              <Flame className="w-3 h-3 text-orange-400" /> PROPELLANT
            </span>
            <div className="text-2xl font-black text-orange-400 mt-1">
              {fuelKg} <span className="text-xs font-normal text-slate-500">kg</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              Propulsion Fuel
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#070D1F] border border-emerald-500/30 font-mono">
            <span className="text-[10px] text-emerald-400 block flex items-center gap-1 font-bold">
              <Activity className="w-3 h-3 text-emerald-400" /> HEALTH
            </span>
            <div className="text-2xl font-black text-emerald-400 mt-1">
              {healthPercent}%
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              Subsystems OK
            </div>
          </div>

        </div>

        {/* Dynamic Flight Anomaly Tactical Decision Card */}
        {currentEvent && (
          <div className="my-4 p-5 rounded-3xl bg-amber-950/90 border-2 border-amber-500 shadow-[0_0_35px_rgba(245,158,11,0.35)] animate-bounce-short">
            <div className="flex items-center gap-2 text-amber-300 font-mono text-xs font-bold uppercase mb-2">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <span>FLIGHT DIRECTOR TACTICAL EMERGENCY DECISION</span>
            </div>
            <h4 className="text-base md:text-lg font-bold text-white mb-1">
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
                  className="p-3.5 rounded-2xl bg-[#070B19]/90 border border-white/20 hover:border-amber-400 hover:bg-[#0c1630] text-left transition-all group cursor-pointer"
                >
                  <div className="text-xs font-semibold text-white group-hover:text-amber-300 mb-1 leading-snug">
                    {opt.text}
                  </div>
                  {opt.scienceBonus && (
                    <span className="text-[11px] font-mono text-emerald-400 font-bold block">
                      +{opt.scienceBonus} Bonus Science XP
                    </span>
                  )}
                  {opt.costPropellantKg && (
                    <span className="text-[11px] font-mono text-orange-400 font-bold block">
                      Requires {opt.costPropellantKg} kg Propellant
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Real-time Telemetry Log Stream */}
        <div className="mt-4 pt-3 border-t border-white/10">
          <div className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
            <Radio className="w-3.5 h-3.5 text-cyan-400" />
            NASA FLIGHT DIRECTOR TELEMETRY STREAM
          </div>
          <div className="h-24 overflow-y-auto font-mono text-xs text-slate-300 space-y-1 bg-[#070D1F] p-3 rounded-xl border border-white/5">
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
