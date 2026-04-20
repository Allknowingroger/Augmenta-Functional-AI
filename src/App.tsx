import React, { useState } from 'react';
import { ThreeStage } from './components/ThreeStage';
import { FunctionalControls } from './components/FunctionalControls';
import { ImageGen } from './components/ImageGen';
import { Box, Layers, Cpu, Info, Settings, Zap, ArrowRight, Sparkles, ShieldAlert, AlertTriangle, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { FUNCTIONAL_SPECS } from './lib/constants';
import { cn } from './lib/utils';
import { getStructuralAnalysis } from './lib/gemini';

const LogItem = ({ time, level, msg }: { time: string, level: 'info' | 'warn' | 'error' | 'success', msg: string }) => {
  const colors = {
    info: "border-blue-500 bg-blue-50/50 text-blue-700",
    warn: "border-orange-500 bg-orange-50/50 text-orange-700",
    error: "border-red-500 bg-red-50/50 text-red-700",
    success: "border-green-500 bg-green-50/50 text-green-700"
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className={cn("p-4 border-l-2 rounded-r-lg", colors[level])}
    >
      <span className="font-bold opacity-50 mr-2">[{time}]</span>
      <span className="uppercase tracking-tighter font-bold mr-2">{level}:</span>
      {msg}
    </motion.div>
  );
};

export default function App() {
  const [routingActive, setRoutingActive] = useState(false);
  const [simulationType, setSimulationType] = useState<'electrical' | 'hvac' | 'plumbing' | 'structural'>('electrical');
  const [activeTab, setActiveTab] = useState<'blueprint' | 'log' | 'about' | 'visualization'>('blueprint');
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [structuralReport, setStructuralReport] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [constraints, setConstraints] = useState({
    loadBearing: true,
    ashrae: true,
    accessibility: false,
    fireCorridor: true,
    thermal: false,
    acoustic: true
  });

  const selectedSpec = selectedModuleId ? FUNCTIONAL_SPECS[selectedModuleId] : null;

  const runStructuralAudit = async () => {
    setAnalyzing(true);
    const report = await getStructuralAnalysis("Intersections detected in Central Core (Sector 0) and Structural Column #01 (Sector 2). High shear stress warning.");
    setStructuralReport(report);
    setAnalyzing(false);
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden font-sans">
      {/* Sidebar Controls */}
      <FunctionalControls 
        routingActive={routingActive} 
        setRoutingActive={setRoutingActive}
        simulationType={simulationType}
        setSimulationType={setSimulationType}
        constraints={constraints}
        setConstraints={setConstraints}
      />

      {/* Main Viewport */}
      <main className="flex-1 flex flex-col relative min-w-0">
        <header className="h-16 border-b border-slate-200 flex items-center justify-between px-6 bg-white/80 backdrop-blur-sm z-20">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Box className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-bold uppercase tracking-widest text-slate-600">Project: Michigan School #01</span>
            </div>
            <nav className="flex gap-4">
              {[
                { id: 'blueprint', label: '3D Stage', icon: Layers },
                { id: 'visualization', label: 'Visualization', icon: Sparkles },
                { id: 'log', label: 'Functional Log', icon: Cpu },
                { id: 'about', label: 'AI Thesis', icon: Info },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-3 py-1 rounded-md text-xs font-medium transition-all ${
                    activeTab === tab.id 
                    ? "bg-blue-600/10 text-blue-600" 
                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                  }`}
                >
                  <tab.icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-[10px] text-slate-400 font-mono italic font-bold">AUGMENTA v2.4 ENGINE</div>
          </div>
        </header>

        <div className="flex-1 relative">
          <AnimatePresence mode="wait">
            {activeTab === 'blueprint' && (
              <motion.div 
                key="blueprint"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full h-full relative"
              >
                <ThreeStage 
                  routingActive={routingActive} 
                  simulationType={simulationType} 
                  selectedModuleId={selectedModuleId}
                  onSelectModule={setSelectedModuleId}
                  constraints={constraints}
                />
                
                {/* Floating Functional Spec Side Panel */}
                <AnimatePresence>
                  {selectedSpec && (
                    <motion.div
                      initial={{ x: 400, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ x: 400, opacity: 0 }}
                      className="absolute top-6 right-6 bottom-6 w-80 bg-white/90 backdrop-blur-2xl border border-slate-200 rounded-2xl p-6 shadow-2xl z-30 flex flex-col"
                    >
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                          <Settings className="w-4 h-4 text-blue-600" />
                          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-900">Functional Specs</h3>
                        </div>
                        <button 
                          onClick={() => setSelectedModuleId(null)}
                          className="p-1 hover:bg-slate-100 rounded-md transition-colors"
                        >
                          <ArrowRight className="w-4 h-4 text-slate-400" />
                        </button>
                      </div>

                      <div className="flex-1 overflow-y-auto space-y-6 text-slate-900">
                        <div>
                          <h4 className="text-lg font-serif italic text-slate-900 mb-1">{selectedSpec.name}</h4>
                          <div className="flex items-center gap-2">
                            <div className="px-2 py-0.5 rounded bg-blue-600/10 text-blue-700 text-[10px] font-mono border border-blue-600/20">
                              ID: {selectedSpec.id}
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Hardware Requirements</label>
                          <div className="grid grid-cols-1 gap-2">
                            {selectedSpec.requirements.map((req, i) => (
                              <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100 group hover:border-blue-600/20 transition-colors">
                                <span className="text-[11px] text-slate-500">{req.label}</span>
                                <span className="text-xs font-bold text-slate-900">
                                  {req.value} {req.unit && <span className="text-slate-400 font-normal">{req.unit}</span>}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className={cn("p-4 rounded-xl space-y-3 transition-colors", simulationType === 'structural' ? "bg-red-500/10 border border-red-500/20" : "bg-blue-600/5 border border-blue-600/10")}>
                          <div className="flex items-center gap-2">
                            {simulationType === 'structural' ? (
                              <ShieldAlert className="w-3.5 h-3.5 text-red-600" />
                            ) : (
                              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                            )}
                            <span className={cn("text-[10px] font-bold uppercase tracking-wider", simulationType === 'structural' ? "text-red-700" : "text-blue-700")}>
                              {simulationType === 'structural' ? 'Structural Integrity Alert' : 'Functional AI Guidance'}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 leading-relaxed italic">
                            "{simulationType === 'structural' ? selectedSpec.structuralAdvice : selectedSpec.aiAdvice}"
                          </p>
                          
                          {simulationType === 'structural' && (
                            <button
                              onClick={runStructuralAudit}
                              disabled={analyzing}
                              className="w-full py-2 bg-red-600 text-white text-[10px] font-bold uppercase tracking-widest rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                              {analyzing ? <Settings className="w-3 h-3 animate-spin" /> : <ShieldAlert className="w-3 h-3" />}
                              {analyzing ? 'Analyzing Load Paths...' : 'Deep Structural Audit'}
                            </button>
                          )}
                        </div>

                        {structuralReport && simulationType === 'structural' && (
                          <div className="p-4 bg-slate-900 rounded-xl text-white font-mono text-[10px] leading-relaxed relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-2 opacity-50 group-hover:opacity-100 transition-opacity">
                              <AlertTriangle className="w-3 h-3 text-orange-400" />
                            </div>
                            <h5 className="text-orange-400 font-bold mb-2 uppercase tracking-tighter">AI Structural Findings:</h5>
                            <div className="whitespace-pre-wrap">{structuralReport}</div>
                          </div>
                        )}
                      </div>

                      <div className="mt-6 pt-6 border-t border-slate-100">
                        <button className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-all">
                          <Zap className="w-3.5 h-3.5" />
                          VALIDATE PARAMETERS
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {activeTab === 'visualization' && (
              <motion.div 
                key="visualization"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full h-full"
              >
                <ImageGen />
              </motion.div>
            )}

            {activeTab === 'log' && (
              <motion.div 
                key="log"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="w-full h-full p-12 bg-white overflow-y-auto"
              >
                <div className="max-w-3xl mx-auto space-y-12">
                  <header>
                    <h2 className="text-3xl font-light text-slate-950 mb-2 font-serif italic">Agentic Decision Log</h2>
                    <p className="text-slate-500 text-sm">Real-time trace of the functional generative AI.</p>
                  </header>

                  <div className="space-y-4 font-mono text-[11px]">
                    {!routingActive && (
                      <div className="p-8 border border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-slate-400 space-y-2">
                        <Activity className="w-6 h-6 opacity-20" />
                        <span className="text-[10px] font-bold uppercase tracking-widest italic">Waiting for Agentic Engine...</span>
                      </div>
                    )}
                    
                    {routingActive && (
                      <>
                        <LogItem time="00:01" level="info" msg={`Initializing ${simulationType} sub-layer voxelization...`} />
                        {constraints.loadBearing ? (
                          <LogItem time="00:04" level="success" msg="Structural nodes locked. Load-bearing integrity constraint ACTIVE." />
                        ) : (
                          <LogItem time="00:04" level="warn" msg="Structural safeguard BYPASSED. Path optimization prioritized over integrity." />
                        )}
                        
                        <LogItem time="00:12" level="info" msg="Detecting thermal intersections in Sector 4B..." />
                        
                        {simulationType === 'structural' && (
                          <LogItem time="00:25" level="error" msg="CRITICAL: COMPONENT 'CENTRAL_CORE' LOAD THRESHOLD EXCEEDED (54.2kN)." />
                        )}

                        <LogItem time="00:42" level="success" msg={`Optimal ${simulationType} solution converged. Loss: 0.012.`} />
                      </>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-6 bg-slate-50 rounded-xl border border-slate-200">
                      <h4 className="text-xs font-bold text-slate-500 uppercase mb-4 tracking-tighter">Physics Verification</h4>
                      <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full w-[94%] bg-blue-600" />
                      </div>
                    </div>
                    <div className="p-6 bg-slate-50 rounded-xl border border-slate-200">
                      <h4 className="text-xs font-bold text-slate-500 uppercase mb-4 tracking-tighter">
                        {simulationType === 'structural' ? 'Structural Factor' : 'Code Compliance'}
                      </h4>
                      <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                        <div className={cn("h-full transition-all duration-1000", simulationType === 'structural' ? "w-[62%] bg-red-600" : "w-[100%] bg-green-600")} />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'about' && (
              <motion.div 
                key="about"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full h-full p-12 bg-white overflow-y-auto"
              >
                <div className="max-w-2xl mx-auto prose prose-blue">
                  <h1 className="text-4xl font-serif italic text-slate-950">The Thesis of Functional AI</h1>
                  <p className="text-lg text-slate-600 leading-relaxed uppercase font-bold tracking-tighter">
                    Current 3D GenAI is trapped in "image-space"—generating based on how things look. 
                    Augmenta shifts the paradigm toward **Functional Automation**.
                  </p>
                  <div className="grid grid-cols-2 gap-8 my-8">
                    <div>
                      <h3 className="text-blue-600 font-bold mb-2">Observation Space</h3>
                      <p className="text-sm text-slate-500">Surface topology, voxel accuracy, textures, and aesthetic renders.</p>
                    </div>
                    <div>
                      <h3 className="text-green-600 font-bold mb-2">Interaction Space</h3>
                      <p className="text-sm text-slate-500">Constraint satisfaction, construction intelligence, and mechanical interplay.</p>
                    </div>
                  </div>
                  <blockquote className="border-l-4 border-blue-600 pl-6 py-4 italic text-slate-700 bg-blue-50/50">
                    "The 3D world we live in is not only to be observed... it is to be interacted with."
                  </blockquote>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Global Floating HUD */}
        <div className="absolute bottom-6 left-6 right-6 flex flex-col items-center gap-4 pointer-events-none">
          <AnimatePresence>
            {simulationType === 'structural' && routingActive && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 20, opacity: 0 }}
                className="pointer-events-auto"
              >
                <button 
                  onClick={runStructuralAudit}
                  disabled={analyzing}
                  className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-2xl flex items-center gap-3 text-xs font-bold transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                >
                  {analyzing ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <AlertTriangle className="w-4 h-4" />
                  )}
                  {analyzing ? 'ANALYZING LOAD IMPACT...' : 'GENERATE STRUCTURAL AUDIT'}
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="bg-white/90 backdrop-blur-xl border border-slate-200 px-6 py-3 rounded-full pointer-events-auto flex items-center gap-8 shadow-xl">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-600" />
              <span className="text-[10px] font-bold text-slate-900 uppercase tracking-tighter">Augmenta Engine v2.4</span>
            </div>
            <div className="w-[1px] h-4 bg-slate-200" />
            <div className="text-[10px] text-slate-500 font-bold uppercase">
              {simulationType === 'structural' ? 'Structural Safety Protocol Active' : 'READY FOR DEPLOYMENT TO BIM v3'}
            </div>
          </div>
        </div>

        {/* Structural Report Modal */}
        <AnimatePresence>
          {structuralReport && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => setStructuralReport(null)}
            >
              <motion.div 
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden border border-slate-200"
                onClick={e => e.stopPropagation()}
              >
                <div className="bg-red-600 p-8 text-white">
                  <div className="flex items-center gap-3 mb-4">
                    <ShieldAlert className="w-8 h-8" />
                    <h2 className="text-2xl font-serif italic">Structural Integrity Audit</h2>
                  </div>
                  <p className="text-red-100 text-sm font-medium tracking-wide border-t border-white/20 pt-4">
                    CRITICAL: MEP routing violates primary vertical load-bearing members. Potential shear stress concentrations identified in the building's central core.
                  </p>
                </div>
                <div className="p-8 space-y-6">
                  <div className="space-y-2">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">AI Alternative Solutions</h4>
                    <div className="text-sm text-slate-600 leading-relaxed font-medium">
                      {structuralReport}
                    </div>
                  </div>
                  <div className="pt-6 border-t border-slate-100 flex justify-end">
                    <button 
                      onClick={() => setStructuralReport(null)}
                      className="px-6 py-2 bg-slate-900 text-white text-xs font-bold rounded-lg hover:bg-slate-800 transition-colors"
                    >
                      DISMISS AUDIT
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
