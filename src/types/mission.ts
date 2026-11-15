// Mission Design Game Data Types & Interfaces

export type MissionType = 'lunar' | 'mars' | 'earth_observation' | 'deep_space' | 'custom';

export type DifficultyLevel = 'cadet' | 'engineer' | 'director';

export type CMLStage = 1 | 2 | 3 | 4; // Concept Maturity Level 1 to 4

export type PlayerRole = 'director' | 'payload' | 'bus' | 'trajectory';

export interface Scenario {
  id: string;
  title: string;
  subtitle: string;
  type: MissionType;
  destination: string;
  distanceAU: number; // Astronomical Units from Sun
  targetDistanceKm: number; // Distance from Earth
  primaryObjective: string;
  scientificQuestions: string[];
  recommendedBudgetM: number;
  maxBudgetM: number;
  minScienceTarget: number;
  recommendedOrbit: string;
  image: string;
  nasaInspiration: string;
  realMissionComparison: string;
  environmentHazards: {
    radiation: 'low' | 'moderate' | 'high' | 'extreme';
    thermalSwings: 'moderate' | 'high' | 'extreme';
    commDelaySec: number;
    solarFluxPercent: number; // 100% at 1 AU
  };
}

export interface ScientificInstrument {
  id: string;
  name: string;
  acronym: string;
  category: 'optical' | 'spectroscopy' | 'radar_lidar' | 'particles_fields' | 'in_situ';
  massKg: number;
  powerW: number;
  costM: number;
  dataRateMbps: number; // during operation
  scienceValue: number; // points
  trl: number; // Technology Readiness Level 1-9
  description: string;
  bestFitObjectives: string[];
  operationalDutyCycle: number; // 0.1 to 1.0 (fraction of orbit operating)
}

export interface SpacecraftChassis {
  id: string;
  name: string;
  category: 'cubesat_12u' | 'smallsat_espa' | 'medium_class' | 'flagship';
  dryMassKg: number;
  maxPayloadMassKg: number;
  maxInternalVolumeM3: number;
  costM: number;
  radiationShieldingMm: number; // Al equivalent
  structuralReliability: number; // 0.8 to 0.99
  description: string;
}

export interface PowerSystem {
  id: string;
  name: string;
  type: 'solar_body' | 'solar_deployable' | 'solar_ultraflex' | 'rtg_nextgen';
  basePowerEarthW: number; // power output at 1 AU
  massKg: number;
  costM: number;
  degradationPerYear: number;
  description: string;
  deepSpaceCapable: boolean;
}

export interface BatterySystem {
  id: string;
  name: string;
  capacityWh: number;
  massKg: number;
  costM: number;
  maxDepthOfDischarge: number; // e.g. 0.4 for long life
  description: string;
}

export interface PropulsionSystem {
  id: string;
  name: string;
  type: 'none' | 'cold_gas' | 'hydrazine_mono' | 'bipropellant' | 'hall_ion';
  ispSec: number; // Specific Impulse
  dryMassKg: number;
  maxThrustN: number;
  costM: number;
  fuelType: string;
  description: string;
}

export interface AdcsSystem {
  id: string;
  name: string;
  pointingAccuracyArcsec: number;
  massKg: number;
  powerW: number;
  costM: number;
  components: string[];
  description: string;
}

export interface CommsSystem {
  id: string;
  name: string;
  frequencyBand: 'S-band' | 'X-band' | 'Ka-band' | 'Optical Laser';
  antennaType: 'Patch / Omnidirectional' | 'Medium Gain Horn' | 'High Gain Parabolic Dish' | 'Laser Terminal';
  maxDataRateMbps: number;
  massKg: number;
  powerW: number;
  costM: number;
  groundNetworkReq: 'NSN' | 'DSN' | 'Optical DSN';
  description: string;
}

export interface LaunchVehicle {
  id: string;
  name: string;
  provider: string;
  costM: number;
  fairingDiameterM: number;
  payloadCapacityKg: {
    leo: number;
    sso: number;
    geo: number;
    tli: number; // Trans-Lunar Injection
    tmi: number; // Trans-Mars Injection
    deepSpace: number; // C3 > 0
  };
  reliability: number;
  description: string;
}

export interface OrbitOption {
  id: string;
  name: string;
  altitudeKm: number;
  inclinationDeg: number;
  orbitalPeriodMin: number;
  eclipseFraction: number; // 0.0 to 0.4
  deltaVRequiredMs: number; // Delta-v to insert from transfer
  scienceMultiplier: number;
  groundPassesPerDay: number;
  description: string;
  category: 'leo' | 'sso' | 'geo' | 'lunar' | 'mars' | 'l2' | 'deep_space';
}

