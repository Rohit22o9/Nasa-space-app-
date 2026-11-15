import React from 'react';
import { PlayerRole, MissionDesignState } from '../types/mission';
import { soundFx } from '../utils/audio';
import { 
  Compass, 
  Atom, 
  Cpu, 
  Orbit, 
  CheckCircle, 
  AlertTriangle, 
  ShieldCheck,
  MessageSquare
} from 'lucide-react';

interface Props {
  state: MissionDesignState;
  setState: React.Dispatch<React.SetStateAction<MissionDesignState>>;
}

export const RoleConsole: React.FC<Props> = ({ state, setState }) => {
  const roles: {
    id: PlayerRole;
    title: string;
    acronym: string;
    icon: React.ReactNode;
    color: string;
    responsibility: string;
    keyMetric: string;
  }[] = [
    {
      id: 'director',
      title: 'Mission Director / Lead Systems Engineer',
      acronym: 'MD',
      icon: <Compass className="w-4 h-4" />,
      color: 'from-amber-500/20 to-amber-600/10 border-amber-500/40 text-amber-300',
      responsibility: 'Owns mission budget reserves, Concept Maturity Gates, risk management, and final Launch Readiness Review (LRR) Go/No-Go.',
      keyMetric: 'Cost Contingency & Risk'
    },
    {
      id: 'payload',
      title: 'Payload & Science Instrument Lead',
      acronym: 'PSL',
      icon: <Atom className="w-4 h-4" />,
      color: 'from-cyan-500/20 to-cyan-600/10 border-cyan-500/40 text-cyan-300',
      responsibility: 'Selects science instrument suite, maximizes mission science points, and ensures scientific questions are resolved.',
      keyMetric: 'Science Yield & Duty Cycle'
    },
    {
      id: 'bus',
      title: 'Spacecraft Bus & Power Engineer',
      acronym: 'SBSE',
      icon: <Cpu className="w-4 h-4" />,
      color: 'from-blue-500/20 to-blue-600/10 border-blue-500/40 text-blue-300',
      responsibility: 'Designs structure, power generation (Solar/RTG), battery depth-of-discharge, ADCS stability, thermal protection, and shielding.',
      keyMetric: 'Power & Mass Margin'
    },
    {
      id: 'trajectory',
      title: 'Trajectory & Communications Officer',
      acronym: 'TCO',
      icon: <Orbit className="w-4 h-4" />,
      color: 'from-purple-500/20 to-purple-600/10 border-purple-500/40 text-purple-300',
      responsibility: 'Selects target orbit, matches launch vehicle lift capacity curves, calculates Tsiolkovsky delta-v, and designs DSN link budget.',
      keyMetric: 'Delta-V & RF Link Margin'
    }
  ];

  const handleRoleSelect = (roleId: PlayerRole) => {
    soundFx.playClick();
    setState(prev => ({ ...prev, activeRole: roleId }));
  };

  const handleToggleApproval = (roleId: PlayerRole) => {
    soundFx.playQuindarBeep('outro');
    setState(prev => ({
      ...prev,
      approvals: {
        ...prev.approvals,
        [roleId]: !prev.approvals[roleId]
      }
    }));
  };

  const currentRole = roles.find(r => r.id === state.activeRole) || roles[0];
  const allApproved = Object.values(state.approvals).every(Boolean);

  return (
    <div className="w-full bg-space-900/80 rounded-2xl border border-white/10 p-4 backdrop-blur-md mb-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold tracking-wider text-cyan-400 uppercase">
              NASA Multidisciplinary Engineering Team Console
            </span>
            {state.teamMode && (
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-500/20 text-purple-300 border border-purple-500/30">
                4-SEAT COLLABORATIVE DESK
              </span>
            )}
          </div>
          <div className="text-xs text-slate-400 font-mono mt-0.5">
            Switch perspective to inspect and tune specialized mission domains.
          </div>
        </div>

        {/* Team Approval Status Pill */}
        <div className="flex items-center gap-2 bg-space-950/80 px-3 py-1.5 rounded-xl border border-white/10">
          <ShieldCheck className={`w-4 h-4 ${allApproved ? 'text-emerald-400' : 'text-amber-400'}`} />
          <span className="text-xs font-mono text-slate-300">
            LRR Team Approvals: <strong className={allApproved ? 'text-emerald-400' : 'text-amber-400'}>{Object.values(state.approvals).filter(Boolean).length}/4 READY</strong>
          </span>
        </div>
      </div>

      {/* Role Tabs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {roles.map((r) => {
          const isActive = state.activeRole === r.id;
          const isApproved = state.approvals[r.id];
          return (
            <div
              key={r.id}
              onClick={() => handleRoleSelect(r.id)}
              className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                isActive
                  ? `bg-gradient-to-br ${r.color} shadow-lg ring-1 ring-cyan-400/40`
                  : 'bg-space-950/50 border-white/5 hover:border-white/20 text-slate-400'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-mono font-bold ${
                    isActive ? 'bg-cyan-500 text-space-950' : 'bg-space-800 text-slate-300'
                  }`}>
                    {r.acronym}
                  </div>
                  <span className={`text-xs font-bold leading-tight ${isActive ? 'text-white' : 'text-slate-300'}`}>
                    {r.title.split('/')[0]}
                  </span>
                </div>

                {/* Role Approval Toggle Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleApproval(r.id);
                  }}
                  className={`p-1 rounded-md transition ${
                    isApproved
                      ? 'text-emerald-400 hover:text-emerald-300 bg-emerald-950/60'
                      : 'text-slate-500 hover:text-slate-300 bg-space-800'
                  }`}
                  title={isApproved ? 'Subsystem Certified (Click to revoke)' : 'Certify Subsystem for Launch'}
                >
                  <CheckCircle className={`w-4 h-4 ${isApproved ? 'fill-emerald-400/20' : ''}`} />
                </button>
              </div>

              <div className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                {r.responsibility}
              </div>

              <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between text-[10px] font-mono">
                <span className="text-slate-400">FOCUS: {r.keyMetric}</span>
                <span className={isApproved ? 'text-emerald-400 font-semibold' : 'text-amber-400 font-semibold'}>
                  {isApproved ? 'CERTIFIED' : 'PENDING'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
