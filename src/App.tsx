import React, { useState, useMemo } from 'react';
import { 
  MissionDesignState, 
  DifficultyLevel, 
  MissionEvaluationReport, 
  CMLStage 
} from './types/mission';
import { NASA_SCENARIOS } from './data/nasaData';
import { calculateEngineeringBudgets } from './utils/engineeringPhysics';
import { soundFx } from './utils/audio';

// Components
import { Header } from './components/Header';
import { ScenarioSelector } from './components/ScenarioSelector';
import { RoleConsole } from './components/RoleConsole';
import { ThreeSpacecraftViewer } from './components/ThreeSpacecraftViewer';
import { SciencePayloadTab } from './components/SubsystemTabs/SciencePayloadTab';
import { SpacecraftBusTab } from './components/SubsystemTabs/SpacecraftBusTab';
import { TrajectoryLaunchTab } from './components/SubsystemTabs/TrajectoryLaunchTab';
import { CommsGroundTab } from './components/SubsystemTabs/CommsGroundTab';
import { SystemsReviewTab } from './components/SubsystemTabs/SystemsReviewTab';
import { MissionSimulation } from './components/MissionSimulation';
import { PostMissionReport } from './components/PostMissionReport';
import { TutorialModal } from './components/TutorialModal';

import { 
  Atom, 
  Cpu, 
  Orbit, 
  Radio, 
  ShieldCheck, 
  Weight, 
  Zap, 
  DollarSign, 
  Award,
  AlertTriangle
} from 'lucide-react';

