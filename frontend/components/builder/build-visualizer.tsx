"use client";

import { motion } from "framer-motion";
import { Cpu, MonitorSpeaker, CircuitBoard, MemoryStick, HardDrive, Zap, Box, Fan } from "lucide-react";
import type { BuildState } from "./builder-interface";

interface BuildVisualizerProps {
  build: BuildState;
}

export function BuildVisualizer({ build }: BuildVisualizerProps) {
  const parts = [
    { key: "cpu", label: "CPU", icon: Cpu, selected: !!build.cpu, slot: "top-center" },
    { key: "icon-cooler", label: "Cooler", icon: Fan, selected: !!build.cooler, slot: "overlap-cpu" }, // Cooler sits on CPU
    { key: "ram", label: "RAM", icon: MemoryStick, selected: !!build.ram, slot: "right-top" },
    { key: "gpu", label: "GPU", icon: MonitorSpeaker, selected: !!build.gpu, slot: "center" },
    { key: "motherboard", label: "Mobo", icon: CircuitBoard, selected: !!build.motherboard, slot: "board" }, // The board itself
    { key: "storage", label: "SSD/HDD", icon: HardDrive, selected: build.storage.length > 0, slot: "bottom-right" },
    { key: "psu", label: "PSU", icon: Zap, selected: !!build.psu, slot: "bottom-left" },
    { key: "case", label: "Case", icon: Box, selected: !!build.case, slot: "container" },
  ];

  return (
    <div className="p-6 bg-[#1c1917] border border-[#292524] rounded-xl flex flex-col h-[400px]">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-medium text-stone-400">Build Preview</h3>
        <div className="flex gap-2 text-[10px]">
          <span className="px-2 py-0.5 rounded-full bg-[#ffa828]/10 text-[#ffa828] border border-[#ffa828]/20">Active</span>
          <span className="px-2 py-0.5 rounded-full bg-[#292524] text-stone-500 border border-[#44403c]">Empty</span>
        </div>
      </div>

      {/* Case Visualizer Container */}
      <div className="relative flex-1 bg-[#171514] rounded-xl border border-[#292524] p-4 flex items-center justify-center overflow-hidden">

        {/* Case Outline */}
        <motion.div
          className={`absolute inset-2 border-2 rounded-lg transition-colors duration-500 ${build.case ? "border-[#stone-600] border-solid bg-[#1c1917]" : "border-[#292524] border-dashed"}`}
          animate={{ opacity: 1 }}
        >
          {build.case && <div className="absolute top-2 left-2 text-[10px] text-stone-500 font-mono">{build.case.name}</div>}
        </motion.div>

        {/* Motherboard Base */}
        <motion.div
          className={`relative w-48 h-64 rounded-lg transition-all duration-500 ${build.motherboard ? "bg-[#292524] border border-[#44403c] shadow-xl" : "bg-[#1c1917]/50 border border-[#292524] border-dashed"}`}
        >
          {/* CPU Socket */}
          <div className="absolute top-8 left-1/2 -translate-x-1/2 w-12 h-12 border border-[#44403c] rounded bg-[#171514] flex items-center justify-center">
            {build.cpu ? (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-[#ffa828]">
                <Cpu className="w-8 h-8" />
              </motion.div>
            ) : <span className="text-[9px] text-stone-600">CPU</span>}

            {/* Cooler Layer */}
            {build.cooler && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-[#ffa828]/10 backdrop-blur-[1px] flex items-center justify-center rounded">
                <Fan className="w-8 h-8 text-[#ffa828] animate-spin-slow" />
              </motion.div>
            )}
          </div>

          {/* RAM Slots */}
          <div className="absolute top-8 right-4 w-4 h-16 border border-[#44403c] rounded bg-[#171514] flex flex-col justify-evenly items-center py-1">
            {build.ram ? (
              [1, 2, 3, 4].map(i => <motion.div key={i} initial={{ width: 0 }} animate={{ width: "80%" }} className="h-0.5 bg-[#ffa828]" />)
            ) : <span className="text-[8px] text-stone-600 rotate-90">RAM</span>}
          </div>

          {/* PCIe / GPU Slot */}
          <div className="absolute top-32 left-4 right-4 h-2 bg-[#171514] border border-[#44403c] rounded flex items-center">
            {build.gpu && (
              <motion.div
                layoutId="gpu"
                className="absolute left-0 top-0 h-10 w-full bg-[#1c1917] border border-[#ffa828] rounded flex items-center justify-center shadow-lg z-10"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
              >
                <MonitorSpeaker className="w-5 h-5 text-[#ffa828] mr-2" />
                <span className="text-[9px] text-[#ffa828] font-bold truncate max-w-[80%]">{build.gpu.name.split(" ")[0]}</span>
              </motion.div>
            )}
          </div>

          {/* Storage Area (Bottom Right) */}
          <div className="absolute bottom-4 right-4 w-12 h-12 border border-[#44403c] rounded bg-[#171514] flex items-center justify-center">
            {build.storage.length > 0 ? (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                <HardDrive className="w-6 h-6 text-[#c678dd]" />
              </motion.div>
            ) : <span className="text-[8px] text-stone-600">SSD</span>}
          </div>
        </motion.div>

        {/* PSU (Outside Mobo but in Case) */}
        <div className="absolute bottom-4 left-6 w-16 h-12 border border-[#44403c] rounded bg-[#292524] flex items-center justify-center z-10">
          {build.psu ? (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
              <Zap className="w-6 h-6 text-[#ff4b4b]" />
            </motion.div>
          ) : <span className=" text-[9px] text-stone-600">PSU</span>}
        </div>

      </div>
    </div>
  );
}
