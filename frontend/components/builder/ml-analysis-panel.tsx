"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Activity, AlertTriangle, CheckCircle, Shield, ShieldAlert, ShieldCheck, Cpu, Zap } from "lucide-react";
import { mlClient, type FPSPrediction, type BuildSpecs } from "@/lib/ml-client";
import type { BuildState } from "./builder-interface";

interface MLAnalysisPanelProps {
    build: BuildState;
}

export function MLAnalysisPanel({ build }: MLAnalysisPanelProps) {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<FPSPrediction | null>(null);
    const [resolution, setResolution] = useState<"1080p" | "1440p" | "4k">("1440p");

    const isReady = build.cpu && build.gpu && build.ram;

    const analyzeBuild = async () => {
        if (!isReady) return;
        setLoading(true);

        try {
            const specs: BuildSpecs = {
                cpu_benchmark: (build.cpu?.core_count || 6) * (build.cpu?.core_clock || 3.5) * 1000,
                gpu_benchmark: (build.gpu?.memory || 8) * (build.gpu?.core_clock || 1500),
                ram_gb: build.ram?.total_capacity || ((build.ram?.module_count || 2) * (build.ram?.module_size || 8)),
                ram_speed: build.ram?.speed_mhz || 3200,
                storage_type: build.storage[0]?.type === "NVMe" ? "nvme" : "ssd",
                target_resolution: resolution,
                cpu_tdp: build.cpu?.tdp || 65,
                gpu_tdp: (build.gpu?.memory || 8) * 30,
                psu_wattage: build.psu?.wattage || 0,
                psu_efficiency: build.psu?.efficiency || "Bronze",
                mobo_chipset: build.motherboard?.name || "B550",
                cpu_clock: build.cpu?.boost_clock || 4.0
            };

            const data = await mlClient.predictFPS(specs);
            setResult(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isReady) {
            const timer = setTimeout(analyzeBuild, 500);
            return () => clearTimeout(timer);
        } else {
            setResult(null);
        }
    }, [build.cpu, build.gpu, build.ram, build.psu, build.motherboard, resolution]);

    if (!isReady) {
        return (
            <div className="flex flex-col items-center text-center justify-center py-12 px-6">
                <motion.div
                    className="w-20 h-20 bg-gradient-to-br from-[#ffa828]/20 to-[#ff4b4b]/20 rounded-2xl flex items-center justify-center mb-4"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                >
                    <Activity className="w-10 h-10 text-[#ffa828]" />
                </motion.div>
                <h3 className="text-lg font-bold text-stone-200 mb-2">ML Analysis Engine</h3>
                <p className="text-sm text-stone-500 max-w-[250px]">
                    Select <span className="text-[#ffa828]">CPU</span>, <span className="text-[#ffa828]">GPU</span>, and <span className="text-[#ffa828]">RAM</span> to activate the AI performance predictions.
                </p>
                <div className="mt-6 flex gap-3">
                    <div className="flex items-center gap-1 text-xs text-stone-500">
                        <Cpu className="w-3 h-3" /> FPS Prediction
                    </div>
                    <div className="flex items-center gap-1 text-xs text-stone-500">
                        <Zap className="w-3 h-3" /> Bottleneck Detection
                    </div>
                    <div className="flex items-center gap-1 text-xs text-stone-500">
                        <Shield className="w-3 h-3" /> Integrity Check
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-5">
            {/* Resolution Selector */}
            <div className="flex justify-center mb-5">
                <div className="flex gap-1 bg-[#171514] p-1 rounded-lg">
                    {(["1080p", "1440p", "4k"] as const).map(res => (
                        <button
                            key={res}
                            onClick={() => setResolution(res)}
                            className={`px-5 py-2 text-xs font-bold rounded-md transition-all ${resolution === res
                                    ? "bg-gradient-to-r from-[#ff4b4b] to-[#ffa828] text-white shadow-lg"
                                    : "text-stone-400 hover:text-stone-200"
                                }`}
                        >
                            {res}
                        </button>
                    ))}
                </div>
            </div>

            {/* Loading State */}
            {loading && (
                <div className="flex flex-col items-center justify-center py-8">
                    <motion.div
                        className="w-16 h-16 border-4 border-[#ffa828] border-t-transparent rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    <span className="mt-4 text-sm text-[#ffa828] font-mono tracking-wider">ANALYZING BUILD...</span>
                </div>
            )}

            {/* Results */}
            {!loading && result && (
                <div className="space-y-5">
                    {/* FPS Gauge - HERO ELEMENT */}
                    <div className="text-center">
                        <div className="relative inline-flex items-center justify-center">
                            <svg className="w-36 h-36 transform -rotate-90">
                                <circle cx="72" cy="72" r="60" stroke="#292524" strokeWidth="8" fill="transparent" />
                                <motion.circle
                                    cx="72" cy="72" r="60"
                                    stroke={result.predicted_fps > 60 ? "#ffa828" : "#ff4b4b"}
                                    strokeWidth="8"
                                    fill="transparent"
                                    strokeLinecap="round"
                                    strokeDasharray={377}
                                    strokeDashoffset={377 - (Math.min(result.predicted_fps, 240) / 240) * 377}
                                    initial={{ strokeDashoffset: 377 }}
                                    animate={{ strokeDashoffset: 377 - (Math.min(result.predicted_fps, 240) / 240) * 377 }}
                                    transition={{ duration: 1.5, ease: "easeOut" }}
                                />
                            </svg>
                            <div className="absolute flex flex-col items-center">
                                <motion.span
                                    className="text-4xl font-black text-white"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.5, type: "spring" }}
                                >
                                    {Math.round(result.predicted_fps)}
                                </motion.span>
                                <span className="text-xs text-stone-400 font-medium uppercase tracking-wider">FPS</span>
                            </div>
                        </div>
                        <p className="text-xs text-stone-500 mt-2">Predicted @ {resolution}</p>
                    </div>

                    {/* Bottleneck Status */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className={`p-4 rounded-xl border ${result.bottleneck_severity === "none"
                                ? "bg-gradient-to-r from-[#ffa828]/10 to-transparent border-[#ffa828]/30"
                                : "bg-gradient-to-r from-[#ff4b4b]/10 to-transparent border-[#ff4b4b]/30"
                            }`}
                    >
                        <div className="flex items-start gap-3">
                            {result.bottleneck_severity === "none" ? (
                                <CheckCircle className="w-5 h-5 text-[#ffa828] mt-0.5" />
                            ) : (
                                <AlertTriangle className="w-5 h-5 text-[#ff4b4b] mt-0.5" />
                            )}
                            <div>
                                <h4 className={`text-sm font-bold ${result.bottleneck_severity === "none" ? "text-[#ffa828]" : "text-[#ff4b4b]"}`}>
                                    {result.bottleneck_severity === "none" ? "✓ System Balanced" : `⚠ ${result.bottleneck_component} Bottleneck`}
                                </h4>
                                <p className="text-xs text-stone-400 mt-1">{result.recommendation}</p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Integrity Score */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="space-y-3"
                    >
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <Shield className="w-4 h-4 text-[#c678dd]" />
                                <span className="text-sm font-bold text-stone-200">Build Integrity</span>
                            </div>
                            <span className={`text-lg font-black ${result.integrity_score >= 80 ? "text-[#c678dd]" : "text-[#ff4b4b]"}`}>
                                {result.integrity_score}%
                            </span>
                        </div>

                        <div className="h-2 bg-[#292524] rounded-full overflow-hidden">
                            <motion.div
                                className={`h-full ${result.integrity_score >= 80 ? "bg-gradient-to-r from-[#c678dd] to-[#ffa828]" : "bg-[#ff4b4b]"}`}
                                initial={{ width: 0 }}
                                animate={{ width: `${result.integrity_score}%` }}
                                transition={{ duration: 1, delay: 0.7 }}
                            />
                        </div>

                        {result.integrity_warnings.length > 0 ? (
                            <div className="bg-[#ff4b4b]/10 border border-[#ff4b4b]/20 p-3 rounded-lg space-y-1">
                                {result.integrity_warnings.map((warn, i) => (
                                    <div key={i} className="flex items-start gap-2 text-xs text-[#ff4b4b]">
                                        <ShieldAlert className="w-3 h-3 mt-0.5 shrink-0" />
                                        <span>{warn}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 text-xs text-[#c678dd]">
                                <ShieldCheck className="w-4 h-4" />
                                <span>All stability checks passed</span>
                            </div>
                        )}
                    </motion.div>
                </div>
            )}
        </div>
    );
}
