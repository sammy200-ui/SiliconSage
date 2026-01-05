"use client";

import { useState, useCallback, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Cpu, MonitorSpeaker, CircuitBoard, MemoryStick, HardDrive,
  Zap, Box, Fan, Plus, Trash2, AlertTriangle, CheckCircle, Info
} from "lucide-react";
import { PartSelector } from "./part-selector";
import { BuildVisualizer } from "./build-visualizer";
import { BottleneckAnalysis } from "./bottleneck-analysis";
import type { CPU, GPU, Motherboard, RAM, Storage, PSU, Case, CPUCooler } from "@/lib/types/database";

// Part union type
type AnyPart = CPU | GPU | Motherboard | RAM | Storage | PSU | Case | CPUCooler;

// Part category configuration
const partCategories = [
  { id: "cpu", label: "CPU", icon: Cpu, required: true },
  { id: "gpu", label: "Graphics Card", icon: MonitorSpeaker, required: true },
  { id: "motherboard", label: "Motherboard", icon: CircuitBoard, required: true },
  { id: "ram", label: "Memory", icon: MemoryStick, required: true },
  { id: "storage", label: "Storage", icon: HardDrive, required: true },
  { id: "psu", label: "Power Supply", icon: Zap, required: true },
  { id: "case", label: "Case", icon: Box, required: false },
  { id: "cooler", label: "CPU Cooler", icon: Fan, required: false },
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
}

