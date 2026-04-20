import React, { useMemo, useState, useEffect } from 'react';
import { Cable, Wind, Droplets, Zap, ShieldAlert, Cpu, Activity, BarChart3, Sparkles, Ruler } from 'lucide-react';
import { cn } from '../lib/utils';
import { LineChart, Line, ResponsiveContainer, YAxis, XAxis, Tooltip } from 'recharts';

interface ControlProps {
  routingActive: boolean;
  setRoutingActive: (v: boolean) => void;
  simulationType: 'electrical' | 'hvac' | 'plumbing' | 'structural';
  setSimulationType: (v: 'electrical' | 'hvac' | 'plumbing' | 'structural') => void;
  constraints: Record<string, boolean>;
  setConstraints: (v: any) => void;
}

const analyticsDataTemplate = [
  { step: 0, loss: 0.8 },
  { step: 10, loss: 0.65 },
  { step: 20, loss: 0.4 },
  { step: 30, loss: 0.25 },
  { step: 40, loss: 0.15 },
  { step: 50, loss: 0.05 },
  { step: 60, loss: 0.02 },
];

export const FunctionalControls = ({ 
  routingActive, 
  setRoutingActive, 
  simulationType, 
  setSimulationType,
  constraints,
  setConstraints
}: ControlProps) => {
  const [displayData, setDisplayData] = useState(analyticsDataTemplate.map(d => ({ ...d, loss: 0.8 })));
  const [iterations, setIterations] = useState(0);

  useEffect(() => {
    let interval: any;
    if (routingActive) {
      setIterations(0);
      interval = setInterval(() => {
        setIterations(prev => prev + Math.floor(Math.random() * 50) + 10);
        setDisplayData(prev => {
          return prev.map((d, i) => {
            const target = analyticsDataTemplate[i].loss;
            const current = d.loss;
            if (current > target) {
              return { ...d, loss: Math.max(target, current - 0.02 * (Math.random() + 0.5)) };
            }
            return d;
          });
        });
      }, 100);
    } else {
      setDisplayData(analyticsDataTemplate.map(d => ({ ...d, loss: 0.8 })));
      setIterations(0);
    }
    return () => clearInterval(interval);
  }, [routingActive]);

  const toggleConstraint = (key: string) => {
    setConstraints((prev: any) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="flex flex-col h-full bg-white border-r border-slate-200 w-80 p-6 overflow-y-auto shadow-sm">
      <div className="flex items-center gap-2 mb-8">
        <Cpu className="w-6 h-6 text-blue-600" />
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Functional AI</h1>
      </div>

      <div className="space-y-8 pb-12 text-slate-600">
        <section>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">
            System Sub-Layers
          </label>
          <div className="space-y-2">
            {[
              { id: 'electrical', label: 'Electrical MEP', icon: Zap },
              { id: 'hvac', label: 'HVAC Airflow', icon: Wind },
              { id: 'plumbing', label: 'Hydraulic Systems', icon: Droplets },
              { id: 'structural', label: 'Structural Integrity', icon: Ruler },
            ].map((sys) => (
              <button
                key={sys.id}
                onClick={() => setSimulationType(sys.id as any)}
                className={cn(
                  "w-full flex items-center justify-between p-3 rounded-lg border transition-all text-left",
                  simulationType === sys.id 
                    ? "bg-blue-600/10 border-blue-600/50 text-blue-700 font-bold" 
                    : "bg-slate-50/50 border-slate-100 text-slate-500 hover:border-slate-200 hover:bg-slate-100/50"
                )}
              >
                <div className="flex items-center gap-3">
                  <sys.icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{sys.label}</span>
                </div>
                {simulationType === sys.id && (
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.4)]" />
                )}
              </button>
            ))}
          </div>
        </section>

        <section>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">
            Agentic Engine
          </label>
          <button
            onClick={() => setRoutingActive(!routingActive)}
            className={cn(
              "w-full group relative overflow-hidden p-6 rounded-xl border transition-all",
              routingActive
                ? "bg-green-600/10 border-green-600/50 text-green-700"
                : "bg-slate-50 border-slate-100 text-slate-500 hover:bg-slate-100/50 hover:border-slate-200"
            )}
          >
            <div className="flex flex-col items-center gap-2 relative z-10">
              <Activity className={cn("w-8 h-8", routingActive && "animate-pulse")} />
              <span className="text-sm font-bold uppercase tracking-widest text-center">
                {routingActive ? 'OPTIMIZING PATH...' : 'INITIATE PATHFINDER'}
              </span>
            </div>
            {routingActive && (
              <div className="absolute inset-0 bg-gradient-to-t from-green-500/10 to-transparent" />
            )}
          </button>
        </section>

        {routingActive && (
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-slate-400 mb-2">
              <BarChart3 className="w-3 h-3 text-blue-600" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Convergence Analytics</span>
            </div>
            <div className="h-32 w-full bg-slate-50 border border-slate-100 rounded-xl p-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={displayData}>
                  <Line type="monotone" dataKey="loss" stroke="#2563eb" strokeWidth={2} dot={false} isAnimationActive={false} />
                  <YAxis hide domain={[0, 1]} />
                  <XAxis hide />
                  <Tooltip 
                    contentStyle={{ background: '#ffffff', border: '1px solid #e2e8f0', fontSize: '10px', color: '#1e293b' }}
                    labelStyle={{ display: 'none' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-between text-[10px] font-mono text-slate-400 px-1 font-bold">
              <span>LOSS: {displayData[displayData.length - 1].loss.toFixed(3)}</span>
              <span>ITERATIONS: {(iterations / 1000).toFixed(1)}k</span>
            </div>
          </section>
        )}

        <section className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-4 shadow-inner">
          <div className="flex items-center gap-2 text-slate-500">
            <ShieldAlert className="w-4 h-4 text-orange-600" />
            <span className="text-xs font-bold uppercase">Constraints</span>
          </div>
          <div className="space-y-3">
            <ConstraintToggle 
              label="Load Bearing Safety" 
              active={constraints.loadBearing} 
              onClick={() => toggleConstraint('loadBearing')} 
            />
            <ConstraintToggle 
              label="ASHRAE 90.1 Compliance" 
              active={constraints.ashrae} 
              onClick={() => toggleConstraint('ashrae')} 
            />
            <ConstraintToggle 
              label="Accessibility Clearances" 
              active={constraints.accessibility} 
              onClick={() => toggleConstraint('accessibility')} 
            />
            <ConstraintToggle 
              label="Fire Corridor Integrity" 
              active={constraints.fireCorridor} 
              onClick={() => toggleConstraint('fireCorridor')} 
            />
            <ConstraintToggle 
              label="Thermal Expansion Guard" 
              active={constraints.thermal} 
              onClick={() => toggleConstraint('thermal')} 
            />
            <ConstraintToggle 
              label="Acoustic Vibration Buffer" 
              active={constraints.acoustic} 
              onClick={() => toggleConstraint('acoustic')} 
            />
          </div>
        </section>

        <section className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-slate-50 border border-blue-600/10">
          <div className="flex items-center gap-2 text-blue-600 mb-3">
            <Sparkles className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-widest">Foundation Model</span>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed mb-4">
            Construction Intelligence Training (CIT) enabled. Cross-referencing 1.2M historical MEP schematics from Michigan projects.
          </p>
          <div className="grid grid-cols-2 gap-2">
            <div className="p-2 bg-white rounded border border-slate-100 text-center shadow-sm">
              <div className="text-[10px] text-slate-400 uppercase mb-1">Accuracy</div>
              <div className="text-xs font-bold text-slate-900">{(99.5 + Math.random() * 0.4).toFixed(2)}%</div>
            </div>
            <div className="p-2 bg-white rounded border border-slate-100 text-center shadow-sm">
              <div className="text-[10px] text-slate-400 uppercase mb-1">Latency</div>
              <div className="text-xs font-bold text-slate-900">{Math.floor(Math.random() * 5 + 10)}ms</div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

const ConstraintToggle = ({ label, active, onClick }: { label: string, active: boolean, onClick: () => void }) => (
  <div className="flex items-center justify-between group cursor-pointer" onClick={onClick}>
    <span className={cn(
      "text-[11px] transition-colors",
      active ? "text-slate-900 font-bold" : "text-slate-400"
    )}>{label}</span>
    <div className={cn(
      "w-8 h-4 rounded-full p-0.5 transition-colors",
      active ? "bg-blue-600" : "bg-slate-200"
    )}>
      <div className={cn(
        "w-3 h-3 bg-white rounded-full transition-transform shadow-sm",
        active ? "translate-x-4" : "translate-x-0"
      )} />
    </div>
  </div>
);
