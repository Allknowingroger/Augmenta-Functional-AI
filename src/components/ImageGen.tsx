import React, { useState } from 'react';
import { generateConstructionImage } from '../lib/gemini';
import { ImageIcon, Loader2, Maximize, CheckCircle, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

type ImageSize = "1K" | "2K" | "4K";
type AspectRatio = "16:9" | "9:16" | "1:1" | "4:3";

export const ImageGen = () => {
  const [prompt, setPrompt] = useState("");
  const [size, setSize] = useState<ImageSize>("1K");
  const [ratio, setRatio] = useState<AspectRatio>("16:9");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt) return;
    
    setLoading(true);
    setError(null);
    try {
      const url = await generateConstructionImage(prompt, size, ratio);
      setResult(url);
    } catch (err: any) {
      setError(err.message || "Failed to generate image.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-full p-12 bg-white overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        <header className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <ImageIcon className="w-8 h-8 text-blue-600" />
            <h2 className="text-3xl font-serif italic text-slate-950">GenAI Visualization</h2>
          </div>
          <p className="text-slate-500 text-lg leading-relaxed font-medium">
            Generate high-fidelity functional construction renders using Gemini 3 Pro. 
            Synthesize conceptual visions with BIM-validated constraints.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <form onSubmit={handleGenerate} className="space-y-8">
            <div className="p-8 bg-slate-50 rounded-3xl border border-slate-200 space-y-6">
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-3">
                  Design Context & Engineering Intent
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g. Electrical conduit layout for a 20,000 sq ft server room with thermal vents..."
                  className="w-full h-48 px-6 py-4 bg-white border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 resize-none text-sm shadow-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                    Target Resolution
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(["1K", "2K", "4K"] as ImageSize[]).map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setSize(s)}
                        className={cn(
                          "py-2.5 text-[10px] font-mono rounded-xl border transition-all shadow-sm",
                          size === s 
                            ? "bg-blue-600 border-blue-600 text-white font-bold" 
                            : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"
                        )}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                    Aspect Ratio
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {(["16:9", "9:16", "1:1", "4:3"] as AspectRatio[]).map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setRatio(r)}
                        className={cn(
                          "py-2 text-[9px] font-mono rounded-xl border transition-all shadow-sm",
                          ratio === r 
                            ? "bg-blue-600 border-blue-600 text-white font-bold" 
                            : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"
                        )}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button
                disabled={loading || !prompt}
                className="w-full py-4 bg-slate-950 hover:bg-slate-800 disabled:opacity-50 text-white font-bold rounded-2xl flex items-center justify-center gap-3 transition-all shadow-xl hover:scale-[1.02] active:scale-[0.98]"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Synthesizing Final Render...
                  </>
                ) : (
                  <>
                    <Maximize className="w-5 h-5" />
                    Generate High-Fidelity Visualization
                  </>
                )}
              </button>
            </div>

            <div className="p-6 bg-blue-50 border border-blue-100 rounded-3xl">
              <p className="text-xs text-blue-800/70 leading-relaxed italic font-medium">
                "GenAI renders prioritize structural intent over absolute dimensional accuracy. Renders provide conceptual validation for aesthetic and volumetric planning."
              </p>
            </div>
          </form>

          <div className="relative min-h-[400px]">
            <AnimatePresence mode="wait">
              {!result && !loading && !error && (
                <motion.div
                  key="placeholder"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-3xl text-slate-300"
                >
                  <ImageIcon className="w-16 h-16 mb-4 opacity-20" />
                  <p className="text-sm font-bold uppercase tracking-widest">Waiting for Input</p>
                </motion.div>
              )}

              {loading && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50/50 backdrop-blur-sm rounded-3xl z-10"
                >
                  <div className="w-12 h-12 border-4 border-blue-600/30 border-t-blue-600 rounded-full animate-spin mb-4" />
                  <p className="text-sm font-bold text-blue-600 uppercase tracking-widest">Generating Render...</p>
                </motion.div>
              )}

              {error && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-8 bg-red-50 border border-red-100 rounded-3xl text-sm text-red-600 font-bold"
                >
                  {error}
                </motion.div>
              )}

              {result && (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-6"
                >
                  <div className="relative group rounded-3xl overflow-hidden border border-slate-200 shadow-2xl">
                    <img src={result} alt="Generated Design" className="w-full h-auto" />
                    <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity gap-4">
                      <a 
                        href={result} 
                        download="augmenta-design.png"
                        className="p-4 bg-blue-600 hover:bg-blue-700 rounded-full shadow-2xl transition-all hover:scale-110 text-white"
                      >
                        <Download className="w-6 h-6" />
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-green-600 text-sm font-mono font-bold px-4">
                    <CheckCircle className="w-4 h-4" />
                    VISUALIZATION COMPLETE ({size} | {ratio})
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};
