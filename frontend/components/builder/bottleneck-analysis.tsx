"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, Zap, TrendingUp, AlertTriangle, CheckCircle, Loader2 } from "lucide-react";
import type { BuildState } from "./builder-interface";
import type { FPSPrediction, EcosystemComparison } from "@/lib/types/database";

// Type for individual ecosystem comparison item
interface ComparisonItem {
  system: string;
  price: number;
  fps_1080p: number;
  your_value_vs_system: number;
  recommendation: string;
}

interface BottleneckAnalysisProps {
  build: BuildState;
  onClose: () => void;
}

export function BottleneckAnalysis({ build, onClose }: BottleneckAnalysisProps) {
  const [loading, setLoading] = useState(true);
  const [prediction, setPrediction] = useState<FPSPrediction | null>(null);
  const [ecosystem, setEcosystem] = useState<EcosystemComparison | null>(null);
  const [resolution, setResolution] = useState<"1080p" | "1440p" | "4k">("1080p");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const analyze = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Prepare build specs - RAM uses flattened fields: speed_ddr, speed_mhz, module_count, module_size
        const ramGB = build.ram?.total_capacity 
          || (build.ram?.module_count && build.ram?.module_size 
            ? build.ram.module_count * build.ram.module_size 
            : 16);
        const ramSpeed = build.ram?.speed_mhz || 3200;
        
        const specs = {
          cpu_benchmark: build.cpu?.benchmark_score || 15000,
          gpu_benchmark: build.gpu?.benchmark_score || 13000,
          ram_gb: ramGB,
          ram_speed: ramSpeed,
          storage_type: build.storage.some(s => s.type?.toLowerCase().includes("nvme")) 
            ? "nvme" 
            : build.storage.some(s => s.type === "SSD") 
              ? "ssd" 
              : "hdd",
          target_resolution: resolution,
        };

        // Calculate total price
        const totalPrice = (build.cpu?.price || 0) + 
          (build.gpu?.price || 0) + 
          (build.motherboard?.price || 0) + 
          (build.ram?.price || 0) + 
          (build.psu?.price || 0) +
          (build.case?.price || 0) + 
          (build.cooler?.price || 0) + 
          build.storage.reduce((sum, s) => sum + (s.price || 0), 0);

        // Try to call ML Engine, fallback to local calculation
        try {
          const mlUrl = process.env.NEXT_PUBLIC_ML_ENGINE_URL || "http://localhost:8000";
          
          const fpsResponse = await fetch(`${mlUrl}/predict/fps`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(specs),
          });
          
          if (fpsResponse.ok) {
            const fpsData = await fpsResponse.json();
            setPrediction(fpsData);

            // Get ecosystem comparison
            const ecoResponse = await fetch(
              `${mlUrl}/ecosystem/compare?build_price=${totalPrice}&build_fps_1080p=${fpsData.predicted_fps}`
            );
            
            if (ecoResponse.ok) {
              setEcosystem(await ecoResponse.json());
            }
          } else {
            // Fallback to local calculation
            calculateLocally(specs, totalPrice);
          }
        } catch {
          // ML Engine not available, use local calculation
          calculateLocally(specs, totalPrice);
        }
      } catch {
        setError("Failed to analyze build. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    const calculateLocally = (specs: { cpu_benchmark: number; gpu_benchmark: number; ram_gb: number; ram_speed: number; storage_type: string; target_resolution: "1080p" | "1440p" | "4k" }, totalPrice: number) => {
      // Local FPS estimation based on benchmark scores
      const resolutionFactors = { "1080p": 1, "1440p": 0.65, "4k": 0.35 } as const;
      const cpuFactors = { "1080p": 0.3, "1440p": 0.2, "4k": 0.1 } as const;
      const resolutionFactor = resolutionFactors[specs.target_resolution];
      const cpuFactor = cpuFactors[specs.target_resolution];
      
      const baseFps = (
        (specs.gpu_benchmark / 300) * resolutionFactor +
        (specs.cpu_benchmark / 1000) * cpuFactor +
        (specs.ram_gb / 16) * 5
      );
      
      const predictedFps = Math.min(240, Math.max(30, baseFps));
      
      // Determine bottleneck
      const gpuCpuRatio = specs.gpu_benchmark / specs.cpu_benchmark;
      let bottleneck = "none";
      let severity: "none" | "minor" | "moderate" | "severe" = "none";
      let recommendation = "Well-balanced build!";
      
      if (gpuCpuRatio > 0.9) {
        bottleneck = "CPU";
        severity = gpuCpuRatio > 1.2 ? "severe" : gpuCpuRatio > 1 ? "moderate" : "minor";
        recommendation = `Your CPU may limit GPU performance at ${specs.target_resolution}. Consider upgrading.`;
      } else if (gpuCpuRatio < 0.4) {
        bottleneck = "GPU";
        severity = gpuCpuRatio < 0.2 ? "severe" : gpuCpuRatio < 0.3 ? "moderate" : "minor";
        recommendation = "Your GPU is the limiting factor. Upgrade for better frame rates.";
      }
      
      setPrediction({
        predicted_fps: Math.round(predictedFps),
        bottleneck_component: bottleneck,
        bottleneck_severity: severity,
        recommendation,
      });
      
      // Local ecosystem comparison
      const buildValue = predictedFps / totalPrice;
      const comparisons = [
        { system: "PlayStation 5", price: 499, fps_1080p: 60 },
        { system: "Xbox Series X", price: 499, fps_1080p: 60 },
        { system: "Steam Deck OLED", price: 549, fps_1080p: 40 },
        { system: "Budget Gaming Laptop", price: 799, fps_1080p: 60 },
        { system: "Mid-Range Gaming Laptop", price: 1299, fps_1080p: 100 },
      ].map(sys => ({
        ...sys,
        your_value_vs_system: Math.round(((buildValue - sys.fps_1080p / sys.price) / (sys.fps_1080p / sys.price)) * 100),
        recommendation: buildValue > sys.fps_1080p / sys.price * 1.1 
          ? "Your build is better value"
          : buildValue > sys.fps_1080p / sys.price * 0.9
            ? "Similar value"
            : `Consider ${sys.system} instead`,
      }));
      
      setEcosystem({
        your_build: { price: totalPrice, fps_1080p: Math.round(predictedFps), value_score: Math.round(buildValue * 100) },
        comparisons,
        best_value_alternative: buildValue < 0.12 ? comparisons[0].system : null,
      });
    };

    analyze();
  }, [build, resolution]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "none": return "text-emerald-400";
      case "minor": return "text-yellow-400";
      case "moderate": return "text-amber-400";
      case "severe": return "text-red-400";
      default: return "text-zinc-400";
    }
  };

  const getSeverityBg = (severity: string) => {
    switch (severity) {
      case "none": return "bg-emerald-500/20 border-emerald-500/30";
      case "minor": return "bg-yellow-500/20 border-yellow-500/30";
      case "moderate": return "bg-amber-500/20 border-amber-500/30";
      case "severe": return "bg-red-500/20 border-red-500/30";
      default: return "bg-zinc-500/20 border-zinc-500/30";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-2xl max-h-[90vh] bg-zinc-900 border border-zinc-700 rounded-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-cyan-600 rounded-xl flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Build Analysis</h2>
              <p className="text-sm text-zinc-400">ML-powered performance prediction</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-violet-500 animate-spin mb-4" />
              <p className="text-zinc-400">Analyzing your build...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
              <p className="text-zinc-300">{error}</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Resolution Selector */}
              <div className="flex items-center gap-4">
                <span className="text-sm text-zinc-400">Target Resolution:</span>
                <div className="flex gap-2">
                  {(["1080p", "1440p", "4k"] as const).map((res) => (
                    <button
                      key={res}
                      onClick={() => setResolution(res)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        resolution === res
                          ? "bg-violet-600 text-white"
                          : "bg-zinc-800 text-zinc-400 hover:text-white"
                      }`}
                    >
                      {res}
                    </button>
                  ))}
                </div>
              </div>

              {/* FPS Prediction */}
              {prediction && (
                <div className="p-6 bg-zinc-800/50 rounded-xl border border-zinc-700">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">Predicted Performance</h3>
                    <span className="text-3xl font-bold text-emerald-400">
                      {prediction.predicted_fps} FPS
                    </span>
                  </div>
                  
                  {/* FPS Bar */}
                  <div className="relative h-4 bg-zinc-700 rounded-full overflow-hidden mb-4">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, (prediction.predicted_fps / 144) * 100)}%` }}
                      className="h-full bg-gradient-to-r from-violet-500 to-cyan-500 rounded-full"
                      transition={{ duration: 1, ease: "easeOut" }}
                    />
                    <div className="absolute top-0 left-[41.6%] h-full w-px bg-zinc-500" title="60 FPS" />
                    <div className="absolute top-0 left-[83.3%] h-full w-px bg-zinc-500" title="120 FPS" />
                  </div>
                  <div className="flex justify-between text-xs text-zinc-500">
                    <span>0</span>
                    <span>60</span>
                    <span>120</span>
                    <span>144+</span>
                  </div>
                </div>
              )}

              {/* Bottleneck Analysis */}
              {prediction && (
                <div className={`p-4 rounded-xl border ${getSeverityBg(prediction.bottleneck_severity)}`}>
                  <div className="flex items-start gap-3">
                    {prediction.bottleneck_severity === "none" ? (
                      <CheckCircle className="w-5 h-5 text-emerald-400 mt-0.5" />
                    ) : (
                      <AlertTriangle className={`w-5 h-5 ${getSeverityColor(prediction.bottleneck_severity)} mt-0.5`} />
                    )}
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">
                          {prediction.bottleneck_component === "none" 
                            ? "No Bottleneck Detected" 
                            : `${prediction.bottleneck_component} Bottleneck`}
                        </span>
                        {prediction.bottleneck_severity !== "none" && (
                          <span className={`text-xs px-2 py-0.5 rounded-full ${getSeverityColor(prediction.bottleneck_severity)} bg-current/10`}>
                            {prediction.bottleneck_severity}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-zinc-300">{prediction.recommendation}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Ecosystem Comparison */}
              {ecosystem && (
                <div>
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-violet-400" />
                    Ecosystem Comparison
                  </h3>
                  
                  <div className="space-y-3">
                    {ecosystem.comparisons.map((comp: ComparisonItem) => (
                      <div 
                        key={comp.system}
                        className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg border border-zinc-700"
                      >
                        <div>
                          <span className="font-medium">{comp.system}</span>
                          <div className="text-xs text-zinc-400">
                            ${comp.price} • {comp.fps_1080p} FPS @ 1080p
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-sm font-medium ${
                            comp.your_value_vs_system > 10 
                              ? "text-emerald-400" 
                              : comp.your_value_vs_system > -10 
                                ? "text-yellow-400" 
                                : "text-red-400"
                          }`}>
                            {comp.your_value_vs_system > 0 ? "+" : ""}{comp.your_value_vs_system}%
                          </div>
                          <div className="text-xs text-zinc-500">{comp.recommendation}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {ecosystem.best_value_alternative && (
                    <div className="mt-4 p-4 bg-amber-950/30 border border-amber-800/50 rounded-lg">
                      <p className="text-sm text-amber-200">
                        💡 <strong>Tip:</strong> A {ecosystem.best_value_alternative} might offer better value for your budget.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
