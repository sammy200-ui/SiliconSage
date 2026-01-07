"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Activity, AlertTriangle, CheckCircle, Gauge, Shield, ShieldAlert, ShieldCheck } from "lucide-react";
import { mlClient, type FPSPrediction, type BuildSpecs } from "@/lib/ml-client";
import type { BuildState } from "./builder-interface";

interface MLAnalysisPanelProps {
    build: BuildState;
}

export function MLAnalysisPanel({ build }: MLAnalysisPanelProps) {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<FPSPrediction | null>(null);
    const [resolution, setResolution] = useState<"1080p" | "1440p" | "4k">("1440p");

    // Determine if build is ready for analysis (Basic CPU/GPU/RAM + PSU logic for integrity)
    const isReady = build.cpu && build.gpu && build.ram;

    const analyzeBuild = async () => {
        if (!isReady) return;
        setLoading(true);

        try {
            // Map frontend build state to backend ML specs
            // Mocking missing data field accesses where DB types might be incomplete in frontend state
            const specs: BuildSpecs = {
                cpu_benchmark: (build.cpu?.core_count || 6) * (build.cpu?.core_clock || 3.5) * 1000,
                gpu_benchmark: (build.gpu?.memory || 8) * (build.gpu?.core_clock || 1500),
                ram_gb: build.ram?.total_capacity || ((build.ram?.module_count || 2) * (build.ram?.module_size || 8)),
                ram_speed: build.ram?.speed_mhz || 3200,
                storage_type: build.storage[0]?.type === "NVMe" ? "nvme" : "ssd",
                target_resolution: resolution,

                // Integrity Inputs
                cpu_tdp: build.cpu?.tdp || 65,
                gpu_tdp: (build.gpu?.memory || 8) * 30, // Estimating TDP if missing: ~30W per GB VRAM roughly
                psu_wattage: build.psu?.wattage || 0,
                psu_efficiency: build.psu?.efficiency || "Bronze",
                mobo_chipset: build.motherboard?.name || "B550", // Heuristic using name if chipset missing
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

    // Re-analyze when key parts change or resolution changes
    useEffect(() => {
        if (isReady) {
            // Debounce slightly 
            const timer = setTimeout(analyzeBuild, 500);
            return () => clearTimeout(timer);
        } else {
            setResult(null);
        }
    }, [build.cpu, build.gpu, build.ram, build.psu, build.motherboard, resolution]);

    if (!isReady) {
        return (
            <div className="p-6 bg-[#1c1917] border border-[#292524] rounded-xl flex flex-col items-center text-center justify-center h-[300px]">
                <div className="w-12 h-12 bg-[#292524] rounded-full flex items-center justify-center mb-4">
                    <Activity className="w-6 h-6 text-stone-500" />
                </div>
                <h3 className="text-stone-300 font-medium mb-2">System Analysis Lab</h3>
                <p className="text-sm text-stone-500 max-w-[200px]">
                    Select CPU, GPU, and RAM to activate the AI performance engine.
                </p>
            </div>
        );
    }

    return (
        <div className="bg-[#1c1917] border border-[#292524] rounded-xl overflow-hidden flex flex-col h-full min-h-[500px]">
            {/* Header */}
            <div className="p-4 border-b border-[#292524] flex justify-between items-center bg-[#171514]">
                <div className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-[#ff4b4b]" />
                    <span className="font-bold text-stone-200">System Analysis Lab</span>
                </div>
                <div className="flex gap-1 bg-[#292524] p-1 rounded-lg">
                    {(["1080p", "1440p", "4k"] as const).map(res => (
                        <button
                            key={res}
                            onClick={() => setResolution(res)}
                            className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${resolution === res ? "bg-[#ff4b4b] text-white" : "text-stone-400 hover:text-stone-200"
                                }`}
                        >
                            {res}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 p-6 relative">
                {loading && (
                    <div className="absolute inset-0 bg-[#1c1917]/80 backdrop-blur-sm z-10 flex items-center justify-center">
                        <div className="flex flex-col items-center gap-3">
                            <div className="w-8 h-8 border-2 border-[#ff4b4b] border-t-transparent rounded-full animate-spin" />
                            <span className="text-xs text-[#ff4b4b] font-mono">ANALYZING SYSTEM...</span>
                        </div>
                    </div>
                )}

                {result ? (
                    <div className="space-y-8">
                        {/* FPS Gauge */}
                        <div className="text-center">
                            <div className="relative inline-flex items-center justify-center">
                                <svg className="w-32 h-32 transform -rotate-90">
                                    <circle cx="64" cy="64" r="56" stroke="#292524" strokeWidth="8" fill="transparent" />
                                    <motion.circle
                                        cx="64" cy="64" r="56"
                                        stroke={result.predicted_fps > 60 ? "#ffa828" : "#ff4b4b"}
                                        strokeWidth="8"
                                        fill="transparent"
                                        strokeDasharray={351}
                                        strokeDashoffset={351 - (Math.min(result.predicted_fps, 240) / 240) * 351}
                                        initial={{ strokeDashoffset: 351 }}
                                        animate={{ strokeDashoffset: 351 - (Math.min(result.predicted_fps, 240) / 240) * 351 }}
                                        transition={{ duration: 1, ease: "easeOut" }}
                                    />
                                </svg>
                                <div className="absolute flex flex-col items-center">
                                    <span className="text-3xl font-bold text-white">{Math.round(result.predicted_fps)}</span>
                                    <span className="text-xs text-stone-500 font-medium">FPS Est.</span>
                                </div>
                            </div>
                        </div>

                        {/* Bottleneck Alert */}
                        <div className={`p-4 rounded-xl border ${result.bottleneck_severity === "none"
                                ? "bg-[#ffa828]/5 border-[#ffa828]/20"
                                : result.bottleneck_severity === "severe"
                                    ? "bg-[#ff4b4b]/10 border-[#ff4b4b]/30"
                                    : "bg-[#292524] border-[#44403c]"
                            }`}>
                            <div className="flex items-start gap-3">
                                {result.bottleneck_severity === "none" ? (
                                    <CheckCircle className="w-5 h-5 text-[#ffa828] mt-0.5" />
                                ) : (
                                    <AlertTriangle className="w-5 h-5 text-[#ff4b4b] mt-0.5" />
                                )}
                                <div>
                                    <h4 className={`text-sm font-bold mb-1 ${result.bottleneck_severity === "none" ? "text-[#ffa828]" : "text-[#ff4b4b]"
                                        }`}>
                                        {result.bottleneck_severity === "none" ? "System Balanced" : `${result.bottleneck_component} Bottleneck`}
                                    </h4>
                                    <p className="text-xs text-stone-300 leading-relaxed">
                                        {result.recommendation}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Build Integrity Score */}
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <Shield className="w-4 h-4 text-[#c678dd]" />
                                    <span className="text-sm font-bold text-stone-200">Build Integrity</span>
                                </div>
                                <span className={`text-sm font-bold ${result.integrity_score >= 80 ? "text-[#c678dd]" : "text-[#ff4b4b]"
                                    }`}>{result.integrity_score}%</span>
                            </div>
                            {/* Progress Bar */}
                            <div className="h-2 bg-[#292524] rounded-full overflow-hidden">
                                <motion.div
                                    className={`h-full ${result.integrity_score >= 80 ? "bg-[#c678dd]" : "bg-[#ff4b4b]"}`}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${result.integrity_score}%` }}
                                />
                            </div>

                            {/* Integrity Details */}
                            {result.integrity_warnings.length > 0 ? (
                                <div className="bg-[#ff4b4b]/10 border border-[#ff4b4b]/20 p-3 rounded-lg space-y-2">
                                    {result.integrity_warnings.map((warn, i) => (
                                        <div key={i} className="flex items-start gap-2 text-xs text-[#ff4b4b]">
                                            <ShieldAlert className="w-3 h-3 mt-0.5 shrink-0" />
                                            <span>{warn}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 text-xs text-[#c678dd]">
                                    <ShieldCheck className="w-3 h-3" />
                                    <span>All stability checks passed.</span>
                                </div>
                            )}
                        </div>

                    </div>
                ) : (
                    <div className="flex items-center justify-center h-full text-stone-500 text-sm">
                        Initialize analysis...
                    </div>
                )}
            </div>
        </div>
    );
}
