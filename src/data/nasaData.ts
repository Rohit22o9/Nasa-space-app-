import {
  Scenario,
  ScientificInstrument,
  SpacecraftChassis,
  PowerSystem,
  BatterySystem,
  PropulsionSystem,
  AdcsSystem,
  CommsSystem,
  LaunchVehicle,
  OrbitOption
} from '../types/mission';

export const NASA_SCENARIOS: Scenario[] = [
  {
    id: 'artemis_water_scout',
    title: 'Artemis Lunar South Pole Ice Prospector',
    subtitle: 'High-Priority Lunar Resource Characterization',
    type: 'lunar',
    destination: 'Moon South Pole (Shackleton Rim & Shoemaker Crater)',
    distanceAU: 1.0,
    targetDistanceKm: 384400,
    primaryObjective: 'Detect and map sub-surface water ice & volatile traps in Permanently Shadowed Regions (PSRs) to support Artemis crewed basecamps.',
    scientificQuestions: [
      'What is the volumetric concentration and depth profile of hydrogen/water ice in lunar PSRs?',
      'What are the extreme thermal and dielectric characteristics of cryogenic lunar regolith down to 40 Kelvin?',
      'Can volatile extraction zones be safely accessed by future Artemis autonomous rovers?'
    ],
    recommendedBudgetM: 320,
    maxBudgetM: 420,
    minScienceTarget: 400,
    recommendedOrbit: 'lunar_polar_frozen',
    image: 'moon',
    nasaInspiration: 'NASA VIPER, Lunar Reconnaissance Orbiter (LRO), & Lunar Flashlight',
    realMissionComparison: 'Lunar Reconnaissance Orbiter (LRO) & ShadowCam',
    environmentHazards: {
      radiation: 'moderate',
      thermalSwings: 'extreme', // +120°C in sun to -240°C in shadowed craters
      commDelaySec: 1.3,
      solarFluxPercent: 100
    }
  },
  {
    id: 'europa_ocean_explorer',
    title: 'Europa Astrobiology Ocean Plume Explorer',
    subtitle: 'Jupiter System Outer Planet Flagship',
    type: 'deep_space',
    destination: 'Jupiter Orbit (Resonant Europa Multiple Flybys)',
    distanceAU: 5.2,
    targetDistanceKm: 628700000,
    primaryObjective: 'Sample cryovolcanic water vapour plumes, analyze organic compounds, and confirm the depth and salinity of Europa\'s subsurface liquid ocean.',
    scientificQuestions: [
      'Do the cryovolcanic vapor plumes contain complex prebiotic carbon compounds, amino acids, or biosignatures?',
      'What is the thickness of Europa’s ice crust and the salinity/conductivity of the underlying ocean?',
      'How does the intense Jovian magnetosphere bombard and oxidize surface organics?'
    ],
    recommendedBudgetM: 850,
    maxBudgetM: 1100,
    minScienceTarget: 600,
    recommendedOrbit: 'europa_flyby_resonance',
    image: 'europa',
    nasaInspiration: 'NASA Europa Clipper & ESA JUICE',
    realMissionComparison: 'NASA Europa Clipper ($4.25B flagship)',
    environmentHazards: {
      radiation: 'extreme', // Millions of rads inside Jovian radiation belts!
      thermalSwings: 'high',
      commDelaySec: 2700, // 45 minutes round trip
      solarFluxPercent: 3.7 // Only 3.7% solar flux compared to Earth!
    }
  },
  {
    id: 'earth_climate_sentinel',
    title: 'Earth Climate & Hyper-Resolution Sentinel',
    subtitle: 'Global Carbon & Extreme Weather Monitoring',
    type: 'earth_observation',
    destination: 'Sun-Synchronous Low Earth Orbit (SSO)',
    distanceAU: 1.0,
    targetDistanceKm: 705,
    primaryObjective: 'Provide daily global hyperspectral imaging of atmospheric CO2/methane plumes, wildfire front dynamics, and polar ice sheet calving.',
    scientificQuestions: [
      'What are the localized point-source greenhouse emission rates across megacities and industrial centers?',
      'How fast are polar ice shelves calving and thinning on sub-weekly temporal baselines?',
      'Can wildfire thermal hotspots be detected within 15 minutes to direct emergency response?'
    ],
    recommendedBudgetM: 180,
    maxBudgetM: 240,
    minScienceTarget: 350,
    recommendedOrbit: 'sso_polar_705',
    image: 'earth',
    nasaInspiration: 'NASA PACE, Landsat-9, & EMIT on ISS',
    realMissionComparison: 'NASA PACE & Landsat-9',
    environmentHazards: {
      radiation: 'low',
      thermalSwings: 'moderate',
      commDelaySec: 0.05,
      solarFluxPercent: 100
    }
  },
  {
    id: 'exoplanet_stargazer_l2',
    title: 'Exoplanet Atmospheric Deep Field Observatory',
    subtitle: 'Sun-Earth Lagrange Point 2 (L2) Cryogenic Telescope',
    type: 'deep_space',
    destination: 'Sun-Earth L2 Halo Orbit (1.5M km from Earth)',
    distanceAU: 1.01,
    targetDistanceKm: 1500000,
    primaryObjective: 'Perform transmission spectroscopy of Earth-sized exoplanets in the habitable zones of M-dwarf and G-type stars to search for atmospheric ozone, oxygen, and methane.',
    scientificQuestions: [
      'Are water vapor, carbon dioxide, and biosignature biomarkers present in TRAPPIST-1 terrestrial atmospheres?',
      'What are the thermal phase curves and weather patterns on transiting exoplanets?',
      'Can high-contrast starlight suppression reveal direct reflected light from nearby rocky worlds?'
    ],
    recommendedBudgetM: 950,
    maxBudgetM: 1300,
    minScienceTarget: 750,
    recommendedOrbit: 'l2_halo',
    image: 'space',
    nasaInspiration: 'NASA James Webb Space Telescope (JWST) & Nancy Grace Roman',
    realMissionComparison: 'James Webb Space Telescope (JWST)',
    environmentHazards: {
      radiation: 'moderate',
      thermalSwings: 'extreme', // Permanent sun-side / cold-side delta of 300K!
      commDelaySec: 5.0,
      solarFluxPercent: 98
    }
  },
  {
    id: 'mars_biosphere_searcher',
    title: 'Mars Subsurface Geochemistry & Life Searcher',
    subtitle: 'Areocentric Orbit with Radar Sounder & Atmospheric Sniffer',
    type: 'mars',
    destination: 'Mars Sun-Synchronous Polar Orbit',
    distanceAU: 1.52,
    targetDistanceKm: 225000000,
    primaryObjective: 'Map sub-surface liquid brines beneath polar layered deposits and trace seasonal methane atmospheric spikes to localized geological or biological vents.',
    scientificQuestions: [
      'Are localized seasonal methane spikes produced by subsurface serpentinization or microbial methanogens?',
      'At what depth do basal liquid water reservoirs exist under the Martian South Polar ice cap?',
      'What are the global atmospheric escape rates driven by solar wind sputtering?'
    ],
    recommendedBudgetM: 480,
    maxBudgetM: 650,
    minScienceTarget: 520,
    recommendedOrbit: 'mars_aerocentric_polar',
    image: 'mars',
    nasaInspiration: 'NASA Mars Reconnaissance Orbiter (MRO) & MAVEN',
    realMissionComparison: 'Mars Reconnaissance Orbiter & ExoMars Trace Gas Orbiter',
    environmentHazards: {
      radiation: 'high',
      thermalSwings: 'high',
      commDelaySec: 800, // 13-20 minutes
      solarFluxPercent: 43 // 43% solar flux compared to Earth
    }
  }
];

