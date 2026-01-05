"use client";

import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { X, Search, Filter, TrendingUp } from "lucide-react";
import type { BuildState } from "./builder-interface";
import { fetchParts, SAMPLE_PARTS } from "@/lib/supabase/parts";
import type { PartCategory, CPU, GPU, Motherboard, RAM, Storage, PSU, Case, CPUCooler } from "@/lib/types/database";

// Type for any part
type AnyPart = CPU | GPU | Motherboard | RAM | Storage | PSU | Case | CPUCooler;

// Category mapping for the parts service
const CATEGORY_MAP: Record<string, PartCategory> = {
  cpu: "cpu",
  gpu: "gpu",
  motherboard: "motherboard",
  ram: "ram",
  storage: "storage",
  psu: "psu",
  case: "case",
  cooler: "cooler",
};

interface PartSelectorProps {
  category: PartCategory;
  onSelect: (part: AnyPart) => void;
  onClose: () => void;
  currentBuild: BuildState;
}

export function PartSelector({ category, onSelect, onClose, currentBuild }: PartSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"price" | "benchmark" | "value">("value");
  const [parts, setParts] = useState<AnyPart[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch parts on mount
  useEffect(() => {
    async function loadParts() {
      setLoading(true);
      try {
        const fetchedParts = await fetchParts<AnyPart>(CATEGORY_MAP[category] || category);
        setParts(fetchedParts);
      } catch (error) {
        console.error("Failed to load parts:", error);
        // Fallback to sample data
        const sampleData = SAMPLE_PARTS[CATEGORY_MAP[category] || category];
        setParts(sampleData as AnyPart[]);
      }
      setLoading(false);
    }
    loadParts();
  }, [category]);

  const filteredParts = useMemo(() => {
    const filtered = parts.filter((part: AnyPart) =>
      part.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Sort - use type assertion for parts that may have benchmark_score
    filtered.sort((a: AnyPart, b: AnyPart) => {
      const aPrice = a.price || 0;
      const bPrice = b.price || 0;
      if (sortBy === "price") return aPrice - bPrice;
      const aScore = "benchmark_score" in a ? ((a as { benchmark_score?: number }).benchmark_score || 0) : 0;
      const bScore = "benchmark_score" in b ? ((b as { benchmark_score?: number }).benchmark_score || 0) : 0;
      if (sortBy === "benchmark") return bScore - aScore;
      // Value = benchmark per dollar
      const aValue = aScore > 0 ? aScore / (aPrice || 1) : aPrice || 0;
      const bValue = bScore > 0 ? bScore / (bPrice || 1) : bPrice || 0;
      return bValue - aValue;
    });

    return filtered;
  }, [parts, searchQuery, sortBy]);

  const getCategoryLabel = (cat: string) => {
    const labels: Record<string, string> = {
      cpu: "CPU",
      gpu: "Graphics Card",
      motherboard: "Motherboard",
      ram: "Memory",
      storage: "Storage",
      psu: "Power Supply",
      case: "Case",
      cooler: "CPU Cooler",
    };
    return labels[cat] || cat;
  };

  const renderPartDetails = (part: AnyPart) => {
    switch (category) {
      case "cpu": {
        const cpu = part as CPU;
        return `${cpu.core_count}C • ${cpu.boost_clock || cpu.core_clock}GHz • ${cpu.microarchitecture} • ${cpu.tdp}W`;
      }
      case "gpu": {
        const gpu = part as GPU;
        return `${gpu.memory}GB • ${gpu.chipset} • ${gpu.length || "?"}mm`;
      }
      case "motherboard": {
        const mb = part as Motherboard;
        return `${mb.socket} • ${mb.form_factor} • ${mb.max_memory || "?"}GB max`;
      }
      case "ram": {
        const ram = part as RAM;
        const totalGB = ram.total_capacity || (ram.module_count && ram.module_size ? ram.module_count * ram.module_size : "?");
        const ddrType = ram.speed_ddr ? `DDR${ram.speed_ddr}` : "DDR?";
        const speed = ram.speed_mhz || "?";
        return `${totalGB}GB • ${ddrType}-${speed} • CL${ram.cas_latency || "?"}`;
      }
      case "storage": {
        const storage = part as Storage;
        const cap = storage.capacity >= 1000 ? `${storage.capacity / 1000}TB` : `${storage.capacity}GB`;
        return `${cap} • ${storage.type} • ${storage.form_factor || "?"}`;
      }
      case "psu": {
        const psu = part as PSU;
        return `${psu.wattage}W • 80+ ${psu.efficiency || "?"} • ${psu.modular || "?"}`;
      }
      case "case": {
        const c = part as Case;
        return `${c.type || "?"} • ${c.side_panel || "?"}`;
      }
      case "cooler": {
        const cooler = part as CPUCooler;
        const isAIO = cooler.size && cooler.size > 0;
        return isAIO ? `AIO ${cooler.size}mm • ${cooler.color || "?"}` : `Air Cooler • ${cooler.color || "?"}`;
      }
      default:
        return "";
    }
  };

  // Helper to infer socket from CPU name/microarchitecture
  const inferCPUSocket = (cpu: CPU): string => {
    const name = cpu.name.toLowerCase();
    const arch = cpu.microarchitecture?.toLowerCase() || "";

    // Intel sockets
    if (name.includes("14th") || name.includes("13th") || name.includes("12th") ||
      arch.includes("raptor") || arch.includes("alder")) return "LGA1700";
    if (arch.includes("arrow")) return "LGA1851";
    if (name.includes("11th") || name.includes("10th") || arch.includes("rocket") ||
      arch.includes("comet")) return "LGA1200";
    if (arch.includes("coffee") || arch.includes("kaby") || arch.includes("skylake")) return "LGA1151";

    // AMD sockets  
    if (arch.includes("zen 5") || arch.includes("zen 4")) return "AM5";
    if (arch.includes("zen 3") || arch.includes("zen 2") || arch.includes("zen+") ||
      arch.includes("zen")) return "AM4";

    return "Unknown";
  };

  const checkCompatibility = (part: AnyPart): { compatible: boolean; warning?: string } => {
    // Motherboard-CPU socket check
    if (category === "motherboard" && currentBuild.cpu) {
      const mb = part as Motherboard;
      const cpuSocket = inferCPUSocket(currentBuild.cpu as CPU);
      if (mb.socket !== cpuSocket && cpuSocket !== "Unknown") {
        return { compatible: false, warning: `Socket mismatch: ${mb.socket} vs CPU ${cpuSocket}` };
      }
    }
    if (category === "cpu" && currentBuild.motherboard) {
      const cpu = part as CPU;
      const cpuSocket = inferCPUSocket(cpu);
      if (cpuSocket !== currentBuild.motherboard.socket && cpuSocket !== "Unknown") {
        return { compatible: false, warning: `Socket mismatch: ${cpuSocket} vs Motherboard ${currentBuild.motherboard.socket}` };
      }
    }

    // RAM-Motherboard DDR type check (infer from names)
    if (category === "ram" && currentBuild.motherboard) {
      const ram = part as RAM;
      const ramDDR = ram.speed_ddr;
      const moboName = currentBuild.motherboard.name.toLowerCase();
      // Check if DDR version matches (DDR4 vs DDR5)
      if (ramDDR === 5 && !moboName.includes("ddr5") && moboName.includes("ddr4")) {
        return { compatible: false, warning: `DDR5 RAM not compatible with DDR4 motherboard` };
      } else if (ramDDR === 4 && moboName.includes("ddr5")) {
        return { compatible: false, warning: `DDR4 RAM not compatible with DDR5 motherboard` };
      }
    }

    return { compatible: true };
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#171514]/90 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-3xl max-h-[80vh] bg-[#1c1917] border border-[#292524] rounded-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-[#292524] flex items-center justify-between">
          <h2 className="text-xl font-semibold">Select {getCategoryLabel(category)}</h2>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-white rounded-lg hover:bg-[#292524] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filters */}
        <div className="p-4 border-b border-[#292524] flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
            <input
              type="text"
              placeholder="Search parts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#292524] border border-[#44403c] rounded-lg text-sm focus:outline-none focus:border-[#ffa828]"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-stone-500" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "value" | "price" | "benchmark")}
              className="px-3 py-2 bg-[#292524] border border-[#44403c] rounded-lg text-sm focus:outline-none focus:border-[#ffa828]"
            >
              <option value="value">Best Value</option>
              <option value="price">Price: Low to High</option>
              <option value="benchmark">Performance</option>
            </select>
          </div>
        </div>

        {/* Parts List */}
        <div className="overflow-y-auto max-h-[calc(80vh-140px)] p-4 space-y-3">
          {loading ? (
            <div className="text-center py-12 text-stone-500">Loading parts...</div>
          ) : filteredParts.map((part) => {
            const compat = checkCompatibility(part);
            const benchmarkScore = "benchmark_score" in part ? (part as { benchmark_score?: number }).benchmark_score : null;
            const price = part.price || 0;
            const valueScore = benchmarkScore && price > 0 ? Math.round((benchmarkScore / price) * 10) / 10 : null;

            return (
              <motion.button
                key={part.id}
                onClick={() => onSelect(part)}
                disabled={!compat.compatible}
                className={`w-full p-4 rounded-xl border text-left transition-all ${compat.compatible
                  ? "bg-[#171514] border-[#292524] hover:border-[#ffa828] hover:bg-[#292524]"
                  : "bg-[#1c1917] border-[#292524] opacity-50 cursor-not-allowed"
                  }`}
                whileHover={compat.compatible ? { scale: 1.01 } : {}}
                whileTap={compat.compatible ? { scale: 0.99 } : {}}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium truncate">{part.name}</span>
                      {valueScore && valueScore > 50 && (
                        <span className="flex items-center gap-1 px-2 py-0.5 bg-[#ffa828] text-white text-xs rounded-full">
                          <TrendingUp className="w-3 h-3" />
                          Great Value
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-stone-400">{renderPartDetails(part)}</p>
                    {!compat.compatible && (
                      <p className="text-sm text-red-400 mt-1">{compat.warning}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-[#ff4b4b]">{price > 0 ? `$${price}` : "N/A"}</div>
                    {valueScore && (
                      <div className="text-xs text-stone-500">{valueScore} perf/$</div>
                    )}
                  </div>
                </div>
              </motion.button>
            );
          })}

          {!loading && filteredParts.length === 0 && (
            <div className="text-center py-12 text-stone-500">
              No parts found matching your search.
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
