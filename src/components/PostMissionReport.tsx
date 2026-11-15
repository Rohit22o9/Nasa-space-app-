import React from 'react';
import { MissionEvaluationReport } from '../types/mission';
import { soundFx } from '../utils/audio';
import { 
  Award, 
  CheckCircle2, 
  RotateCcw, 
  Printer, 
  FileText, 
  ShieldCheck, 
  DollarSign, 
  Weight, 
  Zap, 
  Radio, 
  TrendingUp, 
  Sparkles,
  ExternalLink
} from 'lucide-react';

interface Props {
  report: MissionEvaluationReport;
  onRedesign: () => void;
  onNewScenario: () => void;
}

export const PostMissionReport: React.FC<Props> = ({ 
  report, 
  onRedesign, 
  onNewScenario 
}) => {
  const handlePrint = () => {
    soundFx.playClick();
    window.print();
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A+':
      case 'A': return 'text-emerald-400 border-emerald-500 shadow-glow-emerald';
      case 'B': return 'text-cyan-400 border-cyan-500 shadow-glow-cyan';
      case 'C': return 'text-amber-400 border-amber-500 shadow-glow-gold';
      default: return 'text-rose-400 border-rose-500 shadow-glow-red';
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 py-4 print:p-0">
      {/* Header Banner */}
      <div className="p-6 md:p-8 rounded-3xl bg-space-900/90 border border-cyan-500/30 backdrop-blur-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-mono font-bold tracking-widest text-cyan-400 uppercase">
                OFFICIAL NASA MISSION EVALUATION & CONOPS REPORT
              </span>
            </div>
            <h2 className="text-2xl md:text-4xl font-display font-extrabold text-white mb-2">
              {report.missionName}
            </h2>
            <div className="text-sm text-slate-300 font-mono">
              Scenario: <span className="text-white font-medium">{report.scenarioTitle}</span>
            </div>
          </div>

          {/* Grade Badge */}
          <div className="flex items-center gap-4">
            <div className={`w-24 h-24 rounded-2xl border-2 flex flex-col items-center justify-center bg-space-950/80 ${getGradeColor(report.grade)}`}>
              <span className="text-3xl font-display font-black leading-none">{report.grade}</span>
              <span className="text-[10px] font-mono tracking-wider mt-1 text-slate-400">SE GRADE</span>
            </div>
            <div>
              <div className="text-3xl font-display font-black text-white">
                {report.overallScore} <span className="text-sm font-normal text-slate-400 font-mono">/ 1000 pts</span>
              </div>
              <div className="text-xs font-mono text-emerald-400 uppercase font-semibold">
                {report.status.replace('_', ' ')}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Systems Engineering Score Pillars */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-space-900 border border-white/10 font-mono">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-2">
            <Award className="w-4 h-4 text-cyan-400" />
            <span>Science Yield</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {report.scienceYieldScore} <span className="text-xs font-normal text-slate-400">/ 400</span>
          </div>
          <div className="w-full bg-space-950 h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="h-full bg-cyan-400" style={{ width: `${(report.scienceYieldScore / 400) * 100}%` }} />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-space-900 border border-white/10 font-mono">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-2">
            <Weight className="w-4 h-4 text-sky-400" />
            <span>Mass Margin</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {report.engineeringMarginScore} <span className="text-xs font-normal text-slate-400">/ 250</span>
          </div>
          <div className="w-full bg-space-950 h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="h-full bg-sky-400" style={{ width: `${(report.engineeringMarginScore / 250) * 100}%` }} />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-space-900 border border-white/10 font-mono">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-2">
            <DollarSign className="w-4 h-4 text-amber-400" />
            <span>Budget Reserve</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {report.budgetEfficiencyScore} <span className="text-xs font-normal text-slate-400">/ 250</span>
          </div>
          <div className="w-full bg-space-950 h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="h-full bg-amber-400" style={{ width: `${(report.budgetEfficiencyScore / 250) * 100}%` }} />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-space-900 border border-white/10 font-mono">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Reliability & Risk</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {report.riskMitigationScore} <span className="text-xs font-normal text-slate-400">/ 100</span>
          </div>
          <div className="w-full bg-space-950 h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="h-full bg-emerald-400" style={{ width: `${report.riskMitigationScore}%` }} />
          </div>
        </div>
      </div>

      {/* Real NASA Precedent Comparison Card */}
      <div className="p-6 rounded-2xl bg-space-900/90 border border-cyan-500/20 backdrop-blur-md">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-cyan-300">
            Real-World NASA Mission Precedent Comparison
          </h3>
        </div>

        <div className="p-4 rounded-xl bg-space-950/70 border border-white/10 mb-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-2">
            <div>
              <span className="text-base font-bold text-white">{report.comparableNasaMission.name}</span>
              <span className="text-xs text-slate-400 font-mono ml-2">({report.comparableNasaMission.launchYear})</span>
            </div>
            <div className="text-xs font-mono text-amber-400 font-semibold">
              Actual NASA Cost: ${report.comparableNasaMission.costM}M
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed font-mono">
            {report.comparableNasaMission.comparisonVerdict}
          </p>
        </div>

        {/* Milestones Unlocked */}
        <div>
          <span className="text-xs font-mono uppercase text-slate-400 block mb-2">
            Milestones Certified:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {report.milestonesUnlocked.map((m, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs font-mono text-emerald-300 bg-emerald-950/30 p-2 rounded-lg border border-emerald-500/20">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>{m}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Executive Systems Debrief */}
      <div className="p-6 rounded-2xl bg-space-900/70 border border-white/10 font-mono text-xs text-slate-300 leading-relaxed">
        <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider block mb-2">
          Systems Engineering Debrief:
        </span>
        {report.postMissionDebrief}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-white/10 print:hidden">
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-space-850 border border-white/10 hover:border-white/30 text-xs font-mono text-slate-200 transition"
        >
          <Printer className="w-4 h-4 text-cyan-400" />
          <span>PRINT MISSION REPORT (PDF)</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              soundFx.playClick();
              onRedesign();
            }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-space-800 hover:bg-space-700 text-xs font-mono text-white font-medium transition"
          >
            <RotateCcw className="w-4 h-4 text-amber-400" />
            <span>TWEAK & RE-SIMULATE</span>
          </button>

          <button
            onClick={() => {
              soundFx.playClick();
              onNewScenario();
            }}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-space-950 font-mono text-xs font-bold shadow-glow-cyan transition"
          >
            <span>NEXT NASA SCENARIO</span>
          </button>
        </div>
      </div>
    </div>
  );
};