export const NASA_INSTRUMENTS: ScientificInstrument[] = [
  {
    id: 'inst_multispectral_cam',
    name: 'High-Resolution Multispectral Imager',
    acronym: 'HR-MSI',
    category: 'optical',
    massKg: 38,
    powerW: 65,
    costM: 28,
    dataRateMbps: 120,
    scienceValue: 130,
    trl: 9,
    description: '0.25m aperture visible-to-near-IR push-broom camera delivering sub-meter surface geomorphology and composition mapping.',
    bestFitObjectives: ['Detect volatile traps', 'surface geomorphology', 'wildfire front dynamics', 'polar ice sheet calving'],
    operationalDutyCycle: 0.35
  },
  {
    id: 'inst_hyperspectral_sounder',
    name: 'Infrared Hyperspectral Atmospheric Sounder',
    acronym: 'IR-HAS',
    category: 'spectroscopy',
    massKg: 46,
    powerW: 85,
    costM: 39,
    dataRateMbps: 85,
    scienceValue: 165,
    trl: 8,
    description: 'Cryo-cooled grating spectrometer spanning 0.4 - 2.5 µm to resolve greenhouse gas columns (CO2, CH4), mineralogy, and aerosol optical depth.',
    bestFitObjectives: ['greenhouse emission rates', 'methane atmospheric spikes', 'mineralogy', 'atmospheric ozone'],
    operationalDutyCycle: 0.5
  },
  {
    id: 'inst_subsurface_radar',
    name: 'Sub-Surface Sounding Synthetic Aperture Radar',
    acronym: 'SS-SAR',
    category: 'radar_lidar',
    massKg: 82,
    powerW: 240,
    costM: 68,
    dataRateMbps: 180,
    scienceValue: 220,
    trl: 7,
    description: 'High-power HF/VHF sounding radar penetrating up to 3 km through dielectric ice/regolith to detect buried ice layers and liquid aquifers.',
    bestFitObjectives: ['depth profile of hydrogen/water ice', 'thickness of Europa’s ice crust', 'basal liquid water reservoirs'],
    operationalDutyCycle: 0.2
  },
  {
    id: 'inst_mass_spec',
    name: 'Neutral & Ion Mass Spectrometer',
    acronym: 'NIMS-Plume',
    category: 'in_situ',
    massKg: 24,
    powerW: 42,
    costM: 35,
    dataRateMbps: 12,
    scienceValue: 190,
    trl: 8,
    description: 'Quadrupole ion trap mass spectrometer with gas inlet to measure isotopic ratios, volatile organics, amino acids, and noble gas fractions in plumes or exospheres.',
    bestFitObjectives: ['prebiotic carbon compounds', 'volatile extraction zones', 'seasonal methane spikes'],
    operationalDutyCycle: 0.4
  },
  {
    id: 'inst_neutron_spectrometer',
    name: 'Pulsed Neutron & Gamma-Ray Spectrometer',
    acronym: 'PNGS-Ice',
    category: 'spectroscopy',
    massKg: 19,
    powerW: 32,
    costM: 22,
    dataRateMbps: 4,
    scienceValue: 140,
    trl: 9,
    description: 'Direct epithermal neutron leakage detector capable of quantifying water-equivalent hydrogen (WEH) down to 1 meter beneath the surface.',
    bestFitObjectives: ['volumetric concentration and depth profile of hydrogen', 'water-equivalent hydrogen'],
    operationalDutyCycle: 0.9
  },
  {
    id: 'inst_fluxgate_magnetometer',
    name: 'Dual-Sensor Fluxgate Magnetometer Boom',
    acronym: 'MAG-Boom',
    category: 'particles_fields',
    massKg: 9,
    powerW: 14,
    costM: 15,
    dataRateMbps: 1.5,
    scienceValue: 110,
    trl: 9,
    description: 'Deployable 5m carbon-fiber boom with inner and outer vector sensors to measure induced planetary magnetic dipoles and conduct ocean sounding.',
    bestFitObjectives: ['salinity/conductivity of the underlying ocean', 'solar wind sputtering', 'dielectric characteristics'],
    operationalDutyCycle: 1.0
  },
  {
    id: 'inst_thermal_ir_radiometer',
    name: 'Cryogenic Thermal-IR Radiometer',
    acronym: 'TIR-Cryo',
    category: 'optical',
    massKg: 28,
    powerW: 55,
    costM: 32,
    dataRateMbps: 45,
    scienceValue: 150,
    trl: 8,
    description: 'Multi-channel uncooled microbolometer array mapping thermophysical inertia and surface brightness temperatures from 40 K to 380 K.',
    bestFitObjectives: ['extreme thermal and dielectric characteristics', 'wildfire thermal hotspots', 'thermal phase curves'],
    operationalDutyCycle: 0.6
  },
  {
    id: 'inst_laser_altimeter',
    name: 'Topographic Mapping Laser Altimeter',
    acronym: 'LOLA-II',
    category: 'radar_lidar',
    massKg: 34,
    powerW: 75,
    costM: 36,
    dataRateMbps: 25,
    scienceValue: 135,
    trl: 9,
    description: 'Five-beam pulsed Nd:YAG laser providing 10 cm vertical precision surface elevation, crater slope roughness, and reflectance mapping.',
    bestFitObjectives: ['safely accessed by future Artemis', 'calving and thinning', 'crater slope roughness'],
    operationalDutyCycle: 0.5
  },
  {
    id: 'inst_coronagraph_exoplanet',
    name: 'High-Contrast Extreme Coronagraph & Starlight Suppressor',
    acronym: 'Exo-Corona',
    category: 'optical',
    massKg: 115,
    powerW: 160,
    costM: 110,
    dataRateMbps: 75,
    scienceValue: 310,
    trl: 6,
    description: 'Deformable wavefront control optical bench delivering 10^-9 starlight contrast ratio for direct spectroscopic imaging of habitable exoplanets.',
    bestFitObjectives: ['direct reflected light from nearby rocky worlds', 'TRAPPIST-1 terrestrial atmospheres', 'biosignature biomarkers'],
    operationalDutyCycle: 0.7
  }
];

