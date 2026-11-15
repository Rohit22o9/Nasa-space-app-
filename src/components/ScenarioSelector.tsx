import React from 'react';
import { DifficultyLevel, MissionDesignState } from '../types/mission';
import { NASA_SCENARIOS } from '../data/nasaData';
import { soundFx } from '../utils/audio';
import { 
  Rocket, 
  Globe, 
  Target, 
  DollarSign, 
  ShieldAlert, 
  Thermometer, 
  Radio, 
  Sun, 
  Users, 
  User, 
  Award, 
  Sparkles,
  ChevronRight
} from 'lucide-react';

interface Props {
  onSelectScenario: (scenarioId: string, difficulty: DifficultyLevel, teamMode: boolean) => void;
  currentState: MissionDesignState;
}

export const ScenarioSelector: React.FC<Props> = ({ onSelectScenario, currentState }) => {
  const [selectedId, setSelectedId] = React.useState<string>(currentState.scenarioId);
  const [difficulty, setDifficulty] = React.useState<DifficultyLevel>(currentState.difficulty);
  const [teamMode, setTeamMode] = React.useState<boolean>(currentState.teamMode);

  const handleLaunch = () => {
    soundFx.playQuindarBeep('intro');
    onSelectScenario(selectedId, difficulty, teamMode);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8">
      {/* Hero Title */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>NASA MISSION DESIGN LAB • CONCURRENT ENGINEERING CHALLENGE</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-display font-extrabold text-white tracking-tight mb-3">
          Space Mission <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500">Design & Trade-Off</span> Simulator
        </h1>
        <p className="text-slate-400 max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
          Master real-world systems engineering trade-offs: balance scientific payloads, Tsiolkovsky delta-v, solar flux scaling, battery depth of discharge, link budgets, and strict launch vehicle mass margins.
        </p>
      </div>

      {/* Difficulty & Team Mode Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-space-900/90 border border-white/10 mb-8 backdrop-blur-md">
        {/* Difficulty Selection */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Award className="w-4 h-4 text-amber-400" />
            Flight Certification:
          </span>
          <div className="flex items-center gap-1.5">
            {[
              { id: 'cadet', label: 'Cadet', desc: 'Guided tips, generous margins' },
              { id: 'engineer', label: 'Mission Engineer', desc: 'Standard 20% NASA margins' },
              { id: 'director', label: 'Flight Director', desc: 'Extreme hazards, strict budgets' },
            ].map(lvl => (
              <button
                key={lvl.id}
                onClick={() => {
                  soundFx.playClick();
                  setDifficulty(lvl.id as DifficultyLevel);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all ${
                  difficulty === lvl.id
                    ? 'bg-cyan-500 text-space-950 font-bold shadow-glow-cyan'
                    : 'bg-space-800 text-slate-300 hover:bg-space-700'
                }`}
              >
                {lvl.label}
              </button>
            ))}
          </div>
        </div>

        {/* Team vs Solo Mode */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Users className="w-4 h-4 text-purple-400" />
            Team Roster:
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                soundFx.playClick();
                setTeamMode(false);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono transition ${
                !teamMode ? 'bg-cyan-600 text-white font-medium' : 'bg-space-800 text-slate-300'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Solo Lead</span>
            </button>
            <button
              onClick={() => {
                soundFx.playClick();
                setTeamMode(true);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono transition ${
                teamMode ? 'bg-purple-600 text-white font-medium shadow-glow-purple' : 'bg-space-800 text-slate-300'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>4-Player Team</span>
            </button>
          </div>
        </div>
      </div>

      {/* Scenario Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {NASA_SCENARIOS.map((sc) => {
          const isSelected = selectedId === sc.id;
          return (
            <div
              key={sc.id}
              onClick={() => {
                soundFx.playClick();
                setSelectedId(sc.id);
              }}
              className={`relative rounded-2xl p-5 cursor-pointer transition-all flex flex-col justify-between border ${
                isSelected
                  ? 'bg-space-850 border-cyan-400 shadow-glow-cyan translate-y-[-2px]'
                  : 'bg-space-900/80 border-white/10 hover:border-white/30 hover:bg-space-850/60'
              }`}
            >
              {/* Badge top */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-1 rounded-md bg-space-800 text-cyan-300 font-mono text-[11px] font-semibold border border-cyan-500/20">
                    {sc.type.replace('_', ' ').toUpperCase()}
                  </span>
                  <span className="text-xs font-mono text-amber-400 flex items-center gap-1 font-semibold">
                    <DollarSign className="w-3.5 h-3.5" />
                    CAP: ${sc.maxBudgetM}M
                  </span>
                </div>

                <h3 className="text-lg font-display font-bold text-white mb-1 leading-snug">
                  {sc.title}
                </h3>
                <div className="text-xs text-cyan-400 font-mono mb-3">
                  {sc.destination}
                </div>

                <p className="text-xs text-slate-300 leading-relaxed mb-4">
                  {sc.primaryObjective}
                </p>
              </div>

              {/* Environmental Hazards Specs */}
              <div>
                <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-space-950/70 border border-white/5 text-[11px] font-mono mb-4">
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <Sun className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
                    <span>Solar: {sc.environmentHazards.solarFluxPercent}%</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <ShieldAlert className="w-3.5 h-3.5 text-red-400 shrink-0" />
                    <span className="capitalize">Rad: {sc.environmentHazards.radiation}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <Thermometer className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                    <span className="capitalize">Thermal: {sc.environmentHazards.thermalSwings}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <Radio className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Delay: {sc.environmentHazards.commDelaySec > 60 ? `${(sc.environmentHazards.commDelaySec / 60).toFixed(0)}m` : `${sc.environmentHazards.commDelaySec}s`}</span>
                  </div>
                </div>

                <div className="text-[10px] text-slate-500 font-mono">
                  Real NASA Precedent: <span className="text-slate-400">{sc.realMissionComparison}</span>
                </div>
              </div>

              {/* Selection Checkmark */}
              {isSelected && (
                <div className="absolute top-3 right-3 w-3 h-3 rounded-full bg-cyan-400 shadow-glow-cyan" />
              )}
            </div>
          );
        })}
      </div>

      {/* Launch Mission Design Button */}
      <div className="flex justify-center">
        <button
          onClick={handleLaunch}
          className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-space-950 font-display font-bold text-lg tracking-wide shadow-glow-cyan transition-all transform hover:scale-[1.02] active:scale-[0.98]"
        >
          <Rocket className="w-6 h-6 text-space-950" />
          <span>ENTER MISSION DESIGN LAB (CML 1)</span>
          <ChevronRight className="w-5 h-5 text-space-950" />
        </button>
      </div>
    </div>
  );
};
