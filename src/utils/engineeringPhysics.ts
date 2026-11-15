import {
  MissionDesignState,
  EngineeringBudgets,
  Scenario
} from '../types/mission';
import {
  NASA_SCENARIOS,
  NASA_INSTRUMENTS,
  NASA_CHASSIS,
  NASA_POWER_SYSTEMS,
  NASA_BATTERIES,
  NASA_PROPULSION,
  NASA_ADCS,
  NASA_COMMS,
  NASA_LAUNCH_VEHICLES,
  NASA_ORBITS
} from '../data/nasaData';

export function calculateEngineeringBudgets(state: MissionDesignState): EngineeringBudgets {
  const scenario: Scenario = NASA_SCENARIOS.find(s => s.id === state.scenarioId) || NASA_SCENARIOS[0];
  const chassis = NASA_CHASSIS.find(c => c.id === state.chassisId) || NASA_CHASSIS[1];
  const powerSystem = NASA_POWER_SYSTEMS.find(p => p.id === state.powerSystemId) || NASA_POWER_SYSTEMS[1];
  const battery = NASA_BATTERIES.find(b => b.id === state.batterySystemId) || NASA_BATTERIES[0];
  const propulsion = NASA_PROPULSION.find(p => p.id === state.propulsionSystemId) || NASA_PROPULSION[0];
  const adcs = NASA_ADCS.find(a => a.id === state.adcsSystemId) || NASA_ADCS[0];
  const comms = NASA_COMMS.find(c => c.id === state.commsSystemId) || NASA_COMMS[0];
  const launchVehicle = NASA_LAUNCH_VEHICLES.find(lv => lv.id === state.launchVehicleId) || NASA_LAUNCH_VEHICLES[1];
  const orbit = NASA_ORBITS.find(o => o.id === state.orbitId) || NASA_ORBITS[0];

  const selectedInstruments = NASA_INSTRUMENTS.filter(inst => 
    state.selectedInstrumentIds.includes(inst.id)
  );

  const warnings: string[] = [];
  const recommendations: string[] = [];

  // ================= 1. MASS BUDGET =================
  const payloadMassKg = selectedInstruments.reduce((sum, inst) => sum + inst.massKg, 0);
  const busBaseDryMassKg = chassis.dryMassKg;
  const powerMassKg = powerSystem.massKg;
  const batteryMassKg = battery.massKg;
  const propulsionDryMassKg = propulsion.dryMassKg;
  const adcsMassKg = adcs.massKg;
  const commsMassKg = comms.massKg;
  const avionicsMassKg = state.redundantAvionics ? 22 : 12;
  const shieldingMassKg = state.additionalShieldingKg || 0;

  const totalDryMassKg = payloadMassKg + busBaseDryMassKg + powerMassKg + batteryMassKg + 
                         propulsionDryMassKg + adcsMassKg + commsMassKg + avionicsMassKg + shieldingMassKg;
  const propellantMassKg = state.propellantMassKg || 0;
  const totalWetMassKg = totalDryMassKg + propellantMassKg;

  // Maximum payload capacity for selected launch vehicle to this orbit
  let lvCapacityKg = 1000;
  if (orbit.category === 'leo') lvCapacityKg = launchVehicle.payloadCapacityKg.leo;
  else if (orbit.category === 'sso') lvCapacityKg = launchVehicle.payloadCapacityKg.sso;
  else if (orbit.category === 'geo') lvCapacityKg = launchVehicle.payloadCapacityKg.geo;
  else if (orbit.category === 'lunar') lvCapacityKg = launchVehicle.payloadCapacityKg.tli;
  else if (orbit.category === 'mars') lvCapacityKg = launchVehicle.payloadCapacityKg.tmi;
  else lvCapacityKg = launchVehicle.payloadCapacityKg.deepSpace;

  const massMarginKg = lvCapacityKg - totalWetMassKg;
  const massMarginPercent = lvCapacityKg > 0 ? (massMarginKg / lvCapacityKg) * 100 : -100;

  let massStatus: 'optimal' | 'warning' | 'critical' = 'optimal';
  if (totalWetMassKg > lvCapacityKg || lvCapacityKg === 0) {
    massStatus = 'critical';
    warnings.push(`EXCEEDED LAUNCH CAPACITY: Wet mass (${totalWetMassKg.toFixed(0)} kg) exceeds ${launchVehicle.name} capacity to this orbit (${lvCapacityKg} kg)!`);
  } else if (massMarginPercent < 20) {
    massStatus = 'warning';
    warnings.push(`MASS MARGIN TOO LOW: Mass margin is ${massMarginPercent.toFixed(1)}%. NASA flight rules require at least 20% Mass Growth Allowance (MGA).`);
  }

  // Chassis payload volume/mass check
  if (payloadMassKg > chassis.maxPayloadMassKg) {
    massStatus = 'critical';
    warnings.push(`CHASSIS OVERLOAD: Instrument payload mass (${payloadMassKg} kg) exceeds ${chassis.name} structural limit (${chassis.maxPayloadMassKg} kg)!`);
  }

  // ================= 2. PROPULSION & DELTA-V =================
  let availableDeltaVMs = 0;
  const g0 = 9.80665;
  if (propellantMassKg > 0 && propulsion.ispSec > 0 && totalDryMassKg > 0) {
    // Tsiolkovsky rocket equation: dV = Isp * g0 * ln(m0 / mf)
    availableDeltaVMs = propulsion.ispSec * g0 * Math.log(totalWetMassKg / totalDryMassKg);
  }

  const requiredDeltaVMs = orbit.deltaVRequiredMs;
  const deltaVMarginMs = availableDeltaVMs - requiredDeltaVMs;
  let deltaVStatus: 'optimal' | 'warning' | 'critical' = 'optimal';

  if (requiredDeltaVMs > 0) {
    if (availableDeltaVMs < requiredDeltaVMs) {
      deltaVStatus = 'critical';
      warnings.push(`INSUFFICIENT DELTA-V: Spacecraft has ${availableDeltaVMs.toFixed(0)} m/s available, but ${orbit.name} requires ${requiredDeltaVMs} m/s to insert! Add fuel or upgrade thrusters.`);
    } else if (deltaVMarginMs < requiredDeltaVMs * 0.15) {
      deltaVStatus = 'warning';
      recommendations.push(`Tight Delta-V margin (${deltaVMarginMs.toFixed(0)} m/s). Consider 15% propellant reserve for trajectory correction maneuvers.`);
    }
  }

  // ================= 3. POWER BUDGET =================
  // Distance scaling (1 / R^2)
  const distAu = scenario.distanceAU;
  let powerGeneratedSunlightW = 0;
  if (powerSystem.type === 'rtg_nextgen') {
    // RTG produces continuous power independent of solar distance
    powerGeneratedSunlightW = powerSystem.basePowerEarthW;
  } else {
    // Solar flux drops with square of distance
    const solarFluxFactor = 1 / (distAu * distAu);
    powerGeneratedSunlightW = powerSystem.basePowerEarthW * solarFluxFactor;
  }

  // Day power consumption: instruments duty cycle + avionics + adcs + thermal + comms
  const instrumentsDayPowerW = selectedInstruments.reduce((sum, inst) => {
    return sum + (inst.powerW * inst.operationalDutyCycle);
  }, 0);
  const busBasePowerW = 35 + adcs.powerW + (comms.powerW * 0.4);
  const totalDayPowerConsumptionW = instrumentsDayPowerW + busBasePowerW;

  // Night / Eclipse power consumption: instruments idle (standby 15%), bus + thermal heaters
  const instrumentsNightPowerW = selectedInstruments.reduce((sum, inst) => sum + (inst.powerW * 0.1), 0);
  const thermalHeaterPowerW = scenario.environmentHazards.thermalSwings === 'extreme' ? 45 : 20;
  const totalNightPowerConsumptionW = instrumentsNightPowerW + 28 + thermalHeaterPowerW;

  const powerMarginSunlightW = powerGeneratedSunlightW - totalDayPowerConsumptionW;

  // Eclipse duration in minutes
  const eclipseDurationMin = orbit.orbitalPeriodMin * orbit.eclipseFraction;
  const energyRequiredInEclipseWh = totalNightPowerConsumptionW * (eclipseDurationMin / 60);
  const batteryDepthOfDischarge = battery.capacityWh > 0 ? (energyRequiredInEclipseWh / battery.capacityWh) : 1.0;

  let powerStatus: 'optimal' | 'warning' | 'critical' = 'optimal';

  if (powerGeneratedSunlightW < totalDayPowerConsumptionW) {
    powerStatus = 'critical';
    warnings.push(`NEGATIVE POWER BUDGET: Spacecraft consumes ${totalDayPowerConsumptionW.toFixed(0)} W, but generates only ${powerGeneratedSunlightW.toFixed(0)} W at ${distAu} AU!`);
  } else if (powerMarginSunlightW < totalDayPowerConsumptionW * 0.2) {
    powerStatus = 'warning';
    warnings.push(`LOW POWER MARGIN: Day power margin is only ${powerMarginSunlightW.toFixed(0)} W (<20% reserve).`);
  }

  if (orbit.eclipseFraction > 0) {
    if (batteryDepthOfDischarge > battery.maxDepthOfDischarge) {
      if (batteryDepthOfDischarge > 0.85) {
        powerStatus = 'critical';
        warnings.push(`BATTERY EXHAUSTION: Depth of Discharge during eclipse reaches ${(batteryDepthOfDischarge * 100).toFixed(0)}%! Spacecraft will experience brownout or battery failure.`);
      } else {
        if (powerStatus !== 'critical') powerStatus = 'warning';
        warnings.push(`EXCESSIVE DEPTH OF DISCHARGE: DoD is ${(batteryDepthOfDischarge * 100).toFixed(0)}% (limit is ${(battery.maxDepthOfDischarge * 100).toFixed(0)}%). Upgrade battery capacity.`);
      }
    }
  }

  if (distAu > 3.0 && powerSystem.type !== 'rtg_nextgen' && powerSystem.type !== 'solar_ultraflex') {
    powerStatus = 'critical';
    warnings.push(`OUTER PLANET POWER DEFICIT: Solar flux at ${distAu} AU is only ${(100 / (distAu * distAu)).toFixed(1)}% of Earth. Standard solar arrays are ineffective; use Next-Gen RTG or MegaFlex.`);
  }

  // ================= 4. COMMS & DATA LINK BUDGET =================
  // Data generated per day in Gigabits
  const dataGeneratedPerDayGb = selectedInstruments.reduce((sum, inst) => {
    // Mbps * seconds per day * duty cycle / 1000 = Gb
    return sum + (inst.dataRateMbps * inst.operationalDutyCycle * 86400 / 1000);
  }, 0);

  // Downlink passes and time per day
  let passDurationMinutes = 15;
  if (orbit.category === 'deep_space' || orbit.category === 'mars' || orbit.category === 'l2') {
    passDurationMinutes = 240; // Long tracking track via DSN 34m/70m
  }
  const totalPassSecondsPerDay = orbit.groundPassesPerDay * (passDurationMinutes * 60);

  // Distance attenuation effect on data rate:
  // Optical laser comms or Ka-band from Mars/Jupiter has path loss
  let distanceAttenuationFactor = 1.0;
  if (scenario.distanceAU > 1.2) {
    distanceAttenuationFactor = Math.max(0.08, 1 / (scenario.distanceAU * scenario.distanceAU * 0.8));
  } else if (scenario.targetDistanceKm > 100000) {
    distanceAttenuationFactor = 0.5;
  }

  const effectiveDownlinkRateMbps = comms.maxDataRateMbps * distanceAttenuationFactor;
  const maxDownlinkCapacityPerDayGb = (effectiveDownlinkRateMbps * totalPassSecondsPerDay) / 1000;
  const dataLinkMarginGb = maxDownlinkCapacityPerDayGb - dataGeneratedPerDayGb;

  let linkBudgetDb = 12.0;
  if (comms.frequencyBand === 'S-band' && scenario.distanceAU > 1.2) linkBudgetDb = -4.5;
  else if (comms.frequencyBand === 'Ka-band') linkBudgetDb = 8.5;
  else if (comms.frequencyBand === 'Optical Laser') linkBudgetDb = 14.2;

  let commsStatus: 'optimal' | 'warning' | 'critical' = 'optimal';
  if (dataLinkMarginGb < 0 && dataGeneratedPerDayGb > 5) {
    commsStatus = 'critical';
    warnings.push(`COMMUNICATION BOTTLENECK: Instruments generate ${dataGeneratedPerDayGb.toFixed(1)} Gb/day, but comms can only downlink ${maxDownlinkCapacityPerDayGb.toFixed(1)} Gb/day! Onboard storage will overflow.`);
  } else if (linkBudgetDb < 3.0) {
    commsStatus = 'critical';
    warnings.push(`NEGATIVE RF LINK BUDGET: ${comms.name} has insufficient antenna gain / power for distance to ${scenario.destination}.`);
  } else if (dataLinkMarginGb < dataGeneratedPerDayGb * 0.25) {
    commsStatus = 'warning';
    recommendations.push(`Tight downlink margin. Consider upgrading to Ka-Band or Optical Laser Terminal for high-data instruments.`);
  }

  // ================= 5. FINANCIAL COST MODEL =================
  const payloadCostM = selectedInstruments.reduce((sum, inst) => sum + inst.costM, 0);
  const spacecraftCostM = chassis.costM + powerSystem.costM + battery.costM + 
                          propulsion.costM + adcs.costM + comms.costM + 
                          (state.redundantAvionics ? 16 : 6) + (state.additionalShieldingKg * 0.15);
  const launchCostM = launchVehicle.costM;
  const operationsCostM = scenario.type === 'deep_space' ? 48 : (scenario.type === 'mars' ? 36 : 18);
  
  // NASA 15% project reserve / contingency
  const subtotalCostM = payloadCostM + spacecraftCostM + launchCostM + operationsCostM;
  const contingencyReserveM = subtotalCostM * 0.15;
  const totalCostM = subtotalCostM + contingencyReserveM;

  const budgetCapM = scenario.maxBudgetM;
  const remainingBudgetM = budgetCapM - totalCostM;

  let costStatus: 'optimal' | 'warning' | 'critical' = 'optimal';
  if (totalCostM > budgetCapM) {
    costStatus = 'critical';
    warnings.push(`OVER BUDGET: Total mission cost ($${totalCostM.toFixed(1)}M) exceeds congressional budget cap ($${budgetCapM}M) by $${(totalCostM - budgetCapM).toFixed(1)}M!`);
  } else if (remainingBudgetM < budgetCapM * 0.05) {
    costStatus = 'warning';
    recommendations.push(`Very low financial reserve ($${remainingBudgetM.toFixed(1)}M remaining). High risk of budget overrun during integration.`);
  }

  // ================= 6. SCIENCE SCORE & OBJECTIVES =================
  let rawScienceScore = selectedInstruments.reduce((sum, inst) => sum + inst.scienceValue, 0);
  
  // Calculate matching primary objectives
  let objectivesMatchedCount = 0;
  scenario.scientificQuestions.forEach(q => {
    const isCovered = selectedInstruments.some(inst => 
      inst.bestFitObjectives.some(obj => q.toLowerCase().includes(obj.toLowerCase()) || obj.toLowerCase().includes(q.toLowerCase().slice(0, 15)))
    );
    if (isCovered) objectivesMatchedCount++;
  });

  const totalScienceScore = Math.round(rawScienceScore * orbit.scienceMultiplier);

  // ================= 7. RELIABILITY & RADIATION =================
  let reliabilityBase = chassis.structuralReliability * 100;
  if (state.redundantAvionics) reliabilityBase += 8;
  
  // Radiation penalty
  const totalShieldingMm = chassis.radiationShieldingMm + (state.additionalShieldingKg * 0.12);
  if (scenario.environmentHazards.radiation === 'extreme' && totalShieldingMm < 18) {
    reliabilityBase -= 35;
    warnings.push(`RADIATION HAZARD: Shielding (${totalShieldingMm.toFixed(1)} mm) is inadequate for extreme radiation belts at ${scenario.destination}! Severe microchip latch-up risk.`);
  } else if (scenario.environmentHazards.radiation === 'high' && totalShieldingMm < 10) {
    reliabilityBase -= 18;
    warnings.push(`HIGH RADIATION: Spacecraft electronics require at least 10 mm Al equivalent shielding.`);
  }

  // TRL risk
  const lowTrlCount = selectedInstruments.filter(inst => inst.trl < 7).length;
  if (lowTrlCount > 0) {
    reliabilityBase -= (lowTrlCount * 6);
    recommendations.push(`${lowTrlCount} instrument(s) have TRL < 7. Requires accelerated technology maturation.`);
  }

  const overallReliabilityScore = Math.max(15, Math.min(99, Math.round(reliabilityBase)));

  return {
    payloadMassKg,
    busDryMassKg: totalDryMassKg - payloadMassKg,
    totalDryMassKg,
    propellantMassKg,
    totalWetMassKg,
    launchVehicleMaxCapacityKg: lvCapacityKg,
    massMarginKg,
    massMarginPercent,
    massStatus,

    availableDeltaVMs,
    requiredDeltaVMs,
    deltaVMarginMs,
    deltaVStatus,

    totalDayPowerConsumptionW,
    totalNightPowerConsumptionW,
    powerGeneratedSunlightW,
    powerMarginSunlightW,
    eclipseDurationMin,
    energyRequiredInEclipseWh,
    batteryDepthOfDischarge,
    powerStatus,

    dataGeneratedPerDayGb,
    maxDownlinkCapacityPerDayGb,
    dataLinkMarginGb,
    linkBudgetDb,
    commsStatus,

    payloadCostM,
    spacecraftCostM,
    launchCostM,
    operationsCostM,
    contingencyReserveM,
    totalCostM,
    budgetCapM,
    remainingBudgetM,
    costStatus,

    totalScienceScore,
    primaryObjectivesMet: objectivesMatchedCount,
    totalObjectives: scenario.scientificQuestions.length,
    overallReliabilityScore,
    warnings,
    recommendations
  };
}