export const NASA_CHASSIS: SpacecraftChassis[] = [
  {
    id: 'chassis_cubesat_12u',
    name: 'CubeSat 12U Modular Bus',
    category: 'cubesat_12u',
    dryMassKg: 22,
    maxPayloadMassKg: 18,
    maxInternalVolumeM3: 0.024,
    costM: 14,
    radiationShieldingMm: 2.5,
    structuralReliability: 0.88,
    description: 'Standardized 12U structure (20x20x34 cm) for low-cost, rideshare-friendly university or precursor explorer missions.'
  },
  {
    id: 'chassis_smallsat_espa',
    name: 'SmallSat ESPA-Grande Class Bus',
    category: 'smallsat_espa',
    dryMassKg: 145,
    maxPayloadMassKg: 180,
    maxInternalVolumeM3: 0.45,
    costM: 36,
    radiationShieldingMm: 6.0,
    structuralReliability: 0.94,
    description: 'Industry-standard ESPA ring compatible bus. Highly balanced volume-to-mass ratio for planetary explorers and Discovery-class missions.'
  },
  {
    id: 'chassis_medium_class',
    name: 'Medium Exploration Class Hex-Bus',
    category: 'medium_class',
    dryMassKg: 380,
    maxPayloadMassKg: 420,
    maxInternalVolumeM3: 1.6,
    costM: 78,
    radiationShieldingMm: 12.0,
    structuralReliability: 0.97,
    description: 'Robust aerospace-grade aluminum honeycomb and CFRP monocoque chassis engineered for deep-space interplanetary transfers and radiation belts.'
  },
  {
    id: 'chassis_flagship',
    name: 'Planetary Flagship Heavy Science Platform',
    category: 'flagship',
    dryMassKg: 850,
    maxPayloadMassKg: 1100,
    maxInternalVolumeM3: 4.8,
    costM: 155,
    radiationShieldingMm: 24.0, // Heavy tantalum/vault shielding for Jupiter
    structuralReliability: 0.99,
    description: 'Radiation-vault armored flagship bus built for decades of operation in the harshest cosmic environments with quadruple fault tolerance.'
  }
];

