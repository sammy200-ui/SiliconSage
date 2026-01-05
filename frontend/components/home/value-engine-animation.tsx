"use client";

import { motion } from "framer-motion";
import { Cpu, Zap, ArrowRight, AlertTriangle, CheckCircle } from "lucide-react";

export function ValueEngineAnimation() {
    return (
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Scenario A: Bottleneck */}
            <div className="relative p-8 rounded-2xl bg-[#171514] border border-[#292524] overflow-hidden">
                <div className="absolute top-4 right-4 text-red-400 flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
                    <AlertTriangle className="w-4 h-4" />
                    Bottleneck Detected
                </div>

                <h3 className="text-xl font-bold text-stone-500 mb-8">Typical "Oversized" Build</h3>

                <div className="flex items-center justify-between relative z-10">
                    {/* Overkill CPU */}
                    <div className="flex flex-col items-center gap-2">
                        <motion.div
                            className="w-24 h-24 bg-stone-800 rounded-xl border-2 border-stone-700 flex items-center justify-center relative"
                            initial={{ scale: 1 }}
                            animate={{ scale: [1, 1.05, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        >
                            <Cpu className="w-10 h-10 text-stone-500" />
                            <div className="absolute -bottom-2 px-2 py-0.5 bg-stone-700 text-[10px] text-stone-300 rounded-full">
                                i9-12900K
                            </div>
                        </motion.div>
                        <span className="text-xs text-stone-500 font-mono text-center">100% Potential</span>
                    </div>

                    {/* Constricted Flow Animation */}
                    <div className="flex-1 px-2 relative h-12 flex items-center justify-center">
                        {/* The "Pipe" */}
                        <div className="w-full h-2 bg-[#292524] rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-red-500/50"
                                initial={{ x: "-100%" }}
                                animate={{ x: "100%" }}
                                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                                style={{ width: "30%" }} // Visualizing constriction
                            />
                        </div>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#171514] border border-red-500/50 text-red-400 text-[10px] px-2 py-1 rounded-full">
                            Severe Bottleneck
                        </div>
                    </div>

                    {/* Weak GPU */}
                    <div className="flex flex-col items-center gap-2">
                        <div className="w-16 h-16 bg-stone-800 rounded-xl border-2 border-stone-700 flex items-center justify-center relative">
                            <Zap className="w-6 h-6 text-stone-500" />
                            <div className="absolute -bottom-2 px-2 py-0.5 bg-stone-700 text-[10px] text-stone-300 rounded-full">
                                RTX 3060
                            </div>
                        </div>
                        <span className="text-xs text-stone-500 font-mono text-center">40% Utilization</span>
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t border-[#292524] flex justify-between items-center text-sm">
                    <span className="text-stone-500">Total Price: <span className="text-red-400 font-bold">$1,450</span></span>
                    <span className="text-stone-500">Value: <span className="text-red-400 font-bold">Low</span></span>
                </div>
            </div>

            {/* Scenario B: Optimized */}
            <div className="relative p-8 rounded-2xl bg-[#1c1917] border border-[#ffa828] shadow-xl shadow-[#ffa828]/10 overflow-hidden">
                <div className="absolute top-4 right-4 text-[#ffa828] flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
                    <CheckCircle className="w-4 h-4" />
                    Perfect Match
                </div>

                <h3 className="text-xl font-bold text-white mb-8">SiliconSage Optimized</h3>

                <div className="flex items-center justify-between relative z-10">
                    {/* Matched CPU */}
                    <div className="flex flex-col items-center gap-2">
                        <motion.div
                            className="w-20 h-20 bg-[#292524] rounded-xl border-2 border-[#ffa828] flex items-center justify-center relative"
                            initial={{ boxShadow: "0 0 0px #ffa828" }}
                            animate={{ boxShadow: "0 0 20px rgba(255, 168, 40, 0.2)" }}
                            transition={{ duration: 2, repeat: Infinity }}
                        >
                            <Cpu className="w-8 h-8 text-[#ffa828]" />
                            <div className="absolute -bottom-2 px-2 py-0.5 bg-[#ffa828] text-[10px] text-[#171514] font-bold rounded-full">
                                i5-13600K
                            </div>
                        </motion.div>
                        <span className="text-xs text-[#ffa828] font-mono text-center">100% Utilized</span>
                    </div>

                    {/* Smooth Flow Animation */}
                    <div className="flex-1 px-2 relative h-12 flex items-center justify-center">
                        <div className="w-full h-8 bg-[#292524] rounded-full overflow-hidden border border-[#ffa828]/30">
                            <motion.div
                                className="h-full bg-gradient-to-r from-[#ffa828] to-[#ff4b4b]"
                                initial={{ x: "-100%" }}
                                animate={{ x: "0%" }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                style={{ width: "100%" }}
                            />
                        </div>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#ffa828] text-[#171514] text-[10px] font-bold px-2 py-1 rounded-full shadow-lg">
                            Max Performance
                        </div>
                    </div>

                    {/* Matched GPU */}
                    <div className="flex flex-col items-center gap-2">
                        <motion.div
                            className="w-20 h-20 bg-[#292524] rounded-xl border-2 border-[#ff4b4b] flex items-center justify-center relative"
                            initial={{ boxShadow: "0 0 0px #ff4b4b" }}
                            animate={{ boxShadow: "0 0 20px rgba(255, 75, 75, 0.2)" }}
                            transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                        >
                            <Zap className="w-8 h-8 text-[#ff4b4b]" />
                            <div className="absolute -bottom-2 px-2 py-0.5 bg-[#ff4b4b] text-[10px] text-white font-bold rounded-full">
                                RTX 4070
                            </div>
                        </motion.div>
                        <span className="text-xs text-[#ff4b4b] font-mono text-center">100% Utilized</span>
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t border-[#292524] flex justify-between items-center text-sm">
                    <span className="text-stone-400">Total Price: <span className="text-[#ffa828] font-bold">$1,250</span></span>
                    <span className="text-stone-400">Value: <span className="text-[#ffa828] font-bold">Maximum</span></span>
                </div>
            </div>
        </div>
    );
}
