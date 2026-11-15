import React from 'react';
import { MissionEvaluationReport } from '../types/mission';
import { soundFx } from '../utils/audio';
import { 
  Award, 
  CheckCircle2, 
  RotateCcw, 
  Printer, 
  Sparkles, 
  Weight, 
  Zap, 
  DollarSign, 
  Globe, 
  ArrowRight
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

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 py-4 print:p-0">
      
      {/* Front-Page NASA Press Release Headline */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#070e24]/90 border border-cyan-500/30 backdrop-blur-xl shadow-2xl relative overflow-hidden">
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-mono font-bold tracking-widest text-cyan-400 uppercase">
                NASA HEADQUARTERS • OFFICIAL MISSION DEBRIEFING
              </span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              {report.missionName}
            </h2>
            <div className="text-xs sm:text-sm text-slate-300 font-mono mt-1">
              Destination: <strong className="text-cyan-300">{report.scenarioTitle}</strong>
            </div>
          </div>

          {/* Letter Grade Stamp */}
          <div className="flex items-center gap-3">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/10 border-2 border-emerald-400 flex flex-col items-center justify-center shadow-[0_0_25px_rgba(16,185,129,0.3)]">
              <span className="text-3xl font-black text-emerald-300 leading-none">{report.grade}</span>
              <span className="text-[9px] font-mono tracking-wider mt-1 text-slate-300">GRADE</span>
            </div>
            <div>
              <div className="text-2xl font-black text-white font-mono">
                {report.overallScore} <span className="text-xs text-slate-400 font-normal">/ 1000 pts</span>
              </div>
              <div className="text-xs font-mono text-emerald-400 font-bold uppercase">
                {report.status.replace('_', ' ')}
              </div>
            </div>
          </div>
        </div>

        {/* Executive Summary */}
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans pt-4">
          {report.postMissionDebrief}
        </p>

      </div>

      {/* 3 Gamified Achievement Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-2xl bg-[#070e24]/80 border border-cyan-500/20 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-white">Galactic Pioneer</div>
            <div className="text-[11px] text-slate-400">Achieved {report.scienceYieldScore}/400 Science Yield</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#070e24]/80 border border-emerald-500/20 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 shrink-0">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-white">Master Minimalist</div>
            <div className="text-[11px] text-slate-400">Delivered within budget contingency</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#070e24]/80 border border-yellow-500/20 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-yellow-500/20 border border-yellow-400/40 flex items-center justify-center text-yellow-300 shrink-0">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-white">Power Master</div>
            <div className="text-[11px] text-slate-400">Zero brownouts across mission flight</div>
          </div>
        </div>
      </div>

      {/* Real NASA Mission Precedent Comparison */}
      <div className="p-5 rounded-2xl bg-[#070e24]/85 border border-white/10 space-y-2">
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-cyan-400 font-bold">
          <Globe className="w-4 h-4" />
          <span>Real NASA Mission Precedent: {report.comparableNasaMission.name}</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed font-sans">
          {report.comparableNasaMission.comparisonVerdict}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 print:hidden">
        <button
          onClick={handlePrint}
          className="px-4 py-2.5 rounded-xl bg-[#0b1633] border border-white/10 hover:border-white/30 text-xs font-mono text-slate-300 flex items-center gap-2 transition"
        >
          <Printer className="w-4 h-4 text-cyan-400" />
          <span>PRINT MISSION CERTIFICATE (PDF)</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              soundFx.playClick();
              onRedesign();
            }}
            className="px-4 py-2.5 rounded-xl bg-[#0b1633] hover:bg-[#122353] border border-white/10 text-xs font-mono text-white transition flex items-center gap-2"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
            <span>Tweak Spacecraft</span>
          </button>

          <button
            onClick={() => {
              soundFx.playClick();
              onNewScenario();
            }}
            className="btn-nasa-primary px-5 py-2.5 rounded-xl text-xs font-bold font-mono tracking-wide flex items-center gap-2"
          >
            <span>NEW MISSION TARGET</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

    </div>
  );
};