export const NASA_POWER_SYSTEMS: PowerSystem[] = [
  {
    id: 'pwr_solar_body',
    name: 'Body-Mounted Silicon Solar Cells',
    type: 'solar_body',
    basePowerEarthW: 90,
    massKg: 8,
    costM: 4,
    degradationPerYear: 0.035,
    description: 'Rigid body-mounted panels with zero deployment risk, but limited surface area and power generation.',
    deepSpaceCapable: false
  },
  {
    id: 'pwr_solar_deployable',
    name: 'Deployable Dual-Wing GaAs Solar Arrays',
    type: 'solar_deployable',
    basePowerEarthW: 550,
    massKg: 34,
    costM: 18,
    degradationPerYear: 0.02,
    description: 'High-efficiency 30% triple-junction GaAs solar panels with motorized single-axis sun-tracking drive.',
    deepSpaceCapable: false
  },
  {
    id: 'pwr_solar_ultraflex',
    name: 'MegaFlex Deployable Circular Solar Wings',
    type: 'solar_ultraflex',
    basePowerEarthW: 1600,
    massKg: 88,
    costM: 44,
    degradationPerYear: 0.015,
    description: 'Ultra-lightweight unfolding fan solar arrays (as used on Orion and Lucy) capable of generating usable power up to Jupiter distances with large wing area.',
    deepSpaceCapable: true
  },
  {
    id: 'pwr_rtg_nextgen',
    name: 'Next-Gen Radioisotope Thermoelectric Generator (eMMRTG)',
    type: 'rtg_nextgen',
    basePowerEarthW: 500, // Constant power regardless of distance or eclipse!
    massKg: 52,
    costM: 95,
    degradationPerYear: 0.008, // Decays slowly over 20+ years via Plutonium-238 alpha decay
    description: 'Plutonium-238 heat source delivering continuous 500W power independent of solar distance, shadow, or dust storms. Essential for outer planets and lunar nights!',
    deepSpaceCapable: true
  }
];

