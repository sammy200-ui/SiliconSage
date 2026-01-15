"use client";

import { motion } from "framer-motion";
import { Zap, Activity, Droplets } from "lucide-react";
import { useEffect, useState } from "react";

/**
 * Premium High-End PC Tower Animation
 * Features sophisticated liquid cooling, "breathing" light effects, and detailed componentry.
 */
export function PCBuildAnimation() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return <div className="w-full max-w-lg aspect-[3/4] bg-[#0c0a09] rounded-3xl border border-[#292524]" />;
    }

    return (
        <div className="w-full max-w-lg aspect-[3/4] relative flex items-center justify-center p-4">

            {/* CASE CHASSIS - Premium Tinted Glass Look */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
                className="w-full h-full bg-[#050505] rounded-[32px] border-[1px] border-[#333] relative overflow-hidden shadow-2xl flex flex-col group"
            >
                {/* Ambient Case Glow - Soft breathing background */}
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-red-600/5 animate-pulse" />

                {/* Glass Reflection Highlight */}
                <div className="absolute inset-0 bg-gradient-to-tr from-white/5 via-transparent to-transparent pointer-events-none z-50 rounded-[31px]" />

                {/* --- TOP: CUSTOM WATER COOLING RADIATOR --- */}
                <div className="h-20 bg-[#0a0a0a] border-b border-[#222] flex items-center justify-center relative z-10 overflow-hidden">
                    {/* Honeycomb Grill Pattern */}
                    <div className="absolute inset-x-4 top-2 bottom-2 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />

                    {/* Animated Liquid Flow Indicators (Replacing Fans) */}
                    <div className="flex gap-16 relative z-10 w-full justify-center">
                        {[1, 2, 3].map(i => (
                            <motion.div
                                key={i}
                                className="w-12 h-2 rounded-full bg-[#111] overflow-hidden border border-[#333]"
                            >
                                <motion.div
                                    className="h-full bg-gradient-to-r from-transparent via-[#ff4b4b] to-transparent w-[50%] opacity-50"
                                    animate={{ x: ["-100%", "200%"] }}
                                    transition={{ duration: 2, repeat: Infinity, delay: i * 0.3, ease: "linear" }}
                                />
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* --- MAIN MAINBOARD AREA --- */}
                <div className="flex-1 relative p-6 flex flex-col justify-between">
                    {/* Dark Matte Motherboard PCB Background */}
                    <div className="absolute inset-0 bg-[#080808]">
                        {/* Subtle Trace Lines */}
                        <svg className="absolute inset-0 w-full h-full opacity-10" width="100%" height="100%">
                            <pattern id="pcb" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                                <path d="M0 20 H40 M20 0 V40" stroke="#fff" strokeWidth="0.5" fill="none" />
                            </pattern>
                            <rect width="100%" height="100%" fill="url(#pcb)" />
                        </svg>
                    </div>

                    {/* --- CPU BLOCK (The Heart) --- */}
                    <div className="relative z-20 mt-4 ml-8">
                        {/* Tubing Layer - Behind Block */}
                        <svg className="absolute -top-12 left-24 w-64 h-64 pointer-events-none -z-10 overflow-visible drop-shadow-[0_0_8px_rgba(255,75,75,0.3)]">
                            {/* Tube 1: CPU Out -> Rad */}
                            <path d="M 0 30 C 0 -20, 40 -40, 60 -80" stroke="#1a1a1a" strokeWidth="16" fill="none" strokeLinecap="round" />
                            <motion.path
                                d="M 0 30 C 0 -20, 40 -40, 60 -80"
                                stroke="url(#liquidGradient)"
                                strokeWidth="4"
                                fill="none"
                                strokeDasharray="10 30"
                                strokeLinecap="round"
                                animate={{ strokeDashoffset: [0, -40] }}
                                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                            />

                            {/* Tube 2: Rad -> VRM/Distro */}
                            <path d="M 120 -80 C 140 -40, 100 0, 100 50" stroke="#1a1a1a" strokeWidth="16" fill="none" strokeLinecap="round" />

                            <defs>
                                <linearGradient id="liquidGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="#ff4b4b" stopOpacity="0" />
                                    <stop offset="50%" stopColor="#ff4b4b" />
                                    <stop offset="100%" stopColor="#ffa828" stopOpacity="0" />
                                </linearGradient>
                            </defs>
                        </svg>

                        {/* Premium LCD Block */}
                        <motion.div
                            className="w-36 h-36 bg-black rounded-3xl border border-[#333] shadow-2xl relative overflow-hidden flex flex-col items-center justify-center group"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.5 }}
                        >
                            {/* Block Glossy Finish */}
                            <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />

                            {/* Digital Readout */}
                            <div className="relative z-10 flex flex-col items-center">
                                <span className="text-[10px] text-stone-500 font-bold tracking-widest uppercase mb-1">CPU Temp</span>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl font-black text-white mix-blend-screen bg-clip-text text-transparent bg-gradient-to-br from-white to-stone-400">42</span>
                                    <span className="text-sm text-stone-400 font-medium">°C</span>
                                </div>
                                <div className="mt-2 h-0.5 w-16 bg-[#333] rounded-full overflow-hidden">
                                    <motion.div
                                        className="h-full bg-gradient-to-r from-orange-500 to-red-500"
                                        animate={{ width: ["40%", "45%", "38%"] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                    />
                                </div>
                            </div>

                            {/* RGB Ring */}
                            <div className="absolute inset-0 rounded-3xl border-[2px] border-[#ff4b4b]/20" />
                            <div className="absolute inset-0 rounded-3xl shadow-[inset_0_0_20px_rgba(255,75,75,0.1)]" />
                        </motion.div>

                        {/* RAM Modules Next to CPU */}
                        <div className="absolute top-4 left-40 flex gap-1.5 h-28 items-end">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="w-2.5 h-full bg-[#111] border border-[#222] rounded-sm relative overflow-hidden">
                                    <motion.div
                                        className="absolute top-0 w-full h-[60%] bg-gradient-to-b from-[#ffa828] to-transparent opacity-80"
                                        animate={{ opacity: [0.5, 0.8, 0.5] }}
                                        transition={{ duration: 2, delay: i * 0.2, repeat: Infinity }}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* --- GPU: INDUSTRIAL DESIGN RTX 5090 --- */}
                    <motion.div
                        className="relative w-full h-32 bg-[#111] rounded-lg border border-[#333] mt-auto mb-4 flex shadow-[0_10px_40px_-10px_rgba(0,0,0,0.8)]"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.8 }}
                    >
                        {/* GPU Shroud Texture */}
                        <div className="absolute inset-0 bg-[linear-gradient(90deg,#111_0%,#1a1a1a_50%,#111_100%)] opacity-90" />

                        {/* Branding Plate */}
                        <div className="absolute top-0 left-0 bottom-0 w-12 bg-[#080808] border-r border-[#222] flex items-center justify-center">
                            <div className="-rotate-90 whitespace-nowrap text-[10px] font-bold text-stone-600 tracking-[0.2em]">GEFORCE RTX</div>
                        </div>

                        {/* Fan/Cooling Area - Abstract "Turbine" Look (No plain fans) */}
                        <div className="flex-1 flex items-center justify-evenly px-4 relative">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="w-20 h-2 bg-[#222] rounded-full overflow-hidden relative">
                                    {/* Scanning Light Effect */}
                                    <motion.div
                                        className="absolute inset-0 bg-[#ff4b4b]"
                                        animate={{ x: ["-100%", "100%"] }}
                                        transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2, ease: "easeInOut" }}
                                    />
                                </div>
                            ))}
                        </div>

                        {/* Edge Light Bar */}
                        <div className="absolute bottom-0 left-12 right-0 h-0.5 bg-gradient-to-r from-[#76b900] via-[#ff4b4b] to-[#ffa828] shadow-[0_0_10px_rgba(255,255,255,0.2)]" />

                        {/* Model Badge */}
                        <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-[#222] rounded border border-[#333]">
                            <span className="text-[8px] font-bold text-white">5090</span>
                        </div>
                    </motion.div>

                    {/* --- PSU: DIGITAL POWER STATION --- */}
                    <motion.div
                        className="h-24 bg-[#0a0a0a] border-t border-[#222] -mx-6 -mb-6 p-6 flex items-center justify-between"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1 }}
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-[#111] rounded-full border border-[#222] flex items-center justify-center">
                                <Zap className="w-5 h-5 text-[#ffa828]" />
                            </div>
                            <div>
                                <div className="text-sm font-bold text-white tracking-widest">THOR II</div>
                                <div className="text-[10px] text-stone-500">1600W PLATINUM</div>
                            </div>
                        </div>

                        {/* Live Power Graph Animation */}
                        <div className="flex items-end gap-1 h-8">
                            {[...Array(10)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    className="w-1 bg-[#ffa828]"
                                    animate={{ height: ["20%", "80%", "40%"] }}
                                    transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.05 }}
                                />
                            ))}
                        </div>
                    </motion.div>

                </div>
            </motion.div>
        </div>
    );
}