export interface MissionDesignState {
  scenarioId: string;
  missionName: string;
  difficulty: DifficultyLevel;
  teamMode: boolean;
  activeRole: PlayerRole;
  cmlStage: CMLStage;
  
  // Selected components
  selectedInstrumentIds: string[];
  chassisId: string;
  powerSystemId: string;
  batterySystemId: string;
  propellantMassKg: number;
  propulsionSystemId: string;
  adcsSystemId: string;
  commsSystemId: string;
  orbitId: string;
  launchVehicleId: string;
  groundNetwork: 'NSN' | 'DSN' | 'Both';
  redundantAvionics: boolean;
  additionalShieldingKg: number;
  
  // Team Approvals (for 4-player collaboration)
  approvals: {
    director: boolean;
    payload: boolean;
    bus: boolean;
    trajectory: boolean;
  };
}

export interface EngineeringBudgets {
  // Mass
  payloadMassKg: number;
  busDryMassKg: number;
  totalDryMassKg: number;
  propellantMassKg: number;
  totalWetMassKg: number;
  launchVehicleMaxCapacityKg: number;
  massMarginKg: number;
  massMarginPercent: number;
  massStatus: 'optimal' | 'warning' | 'critical';

  // Delta-V
  availableDeltaVMs: number;
  requiredDeltaVMs: number;
  deltaVMarginMs: number;
  deltaVStatus: 'optimal' | 'warning' | 'critical';

  // Power
  totalDayPowerConsumptionW: number;
  totalNightPowerConsumptionW: number;
  powerGeneratedSunlightW: number;
  powerMarginSunlightW: number;
  eclipseDurationMin: number;
  energyRequiredInEclipseWh: number;
  batteryDepthOfDischarge: number;
  powerStatus: 'optimal' | 'warning' | 'critical';

  // Comms & Data
  dataGeneratedPerDayGb: number;
  maxDownlinkCapacityPerDayGb: number;
  dataLinkMarginGb: number;
  linkBudgetDb: number;
  commsStatus: 'optimal' | 'warning' | 'critical';

  // Financial
  payloadCostM: number;
  spacecraftCostM: number;
  launchCostM: number;
  operationsCostM: number;
  contingencyReserveM: number;
  totalCostM: number;
  budgetCapM: number;
  remainingBudgetM: number;
  costStatus: 'optimal' | 'warning' | 'critical';

  // Science & Reliability
  totalScienceScore: number;
  primaryObjectivesMet: number;
  totalObjectives: number;
  overallReliabilityScore: number; // 0-100%
  warnings: string[];
  recommendations: string[];
}

export interface SimulationEvent {
  id: string;
  timeSec: number;
  title: string;
  description: string;
  severity: 'info' | 'warning' | 'danger' | 'opportunity';
  options: {
    text: string;
    action: string;
    costPropellantKg?: number;
    costPowerWh?: number;
    scienceBonus?: number;
    riskFactor?: number;
    logMessage: string;
  }[];
}

export interface MissionTelemetry {
  timeSec: number;
  missionPhase: 'prelaunch' | 'launch' | 'separation' | 'cruise' | 'insertion' | 'operations' | 'completed' | 'failed';
  altitudeKm: number;
  velocityKms: number;
  inEclipse: boolean;
  batterySocPercent: number; // 0 - 100
  powerDrawW: number;
  solarInputW: number;
  dataBufferGb: number;
  totalScienceYield: number;
  activeGroundContact: string | null;
  downlinkRateMbps: number;
  spacecraftHealthPercent: number;
  fuelRemainingKg: number;
  log: string[];
}

export interface MissionEvaluationReport {
  missionName: string;
  scenarioTitle: string;
  status: 'FULL_SUCCESS' | 'PARTIAL_SUCCESS' | 'MISSION_FAILURE';
  overallScore: number; // 0 - 1000
  grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
  scienceYieldScore: number;
  engineeringMarginScore: number;
  budgetEfficiencyScore: number;
  riskMitigationScore: number;
  milestonesUnlocked: string[];
  postMissionDebrief: string;
  comparableNasaMission: {
    name: string;
    launchYear: number;
    destination: string;
    keyInstruments: string[];
    costM: number;
    comparisonVerdict: string;
  };
  budgetsSummary: EngineeringBudgets;
}