export const NASA_BATTERIES: BatterySystem[] = [
  {
    id: 'bat_standard_liion',
    name: 'High-Energy Li-Ion Battery Pack (450 Wh)',
    capacityWh: 450,
    massKg: 8,
    costM: 5,
    maxDepthOfDischarge: 0.5,
    description: 'Standard space-grade lithium-ion cell module with integrated thermal heaters and cell-balancing circuitry.'
  },
  {
    id: 'bat_expanded_liion',
    name: 'Extended Deep-Cycle Li-Ion Storage (1,400 Wh)',
    capacityWh: 1400,
    massKg: 22,
    costM: 14,
    maxDepthOfDischarge: 0.4,
    description: 'Redundant cell topology with 30,000 cycle capability, capable of handling long orbital eclipses.'
  },
  {
    id: 'bat_heavy_supercap',
    name: 'Solid-State Extreme Energy Buffer (3,800 Wh)',
    capacityWh: 3800,
    massKg: 54,
    costM: 32,
    maxDepthOfDischarge: 0.35,
    description: 'Radiation-hardened solid-state electrolyte battery for high-pulse science instruments (SAR, radar) and multi-hour planetary shadow passes.'
  }
];

export const NASA_PROPULSION: PropulsionSystem[] = [
  {
    id: 'prop_none',
    name: 'No Primary Propulsion (Passive Orbit / Rideshare Insertion)',
    type: 'none',
    ispSec: 0,
    dryMassKg: 0,
    maxThrustN: 0,
    costM: 0,
    fuelType: 'None',
    description: 'Rely solely on launch vehicle upper stage for orbital delivery. Zero orbital maneuver capability.'
  },
  {
    id: 'prop_cold_gas',
    name: 'Cold Gas (GN2) Attitude & Orbit Trim',
    type: 'cold_gas',
    ispSec: 68,
    dryMassKg: 6,
    maxThrustN: 2,
    costM: 4,
    fuelType: 'Nitrogen Gas',
    description: 'Simple, non-toxic pressurized nitrogen thrusters for CubeSat desaturation and minor station-keeping.'
  },
  {
    id: 'prop_hydrazine_mono',
    name: 'Hydrazine Monopropellant System',
    type: 'hydrazine_mono',
    ispSec: 235,
    dryMassKg: 28,
    maxThrustN: 22,
    costM: 18,
    fuelType: 'Hydrazine (N2H4)',
    description: 'Flight-proven catalytic decomposition thruster system providing rapid high-thrust burns for trajectory correction maneuvers.'
  },
  {
    id: 'prop_bipropellant',
    name: 'High-Performance Dual-Mode Bipropellant (MMH/NTO)',
    type: 'bipropellant',
    ispSec: 322,
    dryMassKg: 58,
    maxThrustN: 450,
    costM: 38,
    fuelType: 'MMH / N2O4',
    description: 'High-thrust main engine capable of heavy Lunar or Mars Orbit Insertion (LOI/MOI) burns with high fuel efficiency.'
  },
  {
    id: 'prop_hall_ion',
    name: 'NEXT-C High-Efficiency Xenon Hall-Effect Ion Thruster',
    type: 'hall_ion',
    ispSec: 3450, // Massive Isp!
    dryMassKg: 42,
    maxThrustN: 0.25, // Very low thrust, requires long continuous burns
    costM: 48,
    fuelType: 'Xenon Gas',
    description: 'Electric propulsion delivering extraordinary fuel economy (Isp 3,450 s). Ideal for deep-space interplanetary cruise, but consumes 1,200W electrical power during burns.'
  }
];

