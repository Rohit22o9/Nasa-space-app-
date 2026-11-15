import React from 'react';
import { MissionDesignState, EngineeringBudgets, PlayerRole } from '../../types/mission';
import { NASA_SCENARIOS } from '../../data/nasaData';
import { soundFx } from '../../utils/audio';
import { 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Rocket, 
  DollarSign, 
  Weight, 
  Zap, 
  Radio, 
  TrendingUp,
  Cpu,
  Award,
  ChevronRight,
  Sparkles
} from 'lucide-react';

interface Props {
  state: MissionDesignState;
  setState: React.Dispatch<React.SetStateAction<MissionDesignState>>;
  budgets: EngineeringBudgets;
  onLaunchSimulation: () => void;
}

export const SystemsReviewTab: React.FC<Props> = ({ 
  state, 
  setState, 
  budgets, 
  onLaunchSimulation 
}) => {
  const scenario = NASA_SCENARIOS.find(s => s.id === state.scenarioId) || NASA_SCENARIOS[0];

  const handleToggleApproval = (role: PlayerRole) => {
    soundFx.playQuindarBeep('outro');
    setState(prev => ({
      ...prev,
      approvals: {
        ...prev.approvals,
        [role]: !prev.approvals[role]
      }
    }));
  };

  const allApproved = Object.values(state.approvals).every(Boolean);
  const hasCriticalWarning = budgets.massStatus === 'critical' || 
                             budgets.powerStatus === 'critical' || 
                             budgets.costStatus === 'critical' || 
                             budgets.deltaVStatus === 'critical';

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-4 md:p-5 rounded-2xl bg-space-900/90 border border-cyan-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-cyan-300">
              CML 4: Point Design & Launch Readiness Review (LRR)
            </h3>
          </div>
          <p className="text-xs text-slate-300 font-mono">
            Concurrent systems evaluation across all engineering segments before flight simulation.
          </p>
        </div>

        {/* Status Badge */}
        <div className={`px-4 py-2 rounded-xl border text-xs font-mono font-bold flex items-center gap-2 ${
          hasCriticalWarning
            ? 'bg-red-950/80 border-red-500/50 text-red-300 shadow-glow-red'
            : allApproved
            ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300 shadow-glow-emerald'
            : 'bg-amber-950/80 border-amber-500/50 text-amber-300 shadow-glow-gold'
        }`}>
          {hasCriticalWarning ? (
            <>
              <XCircle className="w-4 h-4 text-red-400" />
              <span>FLIGHT RULES VIOLATED (NO-GO)</span>
            </>
          ) : allApproved ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>ALL SYSTEMS CERTIFIED (GO FOR LAUNCH)</span>
            </>
          ) : (
            <>
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>LRR APPROVAL PENDING SIGN-OFF</span>
            </>
          )}
        </div>
      </div>

      {/* Multidisciplinary Trade-Off Matrix (5 Pillars) */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        {/* 1. Mass Margin */}
        <div className={`p-4 rounded-xl border font-mono flex flex-col justify-between ${
          budgets.massStatus === 'critical' ? 'bg-red-950/30 border-red-500/50' :
          budgets.massStatus === 'warning' ? 'bg-amber-950/30 border-amber-500/40' :
          'bg-space-900/80 border-emerald-500/30'
        }`}>
          <div>
            <span className="text-[10px] text-slate-400 uppercase flex items-center gap-1 mb-1">
              <Weight className="w-3.5 h-3.5 text-sky-400" />
              Mass Budget
            </span>
            <div className="text-xl font-bold text-white">
              {budgets.totalWetMassKg.toFixed(0)} <span className="text-xs font-normal text-slate-400">kg</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Cap: {budgets.launchVehicleMaxCapacityKg.toLocaleString()} kg
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-white/5 flex justify-between text-xs">
            <span className="text-slate-400">MGA Margin:</span>
            <span className={budgets.massMarginPercent < 20 ? 'text-amber-400 font-bold' : 'text-emerald-400 font-bold'}>
              {budgets.massMarginPercent.toFixed(1)}%
            </span>
          </div>
        </div>

        {/* 2. Delta-V */}
        <div className={`p-4 rounded-xl border font-mono flex flex-col justify-between ${
          budgets.deltaVStatus === 'critical' ? 'bg-red-950/30 border-red-500/50' :
          budgets.deltaVStatus === 'warning' ? 'bg-amber-950/30 border-amber-500/40' :
          'bg-space-900/80 border-emerald-500/30'
        }`}>
          <div>
            <span className="text-[10px] text-slate-400 uppercase flex items-center gap-1 mb-1">
              <TrendingUp className="w-3.5 h-3.5 text-orange-400" />
              Delta-V
            </span>
            <div className="text-xl font-bold text-white">
              {budgets.availableDeltaVMs.toFixed(0)} <span className="text-xs font-normal text-slate-400">m/s</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Req: {budgets.requiredDeltaVMs} m/s
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-white/5 flex justify-between text-xs">
            <span className="text-slate-400">Margin:</span>
            <span className={budgets.deltaVMarginMs < 0 ? 'text-red-400 font-bold' : 'text-emerald-400 font-bold'}>
              {budgets.deltaVMarginMs > 0 ? `+${budgets.deltaVMarginMs.toFixed(0)}` : budgets.deltaVMarginMs.toFixed(0)} m/s
            </span>
          </div>
        </div>

        {/* 3. Power Generation */}
        <div className={`p-4 rounded-xl border font-mono flex flex-col justify-between ${
          budgets.powerStatus === 'critical' ? 'bg-red-950/30 border-red-500/50' :
          budgets.powerStatus === 'warning' ? 'bg-amber-950/30 border-amber-500/40' :
          'bg-space-900/80 border-emerald-500/30'
        }`}>
          <div>
            <span className="text-[10px] text-slate-400 uppercase flex items-center gap-1 mb-1">
              <Zap className="w-3.5 h-3.5 text-yellow-400" />
              Power & Battery
            </span>
            <div className="text-xl font-bold text-yellow-400">
              {budgets.powerGeneratedSunlightW.toFixed(0)} <span className="text-xs font-normal text-slate-400">W</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Draw: {budgets.totalDayPowerConsumptionW.toFixed(0)} W
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-white/5 flex justify-between text-xs">
            <span className="text-slate-400">Eclipse DoD:</span>
            <span className={budgets.batteryDepthOfDischarge > 0.5 ? 'text-amber-400 font-bold' : 'text-emerald-400 font-bold'}>
              {(budgets.batteryDepthOfDischarge * 100).toFixed(0)}%
            </span>
          </div>
        </div>

        {/* 4. Comms & Data */}
        <div className={`p-4 rounded-xl border font-mono flex flex-col justify-between ${
          budgets.commsStatus === 'critical' ? 'bg-red-950/30 border-red-500/50' :
          budgets.commsStatus === 'warning' ? 'bg-amber-950/30 border-amber-500/40' :
          'bg-space-900/80 border-emerald-500/30'
        }`}>
          <div>
            <span className="text-[10px] text-slate-400 uppercase flex items-center gap-1 mb-1">
              <Radio className="w-3.5 h-3.5 text-purple-400" />
              Comms Downlink
            </span>
            <div className="text-xl font-bold text-white">
              {budgets.maxDownlinkCapacityPerDayGb.toFixed(1)} <span className="text-xs font-normal text-slate-400">Gb</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Gen: {budgets.dataGeneratedPerDayGb.toFixed(1)} Gb/d
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-white/5 flex justify-between text-xs">
            <span className="text-slate-400">Data Buffer:</span>
            <span className={budgets.dataLinkMarginGb < 0 ? 'text-red-400 font-bold' : 'text-emerald-400 font-bold'}>
              {budgets.dataLinkMarginGb > 0 ? `+${budgets.dataLinkMarginGb.toFixed(1)}` : budgets.dataLinkMarginGb.toFixed(1)} Gb
            </span>
          </div>
        </div>

        {/* 5. Total Cost vs Cap */}
        <div className={`p-4 rounded-xl border font-mono flex flex-col justify-between ${
          budgets.costStatus === 'critical' ? 'bg-red-950/30 border-red-500/50' :
          budgets.costStatus === 'warning' ? 'bg-amber-950/30 border-amber-500/40' :
          'bg-space-900/80 border-emerald-500/30'
        }`}>
          <div>
            <span className="text-[10px] text-slate-400 uppercase flex items-center gap-1 mb-1">
              <DollarSign className="w-3.5 h-3.5 text-amber-400" />
              Total Budget
            </span>
            <div className="text-xl font-bold text-white">
              ${budgets.totalCostM.toFixed(1)}M
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Cap: ${budgets.budgetCapM}M
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-white/5 flex justify-between text-xs">
            <span className="text-slate-400">Reserve:</span>
            <span className={budgets.remainingBudgetM < 0 ? 'text-red-400 font-bold' : 'text-emerald-400 font-bold'}>
              ${budgets.remainingBudgetM.toFixed(1)}M
            </span>
          </div>
        </div>
      </div>

      {/* Warnings & Systems Alerts */}
      {budgets.warnings.length > 0 && (
        <div className="p-4 rounded-2xl bg-red-950/20 border border-red-500/30 space-y-2">
          <div className="text-xs font-mono font-bold text-red-400 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <span>CRITICAL NASA SYSTEMS ENGINEERING ALERTS ({budgets.warnings.length}):</span>
          </div>
          {budgets.warnings.map((w, idx) => (
            <div key={idx} className="text-xs font-mono text-red-300 pl-6 leading-relaxed">
              • {w}
            </div>
          ))}
        </div>
      )}

      {/* Team Sign-Off Board */}
      <div className="p-5 rounded-2xl bg-space-900/80 border border-white/10">
        <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-2 mb-4">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          Flight Readiness Review (FRR) Role Sign-Off & Go / No-Go Poll
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { id: 'director' as PlayerRole, title: 'Mission Director (MD)', discipline: 'Cost & Contingency' },
            { id: 'payload' as PlayerRole, title: 'Payload Lead (PSL)', discipline: 'Science Questions' },
            { id: 'bus' as PlayerRole, title: 'Spacecraft Bus Lead (SBSE)', discipline: 'Power & Structure' },
            { id: 'trajectory' as PlayerRole, title: 'Trajectory Officer (TCO)', discipline: 'Delta-V & Booster' },
          ].map((role) => {
            const approved = state.approvals[role.id];
            return (
              <div
                key={role.id}
                onClick={() => handleToggleApproval(role.id)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                  approved
                    ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300 shadow-sm'
                    : 'bg-space-950/60 border-white/10 text-slate-400 hover:border-white/20'
                }`}
              >
                <div>
                  <div className="text-xs font-bold text-white">{role.title}</div>
                  <div className="text-[10px] text-slate-400 font-mono">{role.discipline}</div>
                </div>

                <div className={`px-2.5 py-1 rounded-md text-[10px] font-mono font-bold ${
                  approved ? 'bg-emerald-500 text-space-950' : 'bg-space-800 text-slate-400'
                }`}>
                  {approved ? 'GO' : 'POLL'}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Big Launch Simulation Action Button */}
      <div className="pt-2 flex flex-col items-center gap-3">
        <button
          onClick={() => {
            soundFx.playQuindarBeep('intro');
            onLaunchSimulation();
          }}
          disabled={hasCriticalWarning}
          className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-display font-bold text-base md:text-lg tracking-wide shadow-2xl transition-all transform ${
            hasCriticalWarning
              ? 'bg-space-800 text-slate-500 cursor-not-allowed border border-white/5'
              : 'bg-gradient-to-r from-emerald-500 via-cyan-500 to-blue-600 text-space-950 hover:scale-[1.02] active:scale-[0.98] shadow-glow-cyan'
          }`}
        >
          <Rocket className="w-6 h-6" />
          <span>START MISSION LAUNCH & CONOPS SIMULATION</span>
          <ChevronRight className="w-5 h-5" />
        </button>

        {hasCriticalWarning && (
          <div className="text-xs font-mono text-red-400 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Resolve critical flight rule violations above before launch authorization.</span>
          </div>
        )}
      </div>
    </div>
  );
};