export function BuilderInterface() {
  const searchParams = useSearchParams();
  const [build, setBuild] = useState<BuildState>({
    cpu: null,
    gpu: null,
    motherboard: null,
    ram: null,
    storage: [],
    psu: null,
    case: null,
    cooler: null,
  });

  // Effect to parse search params and pre-fill build
  useEffect(() => {
    // This is a simplified way to pre-fill. In a real app we'd fetch by ID.
    // Here we'll construct "mock" parts from params to support the "Curated Builds" feature.
    const cpuName = searchParams.get("cpu");
    const gpuName = searchParams.get("gpu");

    if (cpuName || gpuName) {
      setBuild(prev => ({
        ...prev,
        cpu: cpuName ? {
          id: "pre-cpu", name: cpuName, price: Number(searchParams.get("cpu_price")) || 200,
          core_count: 6, core_clock: 3.5, boost_clock: 4.4, tdp: 65, integrated_graphics: null, graphics: null, microarchitecture: "Zen 3"
        } as CPU : prev.cpu,
        gpu: gpuName ? {
          id: "pre-gpu", name: gpuName, price: Number(searchParams.get("gpu_price")) || 300,
          chipset: "Radeon", memory: 8, core_clock: 2000, boost_clock: 2400, length: 240
        } as GPU : prev.gpu,
        // We can add RAM/Mobo here too if needed, but keeping it simple for now
      }));
    }
  }, [searchParams]);

  const [activeCategory, setActiveCategory] = useState<PartCategoryId | null>(null);
  const [showAnalysis, setShowAnalysis] = useState(false);

  const handleSelectPart = useCallback((category: PartCategoryId, part: AnyPart) => {
    setBuild(prev => {
      if (category === "storage") {
        return { ...prev, storage: [...prev.storage, part as Storage] };
      }
      return { ...prev, [category]: part };
    });
    setActiveCategory(null);
  }, []);

  const handleRemovePart = useCallback((category: PartCategoryId, index?: number) => {
    setBuild(prev => {
      if (category === "storage" && typeof index === "number") {
        return { ...prev, storage: prev.storage.filter((_, i) => i !== index) };
      }
      return { ...prev, [category]: category === "storage" ? [] : null };
    });
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
    let total = 0;
    if (build.cpu?.tdp) total += build.cpu.tdp;
    // GPU doesn't have TDP in new schema, estimate based on memory
    if (build.gpu?.memory) total += build.gpu.memory * 30; // Rough estimate
    // Add overhead for other components
    total += 50; // RAM, storage, fans, etc.
    return total;
  }, [build]);

  // Helper function to infer CPU socket from microarchitecture
  const inferCPUSocket = useCallback((microarch: string): string | null => {
    const socketMap: Record<string, string> = {
      // AMD
      "Zen 4": "AM5",
      "Zen 3": "AM4",
      "Zen 2": "AM4",
      "Zen+": "AM4",
      "Zen": "AM4",
      // Intel
      "Raptor Lake": "LGA1700",
      "Alder Lake": "LGA1700",
      "Rocket Lake": "LGA1200",
      "Comet Lake": "LGA1200",
      "Coffee Lake": "LGA1151",
    };
    return socketMap[microarch] || null;
  }, []);

  const checkCompatibility = useCallback(() => {
    const issues: string[] = [];

    // CPU-Motherboard socket check (infer from microarchitecture)
    if (build.cpu && build.motherboard) {
      const cpuSocket = inferCPUSocket(build.cpu.microarchitecture);
      if (cpuSocket && cpuSocket !== build.motherboard.socket) {
        issues.push(`CPU socket (${cpuSocket}) doesn't match motherboard socket (${build.motherboard.socket})`);
      }
    }

    // RAM-Motherboard DDR compatibility (basic check based on naming)
    if (build.ram && build.motherboard && build.ram.speed_ddr) {
      const ramDDR = build.ram.speed_ddr; // DDR version
      const moboName = build.motherboard.name.toLowerCase();
      // Check if DDR version matches (DDR4 vs DDR5)
      if (ramDDR === 5 && !moboName.includes("ddr5") && moboName.includes("ddr4")) {
        issues.push(`DDR5 RAM may not be compatible with DDR4 motherboard`);
      } else if (ramDDR === 4 && moboName.includes("ddr5")) {
        issues.push(`DDR4 RAM may not be compatible with DDR5 motherboard`);
      }
    }

    // PSU wattage check
    if (build.psu) {
      const requiredWattage = calculateTotalWattage();
      const recommendedPsu = requiredWattage * 1.2; // 20% headroom
      if (build.psu.wattage < requiredWattage) {
        issues.push(`PSU wattage (${build.psu.wattage}W) may be insufficient. Recommended: ${Math.ceil(recommendedPsu)}W`);
      }
    }

    // GPU-Case form factor check (basic compatibility)
    if (build.gpu && build.case && build.gpu.length) {
      // Most cases support 300mm+ GPUs, warn if GPU is very long
      if (build.gpu.length > 350) {
        issues.push(`Large GPU (${build.gpu.length}mm) - verify case compatibility`);
      }
    }

    return issues;
  }, [build, calculateTotalWattage, inferCPUSocket]);

  const compatibilityIssues = checkCompatibility();
  const isComplete = build.cpu && build.gpu && build.motherboard && build.ram && build.storage.length > 0 && build.psu;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">PC Builder</h1>
        <p className="text-stone-400">Select your components to build your dream PC</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Parts List - Left Column */}
        <div className="lg:col-span-2 space-y-4">
          {partCategories.map((category) => {
            const Icon = category.icon;
            const part = category.id === "storage" ? build.storage : build[category.id];
            const hasPart = category.id === "storage" ? build.storage.length > 0 : !!part;

            return (
              <motion.div
                key={category.id}
                layout
                className={`p-4 rounded-xl border transition-all ${hasPart
                  ? "bg-[#1c1917] border-[#292524]"
                  : "bg-[#171514] border-[#292524] border-dashed"
                  }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${hasPart ? "bg-[#ffa828]" : "bg-[#292524]"
                      }`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{category.label}</span>
                        {category.required && !hasPart && (
                          <span className="text-xs text-[#ff4b4b]">Required</span>
                        )}
                      </div>
                      {hasPart ? (
                        <div className="text-sm text-stone-400">
                          {category.id === "storage" ? (
                            build.storage.map(s => s.name).join(", ")
                          ) : (
                            (part as AnyPart)?.name
                          )}
                        </div>
                      ) : (
                        <div className="text-sm text-stone-500">Not selected</div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {hasPart && (
                      <>
                        <span className="text-sm font-medium text-[#c678dd]">
                          ${category.id === "storage"
                            ? build.storage.reduce((sum, s) => sum + (s.price || 0), 0).toFixed(2)
                            : ((part as AnyPart)?.price || 0).toFixed(2)
                          }
                        </span>
                        <button
                          onClick={() => handleRemovePart(category.id)}
                          className="p-2 text-stone-500 hover:text-[#ff4b4b] transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => setActiveCategory(category.id)}
                      className={`p-2 rounded-lg transition-colors ${hasPart
                        ? "text-stone-400 hover:text-white hover:bg-[#292524]"
                        : "bg-[#ff4b4b] hover:bg-[#ffa828] text-white"
                        }`}
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Right Column - Summary & Visualizer */}
        <div className="space-y-6">
          {/* Build Summary */}
          <div className="p-6 bg-[#1c1917] border border-[#292524] rounded-xl">
            <h2 className="text-lg font-semibold mb-4">Build Summary</h2>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-stone-400">Total Price</span>
                <span className="text-2xl font-bold text-[#ff4b4b]">
                  ${calculateTotalPrice().toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400">Est. Wattage</span>
                <span className="font-medium">{calculateTotalWattage()}W</span>
              </div>
            </div>

            {/* Compatibility Status */}
            <div className={`p-4 rounded-lg ${compatibilityIssues.length > 0
              ? "bg-[#292524] border border-[#ff4b4b]"
              : isComplete
                ? "bg-[#292524] border border-[#ffa828]"
                : "bg-[#171514] border border-[#292524]"
              }`}>
              <div className="flex items-center gap-2 mb-2">
                {compatibilityIssues.length > 0 ? (
                  <>
                    <AlertTriangle className="w-5 h-5 text-[#ff4b4b]" />
                    <span className="font-medium text-[#ff4b4b]">Compatibility Issues</span>
                  </>
                ) : isComplete ? (
                  <>
                    <CheckCircle className="w-5 h-5 text-[#ffa828]" />
                    <span className="font-medium text-[#ffa828]">All Compatible</span>
                  </>
                ) : (
                  <>
                    <Info className="w-5 h-5 text-stone-400" />
                    <span className="font-medium text-stone-400">Select Parts</span>
                  </>
                )}
              </div>
              {compatibilityIssues.length > 0 && (
                <ul className="text-sm text-[#ff4b4b]/80 space-y-1">
                  {compatibilityIssues.map((issue, i) => (
                    <li key={i}>• {issue}</li>
                  ))}
                </ul>
              )}
            </div>

            {/* Analyze Button */}
            {isComplete && (
              <button
                onClick={() => setShowAnalysis(true)}
                className="w-full mt-4 py-3 bg-[#ff4b4b] hover:bg-[#ffa828] text-white font-semibold rounded-lg transition-all"
              >
                Analyze Build Performance
              </button>
            )}
          </div>

          {/* Mini Visualizer */}
          <BuildVisualizer build={build} />
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
          <BottleneckAnalysis
            build={build}
            onClose={() => setShowAnalysis(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