export const NASA_ADCS: AdcsSystem[] = [
  {
    id: 'adcs_basic',
    name: '3-Axis Reaction Wheels + Coarse Sun Sensors',
    pointingAccuracyArcsec: 180, // ~3 arcminutes
    massKg: 12,
    powerW: 24,
    costM: 9,
    components: ['3x Reaction Wheels', 'Sun Sensors', '3-axis Magnetometer'],
    description: 'Standard 3-axis pointing suitable for non-pointing instruments, wide-angle earth observation, or communication alignment.'
  },
  {
    id: 'adcs_precision',
    name: 'Precision Dual Star Trackers + IMU + Reaction Wheels',
    pointingAccuracyArcsec: 8,
    massKg: 26,
    powerW: 48,
    costM: 26,
    components: ['Autonomous Star Trackers', '4x Skewed Reaction Wheels', 'Ring Laser Gyro IMU'],
    description: 'High-precision pointing platform for sub-meter high-resolution planetary cameras and narrow-beam Ka-band comms.'
  },
  {
    id: 'adcs_ultra_stable',
    name: 'Sub-Arcsecond Micro-Vibration Isolated Optical ADCS',
    pointingAccuracyArcsec: 0.05,
    massKg: 52,
    powerW: 95,
    costM: 62,
    components: ['Fine Guidance Sensors (FGS)', 'Magnetic Levitation Reaction Wheels', 'Active Micro-Vibration Isolation Mounts'],
    description: 'Observatory-grade ultra-quiet pointing system required for exoplanet starlight nulling coronagraphs and deep-space space telescopes.'
  }
];

export const NASA_COMMS: CommsSystem[] = [
  {
    id: 'comms_s_band',
    name: 'S-Band Omnidirectional Patch Antenna System',
    frequencyBand: 'S-band',
    antennaType: 'Patch / Omnidirectional',
    maxDataRateMbps: 1.5,
    massKg: 6,
    powerW: 20,
    costM: 6,
    groundNetworkReq: 'NSN',
    description: 'Broad-beam low data rate link for critical telemetry and command uplink (TT&C). Failsafe and works in any spacecraft attitude.'
  },
  {
    id: 'comms_x_band',
    name: 'X-Band Gimbaled High-Gain Parabolic Dish (1.2m)',
    frequencyBand: 'X-band',
    antennaType: 'High Gain Parabolic Dish',
    maxDataRateMbps: 25,
    massKg: 22,
    powerW: 75,
    costM: 21,
    groundNetworkReq: 'DSN',
    description: 'The backbone of deep-space communications. Reliable multi-megabit telemetry link to NASA Deep Space Network 34m/70m dishes.'
  },
  {
    id: 'comms_ka_band',
    name: 'Ka-Band Deep-Space High-Throughput Reflector (2.4m)',
    frequencyBand: 'Ka-band',
    antennaType: 'High Gain Parabolic Dish',
    maxDataRateMbps: 150,
    massKg: 44,
    powerW: 140,
    costM: 38,
    groundNetworkReq: 'DSN',
    description: 'Gigabit-class RF downlink for radar and hyperspectral imagery. Requires tight pointing within 0.05 degrees.'
  },
  {
    id: 'comms_optical_laser',
    name: 'Deep Space Optical Communications (DSOC) Laser Terminal',
    frequencyBand: 'Optical Laser',
    antennaType: 'Laser Terminal',
    maxDataRateMbps: 600,
    massKg: 35,
    powerW: 110,
    costM: 58,
    groundNetworkReq: 'Optical DSN',
    description: 'Next-generation 1550nm near-infrared laser communication providing 10x-100x higher data rates from deep space to Earth optical receiving telescopes.'
  }
];

