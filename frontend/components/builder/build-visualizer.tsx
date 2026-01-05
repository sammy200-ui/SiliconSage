"use client";

import { motion } from "framer-motion";
import { Cpu, MonitorSpeaker, CircuitBoard, MemoryStick, HardDrive, Zap, Box, Fan } from "lucide-react";
import type { BuildState } from "./builder-interface";

interface BuildVisualizerProps {
  build: BuildState;
}

export function BuildVisualizer({ build }: BuildVisualizerProps) {
  const parts = [
    { key: "cpu", label: "CPU", icon: Cpu, selected: !!build.cpu, position: { x: 45, y: 25 } },
    { key: "cooler", label: "Cooler", icon: Fan, selected: !!build.cooler, position: { x: 45, y: 15 } },
    { key: "motherboard", label: "Mobo", icon: CircuitBoard, selected: !!build.motherboard, position: { x: 45, y: 50 } },
    { key: "ram", label: "RAM", icon: MemoryStick, selected: !!build.ram, position: { x: 70, y: 30 } },
    { key: "gpu", label: "GPU", icon: MonitorSpeaker, selected: !!build.gpu, position: { x: 45, y: 70 } },
    { key: "storage", label: "Storage", icon: HardDrive, selected: build.storage.length > 0, position: { x: 15, y: 55 } },
    { key: "psu", label: "PSU", icon: Zap, selected: !!build.psu, position: { x: 15, y: 80 } },
    { key: "case", label: "Case", icon: Box, selected: !!build.case, position: { x: 80, y: 60 } },
  ];

  return (
    <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-xl">
      <h3 className="text-sm font-medium text-zinc-400 mb-4">Build Preview</h3>
      
      {/* 2D Visualization */}
      <div className="relative aspect-square bg-zinc-950 rounded-lg border border-zinc-800 overflow-hidden">
        {/* Case outline */}
        <div className="absolute inset-4 border-2 border-dashed border-zinc-700 rounded-lg" />
        
        {/* Motherboard area */}
        <div className="absolute top-8 left-8 right-16 bottom-24 border border-zinc-700 rounded bg-zinc-900/50" />
        
        {/* Parts */}
        {parts.map((part) => (
          <motion.div
            key={part.key}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ 
              scale: part.selected ? 1 : 0.8, 
              opacity: part.selected ? 1 : 0.3 
            }}
            transition={{ type: "spring", bounce: 0.4 }}
            className="absolute flex flex-col items-center"
            style={{ 
              left: `${part.position.x}%`, 
              top: `${part.position.y}%`,
              transform: "translate(-50%, -50%)"
            }}
          >
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
              part.selected 
                ? "bg-gradient-to-br from-violet-600 to-cyan-600 shadow-lg shadow-violet-500/30" 
                : "bg-zinc-800 border border-zinc-700"
            }`}>
              <part.icon className={`w-5 h-5 ${part.selected ? "text-white" : "text-zinc-500"}`} />
            </div>
            <span className={`text-xs mt-1 ${part.selected ? "text-zinc-300" : "text-zinc-600"}`}>
              {part.label}
            </span>
          </motion.div>
        ))}

        {/* Connection lines (simplified) */}
        <svg className="absolute inset-0 pointer-events-none" viewBox="0 0 100 100">
          {/* CPU to Motherboard */}
          {build.cpu && build.motherboard && (
            <motion.line
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              x1="45" y1="30" x2="45" y2="45"
              className="stroke-emerald-500"
              strokeWidth="0.5"
              strokeDasharray="2,2"
            />
          )}
          {/* RAM to Motherboard */}
          {build.ram && build.motherboard && (
            <motion.line
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              x1="65" y1="30" x2="55" y2="45"
              className="stroke-emerald-500"
              strokeWidth="0.5"
              strokeDasharray="2,2"
            />
          )}
          {/* GPU to Motherboard */}
          {build.gpu && build.motherboard && (
            <motion.line
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              x1="45" y1="55" x2="45" y2="65"
              className="stroke-emerald-500"
              strokeWidth="0.5"
              strokeDasharray="2,2"
            />
          )}
        </svg>
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-3 justify-center">
        <div className="flex items-center gap-1.5 text-xs">
          <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-violet-600 to-cyan-600" />
          <span className="text-zinc-400">Selected</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs">
          <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
          <span className="text-zinc-500">Empty</span>
        </div>
      </div>
    </div>
  );
}
