"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Cpu, MonitorSpeaker, CircuitBoard, MemoryStick, HardDrive,
  Zap, Box, Fan, Plus, X, AlertTriangle, CheckCircle, Info,
  DollarSign, Gauge, Sparkles, Headphones as HeadphonesIcon, Keyboard as KeyboardIcon, Monitor as MonitorIcon, Wind
} from "lucide-react";
import { PartSelector } from "./part-selector";
import { BuilderAdvisor } from "./builder-advisor";
import { MLAnalysisPanel } from "./ml-analysis-panel";
import { BottleneckAnalysis } from "./bottleneck-analysis";
import type { CPU, GPU, Motherboard, RAM, Storage, PSU, Case, CPUCooler, CaseFan, Headphones, Keyboard, Monitor } from "@/lib/types/database";

type AnyPart = CPU | GPU | Motherboard | RAM | Storage | PSU | Case | CPUCooler | CaseFan | Headphones | Keyboard | Monitor;

// Part categories with connection info
const partCategories = [
  { id: "cpu", label: "CPU", icon: Cpu, required: true, row: 0, col: 0, connectsTo: ["motherboard", "cooler"] },
  { id: "motherboard", label: "Motherboard", icon: CircuitBoard, required: true, row: 0, col: 1, connectsTo: ["ram", "gpu", "storage"] },
  { id: "gpu", label: "GPU", icon: MonitorSpeaker, required: true, row: 1, col: 0, connectsTo: ["psu"] },
  { id: "ram", label: "RAM", icon: MemoryStick, required: true, row: 1, col: 1, connectsTo: [] },
  { id: "storage", label: "Storage", icon: HardDrive, required: true, row: 2, col: 0, connectsTo: [] },
  { id: "psu", label: "PSU", icon: Zap, required: true, row: 2, col: 1, connectsTo: [] },
  { id: "case", label: "Case", icon: Box, required: false, row: 3, col: 0, connectsTo: [] },
  { id: "cooler", label: "Cooler", icon: Fan, required: false, row: 3, col: 1, connectsTo: [] },
  // Peripherals (optional)
  { id: "caseFan", label: "Case Fan", icon: Wind, required: false, row: 4, col: 0, connectsTo: [] },
  { id: "monitor", label: "Monitor", icon: MonitorIcon, required: false, row: 4, col: 1, connectsTo: [] },
  { id: "keyboard", label: "Keyboard", icon: KeyboardIcon, required: false, row: 5, col: 0, connectsTo: [] },
  { id: "headphones", label: "Headphones", icon: HeadphonesIcon, required: false, row: 5, col: 1, connectsTo: [] },
] as const;

type PartCategoryId = typeof partCategories[number]["id"];

export interface BuildState {
  cpu: CPU | null;
  gpu: GPU | null;
  motherboard: Motherboard | null;
  ram: RAM | null;
  storage: Storage[];
  psu: PSU | null;
  case: Case | null;
  cooler: CPUCooler | null;
  caseFan: CaseFan | null;
  monitor: Monitor | null;
  keyboard: Keyboard | null;
  headphones: Headphones | null;
}