export const NASA_LAUNCH_VEHICLES: LaunchVehicle[] = [
  {
    id: 'lv_electron',
    name: 'Rocket Lab Electron',
    provider: 'Rocket Lab',
    costM: 8.5,
    fairingDiameterM: 1.2,
    payloadCapacityKg: {
      leo: 300,
      sso: 220,
      geo: 0,
      tli: 35,
      tmi: 0,
      deepSpace: 0
    },
    reliability: 0.94,
    description: 'Dedicated dedicated small rocket with Curie / kick stage for responsive, dedicated CubeSat or SmallSat insertion.'
  },
  {
    id: 'lv_falcon9',
    name: 'SpaceX Falcon 9 (Recoverable)',
    provider: 'SpaceX',
    costM: 67,
    fairingDiameterM: 5.2,
    payloadCapacityKg: {
      leo: 17500,
      sso: 14000,
      geo: 5500,
      tli: 4000,
      tmi: 2800,
      deepSpace: 1600
    },
    reliability: 0.99,
    description: 'Workhorse heavy-medium launch vehicle with extraordinary flight cadence and reliability for LEO, Lunar, and inner solar system missions.'
  },
  {
    id: 'lv_falcon_heavy',
    name: 'SpaceX Falcon Heavy (Expendable/Partial)',
    provider: 'SpaceX',
    costM: 130,
    fairingDiameterM: 5.2,
    payloadCapacityKg: {
      leo: 63800,
      sso: 45000,
      geo: 26700,
      tli: 18000,
      tmi: 16800,
      deepSpace: 9500
    },
    reliability: 0.98,
    description: 'Triple-core heavy lift launcher delivering massive payloads to Trans-Mars, Trans-Jupiter, and Sun-Earth L2 Lagrange points.'
  },
  {
    id: 'lv_sls_block1',
    name: 'NASA Space Launch System (SLS Block 1)',
    provider: 'NASA / Boeing / Aerojet',
    costM: 850,
    fairingDiameterM: 8.4,
    payloadCapacityKg: {
      leo: 95000,
      sso: 75000,
      geo: 42000,
      tli: 27000,
      tmi: 22000,
      deepSpace: 14000
    },
    reliability: 0.99,
    description: 'Super-heavy human-rated launch vehicle with highest direct injection energy (C3) for outer planet probes without gravitational assists.'
  },
  {
    id: 'lv_smallsat_rideshare',
    name: 'Commercial SmallSat Rideshare (Transporter Plate)',
    provider: 'Multiple Providers / Transporter',
    costM: 3.5,
    fairingDiameterM: 0.6,
    payloadCapacityKg: {
      leo: 200,
      sso: 180,
      geo: 0,
      tli: 0,
      tmi: 0,
      deepSpace: 0
    },
    reliability: 0.96,
    description: 'Shared piggyback ride on a large booster. Extremely low cost, but restricted to standard Sun-Synchronous LEO orbital parameters.'
  }
];

export const NASA_ORBITS: OrbitOption[] = [
  {
    id: 'sso_polar_705',
    name: 'Sun-Synchronous Polar LEO (705 km, 98.2°)',
    altitudeKm: 705,
    inclinationDeg: 98.2,
    orbitalPeriodMin: 98.8,
    eclipseFraction: 0.34,
    deltaVRequiredMs: 120, // Maneuver margin
    scienceMultiplier: 1.2,
    groundPassesPerDay: 14,
    description: 'Consistent lighting angle at 10:30 AM local solar time. Ideal for global repetitive Earth observation, climate imaging, and agricultural monitoring.',
    category: 'sso'
  },
  {
    id: 'lunar_polar_frozen',
    name: 'Lunar Polar Low Frozen Orbit (100 km, 90°)',
    altitudeKm: 100,
    inclinationDeg: 90.0,
    orbitalPeriodMin: 118.0,
    eclipseFraction: 0.42,
    deltaVRequiredMs: 850, // Lunar Orbit Insertion
    scienceMultiplier: 1.6,
    groundPassesPerDay: 8,
    description: 'Circumpolar trajectory passing over permanently shadowed craters at the Moon\'s South Pole every 2 hours with stable pericenter.',
    category: 'lunar'
  },
  {
    id: 'europa_flyby_resonance',
    name: 'Jupiter Highly Elliptical Resonant Orbit (50+ Europa Flybys)',
    altitudeKm: 25, // Close flyby altitude at closest approach
    inclinationDeg: 12.5,
    orbitalPeriodMin: 20160, // 14-day resonant orbit
    eclipseFraction: 0.08,
    deltaVRequiredMs: 1450, // Jupiter Orbit Insertion & tour shaping
    scienceMultiplier: 2.2,
    groundPassesPerDay: 2,
    description: 'Minimizes accumulated ionizing radiation dosage inside Jupiter’s core radiation belt while providing ultra-close skimming passes of Europa plumes.',
    category: 'deep_space'
  },
  {
    id: 'mars_aerocentric_polar',
    name: 'Mars Sun-Synchronous Polar Science Orbit (400 km, 93°)',
    altitudeKm: 400,
    inclinationDeg: 93.0,
    orbitalPeriodMin: 117.0,
    eclipseFraction: 0.38,
    deltaVRequiredMs: 1100, // Mars Orbit Insertion
    scienceMultiplier: 1.5,
    groundPassesPerDay: 6,
    description: 'High-inclination mapping orbit covering 100% of the Martian surface and both polar ice caps every 16 Martian sols.',
    category: 'mars'
  },
  {
    id: 'l2_halo',
    name: 'Sun-Earth Lagrange L2 Quasi-Halo Orbit',
    altitudeKm: 1500000,
    inclinationDeg: 0,
    orbitalPeriodMin: 262800, // 6-month halo period
    eclipseFraction: 0.0, // Zero eclipse! Continuous unshadowed sunlight for sunshield
    deltaVRequiredMs: 380, // Halo station keeping
    scienceMultiplier: 2.0,
    groundPassesPerDay: 3,
    description: 'Thermally ultra-stable deep space halo orbit 1.5M km anti-sunward from Earth. Free from terrestrial thermal reflection and orbital eclipses.',
    category: 'l2'
  }
];

