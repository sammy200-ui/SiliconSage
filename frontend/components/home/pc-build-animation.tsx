"use client";

import { motion } from "framer-motion";
import { Cpu, Monitor, CircuitBoard, MemoryStick, Zap, Box, Fan, HardDrive } from "lucide-react";

/**
 * Animated PC Build visualization component
 * Shows an exploded/assembled view of PC components with animations
 */
export function PCBuildAnimation() {
    // Component data with positions for exploded view
    const components = [
        { id: "case", icon: Box, label: "Case", color: "#44403c", delay: 0, x: 0, y: 0 },
        { id: "motherboard", icon: CircuitBoard, label: "Motherboard", color: "#22c55e", delay: 0.1, x: -20, y: 20 },
        { id: "cpu", icon: Cpu, label: "CPU", color: "#3b82f6", delay: 0.2, x: 15, y: -15 },
        { id: "ram", icon: MemoryStick, label: "RAM", color: "#a855f7", delay: 0.3, x: 30, y: 10 },
        { id: "gpu", icon: Monitor, label: "GPU", color: "#ef4444", delay: 0.4, x: -25, y: 35 },
        { id: "storage", icon: HardDrive, label: "Storage", color: "#f97316", delay: 0.5, x: 25, y: 40 },
        { id: "psu", icon: Zap, label: "PSU", color: "#eab308", delay: 0.6, x: -10, y: 50 },
        { id: "cooler", icon: Fan, label: "Cooler", color: "#06b6d4", delay: 0.7, x: 35, y: -5 },
    ];

    return (
        <div className="relative w-full max-w-md aspect-square">
            {/* Glow background */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#ff4b4b]/20 via-[#ffa828]/10 to-transparent rounded-3xl blur-3xl" />

            {/* Central PC Case outline */}
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="absolute inset-8 border-2 border-dashed border-[#292524] rounded-2xl"
            />

            {/* Components floating in */}
            <div className="absolute inset-0 flex items-center justify-center">
                {components.map((comp) => {
                    const Icon = comp.icon;
                    return (
                        <motion.div
                            key={comp.id}
                            initial={{
                                opacity: 0,
                                x: comp.x * 3,
                                y: comp.y * 3,
                                scale: 0.5,
                                rotate: -10
                            }}
                            animate={{
                                opacity: 1,
                                x: comp.x,
                                y: comp.y,
                                scale: 1,
                                rotate: 0
                            }}
                            transition={{
                                delay: comp.delay,
                                duration: 0.8,
                                type: "spring",
                                stiffness: 100
                            }}
                            whileHover={{
                                scale: 1.2,
                                zIndex: 50,
                                transition: { duration: 0.2 }
                            }}
                            className="absolute"
                        >
                            <div
                                className="relative group cursor-pointer"
                                style={{ left: comp.x, top: comp.y }}
                            >
                                {/* Glow effect on hover */}
                                <div
                                    className="absolute inset-0 rounded-xl blur-xl opacity-0 group-hover:opacity-50 transition-opacity"
                                    style={{ backgroundColor: comp.color }}
                                />

                                {/* Component icon */}
                                <div
                                    className="relative w-14 h-14 rounded-xl flex items-center justify-center border-2 transition-all duration-300"
                                    style={{
                                        backgroundColor: `${comp.color}20`,
                                        borderColor: `${comp.color}50`,
                                    }}
                                >
                                    <Icon
                                        className="w-7 h-7 transition-colors"
                                        style={{ color: comp.color }}
                                    />
                                </div>

                                {/* Label on hover */}
                                <motion.div
                                    initial={{ opacity: 0, y: 5 }}
                                    whileHover={{ opacity: 1, y: 0 }}
                                    className="absolute -bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap"
                                >
                                    <span
                                        className="text-xs font-medium px-2 py-1 rounded-lg"
                                        style={{
                                            backgroundColor: `${comp.color}30`,
                                            color: comp.color
                                        }}
                                    >
                                        {comp.label}
                                    </span>
                                </motion.div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Animated connection lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ overflow: 'visible' }}>
                <defs>
                    <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#ffa828" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#ff4b4b" stopOpacity="0.3" />
                    </linearGradient>
                </defs>

                {/* Connection lines between components */}
                <motion.path
                    d="M 50% 50% L 40% 40%"
                    stroke="url(#lineGradient)"
                    strokeWidth="2"
                    strokeDasharray="4 4"
                    fill="none"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 0.5 }}
                    transition={{ delay: 1, duration: 0.8 }}
                />
            </svg>

            {/* Floating particles */}
            {[...Array(6)].map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute w-1 h-1 rounded-full bg-[#ffa828]"
                    style={{
                        left: `${20 + Math.random() * 60}%`,
                        top: `${20 + Math.random() * 60}%`,
                    }}
                    animate={{
                        y: [0, -10, 0],
                        opacity: [0.3, 0.8, 0.3],
                    }}
                    transition={{
                        duration: 2 + Math.random() * 2,
                        repeat: Infinity,
                        delay: Math.random() * 2,
                    }}
                />
            ))}

            {/* Bottom label */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 }}
                className="absolute bottom-0 left-0 right-0 text-center"
            >
                <p className="text-sm text-stone-500">Your components, <span className="text-[#ffa828]">perfectly analyzed</span></p>
            </motion.div>
        </div>
    );
}