export function BuilderInterface() {
  const searchParams = useSearchParams();
  const [build, setBuild] = useState<BuildState>({
    cpu: null, gpu: null, motherboard: null, ram: null,
    storage: [], psu: null, case: null, cooler: null,
    caseFan: null, monitor: null, keyboard: null, headphones: null,
  });
  useEffect(() => {
    const cpuName = searchParams.get("cpu");
    const gpuName = searchParams.get("gpu");
    if (cpuName || gpuName) {
      setBuild(prev => ({
        ...prev,
        cpu: cpuName ? { id: "pre-cpu", name: cpuName, price: Number(searchParams.get("cpu_price")) || 200, core_count: 6, core_clock: 3.5, boost_clock: 4.4, tdp: 65, microarchitecture: "Zen 3" } as unknown as CPU : prev.cpu,
        gpu: gpuName ? { id: "pre-gpu", name: gpuName, price: Number(searchParams.get("gpu_price")) || 300, chipset: "Radeon", memory: 8, core_clock: 2000, boost_clock: 2400, length: 240 } as unknown as GPU : prev.gpu,
      }));
    }
  }, [searchParams]);

  const [activeCategory, setActiveCategory] = useState<PartCategoryId | null>(null);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [advisorExpanded, setAdvisorExpanded] = useState(false);

  const handleSelectPart = useCallback((category: PartCategoryId, part: AnyPart) => {
    setBuild(prev => {
      if (category === "storage") return { ...prev, storage: [...prev.storage, part as Storage] };
      return { ...prev, [category]: part };
    });
    setActiveCategory(null);
  }, []);

  const handleRemovePart = useCallback((category: PartCategoryId) => {
    setBuild(prev => ({ ...prev, [category]: category === "storage" ? [] : null }));
  }, []);

  const calculateTotalPrice = useCallback(() => {
    let total = 0;
    if (build.cpu?.price) total += build.cpu.price;
    if (build.gpu?.price) total += build.gpu.price;
    if (build.motherboard?.price) total += build.motherboard.price;
    if (build.ram?.price) total += build.ram.price;
    if (build.psu?.price) total += build.psu.price;
    if (build.case?.price) total += build.case.price;
    if (build.cooler?.price) total += build.cooler.price;
    build.storage.forEach(s => total += (s.price || 0));
    return total;
  }, [build]);

  const calculateTotalWattage = useCallback(() => {
    let total = 50;
    if (build.cpu?.tdp) total += build.cpu.tdp;
    if (build.gpu?.memory) total += build.gpu.memory * 30;
    return total;
  }, [build]);

  const inferCPUSocket = useCallback((microarch: string): string | null => {
    const map: Record<string, string> = { "Zen 4": "AM5", "Zen 3": "AM4", "Zen 2": "AM4", "Raptor Lake": "LGA1700", "Alder Lake": "LGA1700" };
    return map[microarch] || null;
  }, []);

  const checkCompatibility = useCallback(() => {
    const issues: string[] = [];
    if (build.cpu && build.motherboard) {
      const cpuSocket = inferCPUSocket(build.cpu.microarchitecture);
      if (cpuSocket && cpuSocket !== build.motherboard.socket) issues.push(`Socket mismatch`);
    }
    if (build.psu) {
      const required = calculateTotalWattage() * 1.2;
      if (build.psu.wattage < required) issues.push(`PSU underpowered`);
    }
    return issues;
  }, [build, calculateTotalWattage, inferCPUSocket]);

  const compatibilityIssues = checkCompatibility();
  const isComplete = build.cpu && build.gpu && build.motherboard && build.ram && build.storage.length > 0 && build.psu;

  // Helper to check if a part is selected
  const hasPart = (id: string) => {
    if (id === "storage") return build.storage.length > 0;
    return !!build[id as keyof BuildState];
  };

  const getPart = (id: string) => {
    if (id === "storage") return build.storage.length > 0 ? build.storage[0] : null;
    return build[id as keyof BuildState];
  };

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-1">
            SiliconSage Builder
          </h1>
          <p className="text-stone-400 text-sm">AI-Powered PC Component Analysis</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-[#1c1917] border border-[#292524] rounded-lg">
            <DollarSign className="w-4 h-4 text-[#ffa828]" />
            <span className="text-lg font-bold text-[#ff4b4b]">${calculateTotalPrice().toFixed(0)}</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-[#1c1917] border border-[#292524] rounded-lg">
            <Gauge className="w-4 h-4 text-[#c678dd]" />
            <span className="text-lg font-bold text-stone-200">{calculateTotalWattage()}W</span>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid lg:grid-cols-12 gap-6">
        {/* Left: Animated Part Cards */}
        <div className="lg:col-span-7">
          <div className="grid grid-cols-2 gap-4 relative">
            {/* SVG Connection Lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" style={{ overflow: 'visible' }}>
              {/* CPU to Motherboard */}
              {hasPart("cpu") && hasPart("motherboard") && (
                <motion.line
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  x1="48%" y1="12%" x2="52%" y2="12%"
                  stroke="#ffa828" strokeWidth="2" strokeDasharray="4 2"
                />
              )}
              {/* Motherboard to RAM */}
              {hasPart("motherboard") && hasPart("ram") && (
                <motion.line
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  x1="75%" y1="25%" x2="75%" y2="35%"
                  stroke="#c678dd" strokeWidth="2" strokeDasharray="4 2"
                />
              )}
              {/* GPU to PSU */}
              {hasPart("gpu") && hasPart("psu") && (
                <motion.line
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  x1="25%" y1="50%" x2="25%" y2="60%"
                  stroke="#ff4b4b" strokeWidth="2" strokeDasharray="4 2"
                />
              )}
            </svg>

            {partCategories.map((category) => {
              const Icon = category.icon;
              const selected = hasPart(category.id);
              const part = getPart(category.id);

              return (
                <motion.div
                  key={category.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                    boxShadow: selected ? "0 0 8px rgba(255, 168, 40, 0.15)" : "none"
                  }}
                  whileHover={{ scale: 1.01 }}
                  transition={{ duration: 0.3 }}
                  className={`relative p-4 rounded-xl border-2 transition-all cursor-pointer z-10
                    ${selected
                      ? "bg-gradient-to-br from-[#1c1917] to-[#292524] border-[#ffa828]"
                      : "bg-[#171514] border-[#292524] border-dashed hover:border-[#44403c]"
                    }`}
                  onClick={() => setActiveCategory(category.id)}
                >

                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <motion.div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center ${selected ? "bg-[#ffa828]" : "bg-[#292524]"}`}
                        animate={{ rotate: selected ? [0, 5, -5, 0] : 0 }}
                        transition={{ duration: 0.5 }}
                      >
                        <Icon className="w-6 h-6 text-white" />
                      </motion.div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm">{category.label}</span>
                          {category.required && !selected && (
                            <span className="text-[9px] px-1.5 py-0.5 bg-[#ff4b4b]/20 text-[#ff4b4b] rounded font-medium">REQ</span>
                          )}
                        </div>
                        {selected && part ? (
                          <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-xs text-[#ffa828] font-medium truncate max-w-[120px]"
                          >
                            {(part as AnyPart).name?.split(' ').slice(0, 3).join(' ')}
                          </motion.p>
                        ) : (
                          <p className="text-xs text-stone-500">Click to select</p>
                        )}
                      </div>
                    </div>

                    {selected ? (
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-sm font-bold text-[#c678dd]">
                          ${((part as AnyPart)?.price || 0).toFixed(0)}
                        </span>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleRemovePart(category.id); }}
                          className="p-1 text-stone-500 hover:text-[#ff4b4b] transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-lg bg-[#ff4b4b] flex items-center justify-center">
                        <Plus className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>

                  {/* Connection indicator */}
                  {selected && category.connectsTo.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-[#292524]">
                      <p className="text-[10px] text-stone-500">
                        Connects to: {category.connectsTo.map(c =>
                          partCategories.find(p => p.id === c)?.label
                        ).join(', ')}
                      </p>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Compatibility Status */}
          <motion.div
            layout
            className={`mt-4 p-4 rounded-xl border ${compatibilityIssues.length > 0
              ? "bg-[#ff4b4b]/10 border-[#ff4b4b]/50"
              : isComplete
                ? "bg-[#ffa828]/10 border-[#ffa828]/50"
                : "bg-[#171514] border-[#292524]"
              }`}
          >
            <div className="flex items-center gap-2">
              {compatibilityIssues.length > 0 ? (
                <><AlertTriangle className="w-4 h-4 text-[#ff4b4b]" /><span className="text-sm font-medium text-[#ff4b4b]">Compatibility Issues</span></>
              ) : isComplete ? (
                <><CheckCircle className="w-4 h-4 text-[#ffa828]" /><span className="text-sm font-medium text-[#ffa828]">Build Complete - All Compatible!</span></>
              ) : (
                <><Info className="w-4 h-4 text-stone-400" /><span className="text-sm text-stone-400">Select components to analyze compatibility</span></>
              )}
            </div>
          </motion.div>
        </div>

        {/* Right: ML Analysis Hero + Advisor */}
        <div className="lg:col-span-5 space-y-4">
          {/* ML Analysis Panel - THE HERO */}
          <div className="bg-[#1c1917] border-2 border-[#ffa828]/30 rounded-2xl overflow-hidden shadow-lg shadow-[#ffa828]/10">
            <div className="p-3 bg-gradient-to-r from-[#ffa828]/20 to-transparent border-b border-[#292524] flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#ffa828]" />
              <span className="font-bold text-[#ffa828]">ML Analysis Engine</span>
            </div>
            <MLAnalysisPanel build={build} />
          </div>

          {/* AI Advisor - Always Visible */}
          <div className="bg-[#1c1917] border-2 border-[#ffa828]/30 rounded-2xl overflow-hidden shadow-lg shadow-[#ffa828]/10">
            <div className="p-3 bg-gradient-to-r from-[#ffa828]/20 to-transparent border-b border-[#292524] flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#ffa828]" />
              <span className="font-bold text-[#ffa828]">AI Advisor</span>
            </div>
            <div className="h-[320px]">
              <BuilderAdvisor build={build} />
            </div>
          </div>
        </div>
      </div>

      {/* Part Selector Modal */}
      <AnimatePresence>
        {activeCategory && (
          <PartSelector
            category={activeCategory}
            onSelect={(part) => handleSelectPart(activeCategory, part)}
            onClose={() => setActiveCategory(null)}
            currentBuild={build}
          />
        )}
      </AnimatePresence>

      {/* Bottleneck Analysis Modal */}
      <AnimatePresence>
        {showAnalysis && isComplete && (
          <BottleneckAnalysis build={build} onClose={() => setShowAnalysis(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