export const NASA_HISTORIC_MISSIONS = {
  artemis_water_scout: {
    name: 'Lunar Reconnaissance Orbiter (LRO) & ShadowCam',
    launchYear: 2009,
    destination: 'Lunar Polar Orbit',
    keyInstruments: ['LOLA Laser Altimeter', 'LEND Neutron Detector', 'LROC Cameras', 'Diviner Radiometer'],
    costM: 504,
    comparisonVerdict: 'LRO transformed our knowledge of lunar volatiles. Your design leverages modern high-efficiency electronics and rideshare launch to achieve comparable science at competitive costs!'
  },
  europa_ocean_explorer: {
    name: 'NASA Europa Clipper',
    launchYear: 2024,
    destination: 'Jupiter System Flybys',
    keyInstruments: ['REASON Radar', 'MASPEX Mass Spectrometer', 'Europa-UVS', 'MISE Infrared'],
    costM: 5200,
    comparisonVerdict: 'Europa Clipper is NASA’s largest planetary spacecraft with colossal 30-meter solar wings. Your architecture captures the critical trade-offs between radiation shielding and flyby cadence!'
  },
  earth_climate_sentinel: {
    name: 'NASA PACE (Plankton, Aerosol, Cloud, ocean Ecosystem)',
    launchYear: 2024,
    destination: 'Sun-Synchronous Orbit (676 km)',
    keyInstruments: ['Ocean Color Instrument (OCI)', 'HARP2 Polarimeter', 'SPEXone Polarimeter'],
    costM: 964,
    comparisonVerdict: 'PACE delivers unprecedented hyperspectral insight into ocean-atmosphere carbon exchange. Your satellite configuration balances the enormous downlink requirements with solid-state storage!'
  },
  exoplanet_stargazer_l2: {
    name: 'James Webb Space Telescope (JWST)',
    launchYear: 2021,
    destination: 'Sun-Earth L2 Halo Orbit',
    keyInstruments: ['NIRCam', 'NIRSpec', 'MIRI Cryogenic Spectrometer', 'FGS/NIRISS'],
    costM: 10000,
    comparisonVerdict: 'JWST is humanity’s premier cryogenic deep-space observatory. Your halo orbit selection and micro-arcsecond ADCS design demonstrate mastery of ultra-quiet space telescope systems!'
  },
  mars_biosphere_searcher: {
    name: 'Mars Reconnaissance Orbiter (MRO)',
    launchYear: 2005,
    destination: 'Mars Sun-Synchronous Polar Orbit',
    keyInstruments: ['HiRISE Camera', 'CRISM Spectrometer', 'SHARAD Radar', 'MCS Radiometer'],
    costM: 720,
    comparisonVerdict: 'MRO has operated continuously for over 18 years, discovering sub-surface glaciers and recurring slope lineae. Your propulsion and radar payload architecture reflect MRO systems engineering principles!'
  }
};