export function App() {
  const [currentView, setCurrentView] = useState<'selector' | 'design' | 'simulation' | 'report'>('selector');
  const [activeTab, setActiveTab] = useState<'science' | 'bus' | 'trajectory' | 'comms' | 'review'>('science');
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [evaluationReport, setEvaluationReport] = useState<MissionEvaluationReport | null>(null);

  // State of the mission design
  const [state, setState] = useState<MissionDesignState>({
    scenarioId: 'artemis_water_scout',
    missionName: 'Artemis Volatile Scout-1',
    difficulty: 'engineer',
    teamMode: true,
    activeRole: 'director',
    cmlStage: 1,

    selectedInstrumentIds: ['inst_neutron_spectrometer', 'inst_thermal_ir_radiometer'],
    chassisId: 'chassis_smallsat_espa',
    powerSystemId: 'pwr_solar_deployable',
    batterySystemId: 'bat_standard_liion',
    propellantMassKg: 180,
    propulsionSystemId: 'prop_bipropellant',
    adcsSystemId: 'adcs_precision',
    commsSystemId: 'comms_ka_band',
    orbitId: 'lunar_polar_frozen',
    launchVehicleId: 'lv_falcon9',
    groundNetwork: 'Both',
    redundantAvionics: true,
    additionalShieldingKg: 15,

    approvals: {
      director: false,
      payload: true,
      bus: false,
      trajectory: false,
    }
  });

  // Calculate real-time physics and engineering budgets
  const budgets = useMemo(() => {
    return calculateEngineeringBudgets(state);
  }, [state]);

  // Handle Scenario Selection
  const handleSelectScenario = (scenarioId: string, difficulty: DifficultyLevel, teamMode: boolean) => {
    const sc = NASA_SCENARIOS.find(s => s.id === scenarioId) || NASA_SCENARIOS[0];

    // Auto-tune default components best suited for initial point design
    let defChassis = 'chassis_smallsat_espa';
    let defPower = 'pwr_solar_deployable';
    let defProp = 'prop_bipropellant';
    let defOrbit = sc.recommendedOrbit;
    let defLv = 'lv_falcon9';
    let defComms = 'comms_x_band';
    let defFuel = 150;
    let defInsts = ['inst_multispectral_cam'];

    if (sc.type === 'deep_space') {
      defChassis = 'chassis_medium_class';
      defPower = 'pwr_rtg_nextgen';
      defProp = 'prop_bipropellant';
      defLv = 'lv_falcon_heavy';
      defComms = 'comms_ka_band';
      defFuel = 380;
      defInsts = ['inst_subsurface_radar', 'inst_mass_spec', 'inst_fluxgate_magnetometer'];
    } else if (sc.type === 'earth_observation') {
      defChassis = 'chassis_smallsat_espa';
      defPower = 'pwr_solar_deployable';
      defProp = 'prop_hydrazine_mono';
      defLv = 'lv_falcon9';
      defComms = 'comms_ka_band';
      defFuel = 45;
      defInsts = ['inst_hyperspectral_sounder', 'inst_multispectral_cam'];
    } else if (sc.type === 'lunar') {
      defChassis = 'chassis_smallsat_espa';
      defPower = 'pwr_solar_deployable';
      defProp = 'prop_bipropellant';
      defLv = 'lv_falcon9';
      defComms = 'comms_ka_band';
      defFuel = 180;
      defInsts = ['inst_neutron_spectrometer', 'inst_thermal_ir_radiometer', 'inst_laser_altimeter'];
    }

    setState({
      scenarioId,
      missionName: `${sc.title.split(' ')[0]} Exploration Unit`,
      difficulty,
      teamMode,
      activeRole: 'director',
      cmlStage: 2,

      selectedInstrumentIds: defInsts,
      chassisId: defChassis,
      powerSystemId: defPower,
      batterySystemId: 'bat_standard_liion',
      propellantMassKg: defFuel,
      propulsionSystemId: defProp,
      adcsSystemId: 'adcs_precision',
      commsSystemId: defComms,
      orbitId: defOrbit,
      launchVehicleId: defLv,
      groundNetwork: 'Both',
      redundantAvionics: true,
      additionalShieldingKg: sc.environmentHazards.radiation === 'extreme' ? 35 : 10,

      approvals: {
        director: false,
        payload: false,
        bus: false,
        trajectory: false
      }
    });

    setCurrentView('design');
    setActiveTab('science');
  };

  const handleLaunchSimulation = () => {
    setCurrentView('simulation');
  };

  const handleFinishMission = (report: MissionEvaluationReport) => {
    setEvaluationReport(report);
    setCurrentView('report');
  };

  const tabs: {
    id: 'science' | 'bus' | 'trajectory' | 'comms' | 'review';
    title: string;
    icon: React.ReactNode;
    cml: CMLStage;
  }[] = [
    { id: 'science', title: 'Science & Payload', icon: <Atom className="w-4 h-4" />, cml: 2 },
    { id: 'bus', title: 'Spacecraft Bus & Power', icon: <Cpu className="w-4 h-4" />, cml: 3 },
    { id: 'trajectory', title: 'Trajectory & Launch', icon: <Orbit className="w-4 h-4" />, cml: 3 },
    { id: 'comms', title: 'Comms & Ground', icon: <Radio className="w-4 h-4" />, cml: 3 },
    { id: 'review', title: 'Systems Review (LRR)', icon: <ShieldCheck className="w-4 h-4" />, cml: 4 },
  ];

  const handleTabChange = (tabId: typeof activeTab, cml: CMLStage) => {
    soundFx.playClick();
    setActiveTab(tabId);
    setState(prev => ({ ...prev, cmlStage: cml }));
  };

  return (
    <div className="min-h-screen bg-space-950 text-slate-100 flex flex-col font-sans hud-grid selection:bg-cyan-500/30 selection:text-cyan-300">
      
      {/* Global Mission Control Header */}
      <Header
        state={state}
        setState={setState}
        onOpenTutorial={() => setIsTutorialOpen(true)}
        onResetScenario={() => setCurrentView('selector')}
        audioEnabled={audioEnabled}
        setAudioEnabled={setAudioEnabled}
      />

      {/* Main App Content Viewport */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-6 pb-24">
        
        {/* VIEW 1: SCENARIO SELECTOR */}
        {currentView === 'selector' && (
          <ScenarioSelector
            onSelectScenario={handleSelectScenario}
            currentState={state}
          />
        )}

        {/* VIEW 2: MISSION DESIGN LAB (CML 1-4) */}
        {currentView === 'design' && (
          <div className="space-y-6">
            
            {/* Team Roles Console */}
            <RoleConsole state={state} setState={setState} />

            {/* Split Workspace: Left 3D Spacecraft CAD / Right Subsystem Controls */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Left Column: Interactive 3D CAD Spacecraft Visualizer */}
              <div className="lg:col-span-5 sticky top-20 z-10 space-y-4">
                <ThreeSpacecraftViewer state={state} />

                {/* Subsystem Real-Time Margins Card */}
                <div className="p-4 rounded-2xl bg-space-900/80 border border-white/10 backdrop-blur-md text-xs font-mono space-y-2.5">
                  <div className="text-slate-400 uppercase tracking-wider text-[11px] font-bold flex items-center justify-between">
                    <span>Active Flight Margins</span>
                    <span className="text-cyan-400">Live Telemetry</span>
                  </div>

                  <div className="flex justify-between items-center py-1 border-b border-white/5">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Weight className="w-3.5 h-3.5 text-sky-400" /> Wet Mass:
                    </span>
                    <span className="font-bold text-white">
                      {budgets.totalWetMassKg.toFixed(0)} kg ({budgets.massMarginPercent.toFixed(1)}% MGA)
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-1 border-b border-white/5">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-yellow-400" /> Power Generation:
                    </span>
                    <span className="font-bold text-yellow-400">
                      {budgets.powerGeneratedSunlightW.toFixed(0)} W (Margin: +{budgets.powerMarginSunlightW.toFixed(0)} W)
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-1 border-b border-white/5">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <DollarSign className="w-3.5 h-3.5 text-amber-400" /> Budget Cap:
                    </span>
                    <span className="font-bold text-white">
                      ${budgets.totalCostM.toFixed(1)}M / ${budgets.budgetCapM}M
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-1">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5 text-emerald-400" /> Science Yield:
                    </span>
                    <span className="font-bold text-cyan-400">
                      {budgets.totalScienceScore} pts ({budgets.primaryObjectivesMet}/{budgets.totalObjectives} Goals)
                    </span>
                  </div>

                  {budgets.warnings.length > 0 && (
                    <div className="pt-2 text-[11px] text-amber-400 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      <span>{budgets.warnings[0]}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Tabbed Subsystem Design Controllers */}
              <div className="lg:col-span-7 space-y-4">
                
                {/* Discipline Navigation Tabs */}
                <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-space-900/90 border border-white/10 overflow-x-auto">
                  {tabs.map((tab) => {
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => handleTabChange(tab.id, tab.cml)}
                        className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono font-medium whitespace-nowrap transition-all ${
                          isActive
                            ? 'bg-cyan-500 text-space-950 font-bold shadow-glow-cyan'
                            : 'bg-space-950/40 text-slate-400 hover:text-white hover:bg-space-800'
                        }`}
                      >
                        {tab.icon}
                        <span>{tab.title}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Subsystem Tab Panels */}
                <div className="min-h-[500px]">
                  {activeTab === 'science' && (
                    <SciencePayloadTab state={state} setState={setState} budgets={budgets} />
                  )}
                  {activeTab === 'bus' && (
                    <SpacecraftBusTab state={state} setState={setState} budgets={budgets} />
                  )}
                  {activeTab === 'trajectory' && (
                    <TrajectoryLaunchTab state={state} setState={setState} budgets={budgets} />
                  )}
                  {activeTab === 'comms' && (
                    <CommsGroundTab state={state} setState={setState} budgets={budgets} />
                  )}
                  {activeTab === 'review' && (
                    <SystemsReviewTab 
                      state={state} 
                      setState={setState} 
                      budgets={budgets} 
                      onLaunchSimulation={handleLaunchSimulation}
                    />
                  )}
                </div>

              </div>

            </div>

          </div>
        )}

        {/* VIEW 3: LIVE MISSION SIMULATION & ORBIT EXECUTION */}
        {currentView === 'simulation' && (
          <MissionSimulation
            state={state}
            budgets={budgets}
            onFinishMission={handleFinishMission}
            onAbortSimulation={() => setCurrentView('design')}
          />
        )}

        {/* VIEW 4: POST-MISSION NASA EVALUATION REPORT */}
        {currentView === 'report' && evaluationReport && (
          <PostMissionReport
            report={evaluationReport}
            onRedesign={() => {
              setCurrentView('design');
              setActiveTab('review');
            }}
            onNewScenario={() => setCurrentView('selector')}
          />
        )}

      </main>

      {/* Educational Tutorial & Systems Engineering Guide Modal */}
      <TutorialModal
        isOpen={isTutorialOpen}
        onClose={() => setIsTutorialOpen(false)}
      />

    </div>
  );
}

export default App;
