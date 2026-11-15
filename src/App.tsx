import React, { useState, useMemo } from 'react';
import { 
  MissionDesignState, 
  MissionEvaluationReport 
} from './types/mission';
import { NASA_SCENARIOS } from './data/nasaData';
import { calculateEngineeringBudgets } from './utils/engineeringPhysics';
import { soundFx } from './utils/audio';

// Simplified Components
import { Header } from './components/Header';
import { ScenarioSelector } from './components/ScenarioSelector';
import { SimpleMissionBuilder } from './components/SimpleMissionBuilder';
import { MissionSimulation } from './components/MissionSimulation';
import { PostMissionReport } from './components/PostMissionReport';
import { TutorialModal } from './components/TutorialModal';

export function App() {
  // Step 1: Destination, Step 2: Build Spacecraft, Step 3: Launch Simulation, Step 4: Mission Results
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isTeamMode, setIsTeamMode] = useState<boolean>(true);
  const [isTutorialOpen, setIsTutorialOpen] = useState<boolean>(false);
  const [audioEnabled, setAudioEnabled] = useState<boolean>(true);
  const [evaluationReport, setEvaluationReport] = useState<MissionEvaluationReport | null>(null);

  // Core Mission Design State
  const [state, setState] = useState<MissionDesignState>({
    scenarioId: 'artemis_water_scout',
    missionName: 'Artemis Water Prospector',
    difficulty: 'engineer',
    teamMode: true,
    activeRole: 'director',
    cmlStage: 2,

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
      director: true,
      payload: true,
      bus: true,
      trajectory: true,
    }
  });

  // Calculate live engineering budgets (mass, power, budget)
  const budgets = useMemo(() => {
    return calculateEngineeringBudgets(state);
  }, [state]);

  const activeScenario = NASA_SCENARIOS.find(s => s.id === state.scenarioId) || NASA_SCENARIOS[0];

  // Step 1 -> Step 2
  const handleSelectScenario = (scenarioId: string) => {
    const sc = NASA_SCENARIOS.find(s => s.id === scenarioId) || NASA_SCENARIOS[0];

    let defPower = 'pwr_solar_deployable';
    let defLv = 'lv_falcon9';
    let defInsts = ['inst_multispectral_cam'];

    if (sc.type === 'deep_space') {
      defPower = 'pwr_rtg_nextgen';
      defLv = 'lv_falcon_heavy';
      defInsts = ['inst_subsurface_radar', 'inst_mass_spec'];
    } else if (sc.type === 'lunar') {
      defPower = 'pwr_solar_deployable';
      defLv = 'lv_falcon9';
      defInsts = ['inst_neutron_spectrometer', 'inst_thermal_ir_radiometer'];
    } else if (sc.type === 'earth_observation') {
      defPower = 'pwr_solar_deployable';
      defLv = 'lv_falcon9';
      defInsts = ['inst_hyperspectral_sounder', 'inst_multispectral_cam'];
    } else if (sc.type === 'mars') {
      defPower = 'pwr_solar_ultraflex';
      defLv = 'lv_falcon9';
      defInsts = ['inst_subsurface_radar', 'inst_multispectral_cam'];
    }

    setState(prev => ({
      ...prev,
      scenarioId,
      missionName: `${sc.title.split(' ')[0]} Explorer Unit`,
      orbitId: sc.recommendedOrbit,
      powerSystemId: defPower,
      launchVehicleId: defLv,
      selectedInstrumentIds: defInsts,
      cmlStage: 2
    }));

    setCurrentStep(2);
  };

  // Step 2 -> Step 3
  const handleStartSimulation = () => {
    setCurrentStep(3);
  };

  // Step 3 -> Step 4
  const handleFinishMission = (report: MissionEvaluationReport) => {
    setEvaluationReport(report);
    setCurrentStep(4);
  };

  const handleToggleAudio = () => {
    const next = !audioEnabled;
    soundFx.enabled = next;
    setAudioEnabled(next);
    if (next) soundFx.playQuindarBeep('intro');
  };

  return (
    <div className="min-h-screen bg-[#070B19] text-slate-100 flex flex-col font-sans nasa-grid">
      
      {/* Clean NASA Header */}
      <Header
        currentStep={currentStep}
        onStepChange={setCurrentStep}
        scenarioTitle={activeScenario.title}
        isTeamMode={isTeamMode}
        onToggleTeamMode={() => setIsTeamMode(!isTeamMode)}
        onOpenHelp={() => setIsTutorialOpen(true)}
        audioEnabled={audioEnabled}
        onToggleAudio={handleToggleAudio}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-6xl mx-auto p-4 md:p-6 pb-20">
        
        {/* STEP 1: DESTINATION SELECTION */}
        {currentStep === 1 && (
          <ScenarioSelector
            onSelectScenario={handleSelectScenario}
            selectedId={state.scenarioId}
            isTeamMode={isTeamMode}
          />
        )}

        {/* STEP 2: BUILD SPACECRAFT (SIMPLIFIED) */}
        {currentStep === 2 && (
          <SimpleMissionBuilder
            state={state}
            setState={setState}
            budgets={budgets}
            onLaunch={handleStartSimulation}
            isTeamMode={isTeamMode}
          />
        )}

        {/* STEP 3: FLIGHT SIMULATION & ORBIT */}
        {currentStep === 3 && (
          <MissionSimulation
            state={state}
            budgets={budgets}
            onFinishMission={handleFinishMission}
            onAbortSimulation={() => setCurrentStep(2)}
          />
        )}

        {/* STEP 4: MISSION RESULTS & NASA EVALUATION */}
        {currentStep === 4 && evaluationReport && (
          <PostMissionReport
            report={evaluationReport}
            onRedesign={() => setCurrentStep(2)}
            onNewScenario={() => setCurrentStep(1)}
          />
        )}

      </main>

      {/* Flight Manual / Guide Modal */}
      <TutorialModal
        isOpen={isTutorialOpen}
        onClose={() => setIsTutorialOpen(false)}
      />

    </div>
  );
}

export default App;
