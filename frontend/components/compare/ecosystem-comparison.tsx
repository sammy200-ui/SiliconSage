"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Monitor, Gamepad2, Laptop,
  Check, X, ArrowRight
} from "lucide-react";
import Link from "next/link";

interface SystemSpec {
  id: string;
  name: string;
  type: "pc" | "console" | "laptop";
  icon: typeof Monitor;
  price: number;
  fps1080p: number;
  fps1440p: number;
  fps4k: number;
  storage: string;
  upgradeability: "high" | "medium" | "low" | "none";
  portability: "high" | "medium" | "low" | "none";
  exclusives: string[];
  pros: string[];
  cons: string[];
}

const systems: SystemSpec[] = [
  {
    id: "budget-pc",
    name: "Budget Gaming PC",
    type: "pc",
    icon: Monitor,
    price: 600,
    fps1080p: 80,
    fps1440p: 50,
    fps4k: 25,
    storage: "500GB SSD",
    upgradeability: "high",
    portability: "none",
    exclusives: [],
    pros: ["Upgradeable", "Multi-purpose", "Free online"],
    cons: ["Requires assembly", "No exclusives", "Takes desk space"],
  },
  {
    id: "midrange-pc",
    name: "Mid-Range Gaming PC",
    type: "pc",
    icon: Monitor,
    price: 1000,
    fps1080p: 144,
    fps1440p: 100,
    fps4k: 50,
    storage: "1TB NVMe",
    upgradeability: "high",
    portability: "none",
    exclusives: [],
    pros: ["High FPS gaming", "VR ready", "Streaming capable"],
    cons: ["Higher upfront cost", "Power consumption"],
  },
  {
    id: "highend-pc",
    name: "High-End Gaming PC",
    type: "pc",
    icon: Monitor,
    price: 1800,
    fps1080p: 240,
    fps1440p: 165,
    fps4k: 100,
    storage: "2TB NVMe",
    upgradeability: "high",
    portability: "none",
    exclusives: [],
    pros: ["Best performance", "4K capable", "Future-proof"],
    cons: ["Expensive", "High power draw"],
  },
  {
    id: "ps5",
    name: "PlayStation 5",
    type: "console",
    icon: Gamepad2,
    price: 499,
    fps1080p: 60,
    fps1440p: 60,
    fps4k: 30,
    storage: "825GB SSD",
    upgradeability: "low",
    portability: "low",
    exclusives: ["Spider-Man 2", "God of War", "Horizon", "Final Fantasy XVI"],
    pros: ["Just works", "Great exclusives", "Couch gaming"],
    cons: ["Paid online ($60/yr)", "Limited storage", "No upgrades"],
  },
  {
    id: "xbox",
    name: "Xbox Series X",
    type: "console",
    icon: Gamepad2,
    price: 499,
    fps1080p: 60,
    fps1440p: 60,
    fps4k: 30,
    storage: "1TB SSD",
    upgradeability: "low",
    portability: "low",
    exclusives: ["Forza", "Halo", "Starfield", "Gears"],
    pros: ["Game Pass value", "Quick Resume", "1TB storage"],
    cons: ["Paid online", "Fewer exclusives than PS5"],
  },
  {
    id: "steam-deck",
    name: "Steam Deck OLED",
    type: "console",
    icon: Gamepad2,
    price: 549,
    fps1080p: 45,
    fps1440p: 30,
    fps4k: 0,
    storage: "512GB SSD",
    upgradeability: "low",
    portability: "high",
    exclusives: [],
    pros: ["Portable PC gaming", "Steam library", "OLED screen"],
    cons: ["Lower performance", "Battery life", "Smaller screen"],
  },
  {
    id: "budget-laptop",
    name: "Budget Gaming Laptop",
    type: "laptop",
    icon: Laptop,
    price: 799,
    fps1080p: 60,
    fps1440p: 40,
    fps4k: 20,
    storage: "512GB SSD",
    upgradeability: "low",
    portability: "high",
    exclusives: [],
    pros: ["Portable", "All-in-one", "Work + Play"],
    cons: ["Thermal throttling", "Limited upgrade", "Smaller display"],
  },
  {
    id: "midrange-laptop",
    name: "Mid-Range Gaming Laptop",
    type: "laptop",
    icon: Laptop,
    price: 1299,
    fps1080p: 100,
    fps1440p: 70,
    fps4k: 35,
    storage: "1TB SSD",
    upgradeability: "low",
    portability: "high",
    exclusives: [],
    pros: ["Solid portable performance", "Good display", "Versatile"],
    cons: ["Heat under load", "Battery life when gaming"],
  },
];

export function EcosystemComparison() {
  const [budget, setBudget] = useState(1000);
  const [priority, setPriority] = useState<"performance" | "value" | "portability">("value");
  const [selectedSystems, setSelectedSystems] = useState<string[]>(["midrange-pc", "ps5", "midrange-laptop"]);

  const filteredSystems = useMemo(() => {
    return systems.filter((s) => s.price <= budget + 300);
  }, [budget]);

  const toggleSystem = (id: string) => {
    setSelectedSystems((prev) =>
      prev.includes(id)
        ? prev.filter((s) => s !== id)
        : prev.length < 4 ? [...prev, id] : prev
    );
  };

  const compareData = useMemo(() => {
    return systems.filter((s) => selectedSystems.includes(s.id));
  }, [selectedSystems]);

  const calculateValue = (system: SystemSpec) => {
    // Value = weighted performance per dollar
    const perfScore = system.fps1080p * 0.5 + system.fps1440p * 0.3 + system.fps4k * 0.2;
    return perfScore / (system.price / 100);
  };

  const getBestFor = (category: "performance" | "value" | "portability") => {
    const sorted = [...compareData].sort((a, b) => {
      switch (category) {
        case "performance":
          return (b.fps1080p + b.fps1440p + b.fps4k) - (a.fps1080p + a.fps1440p + a.fps4k);
        case "value":
          return calculateValue(b) - calculateValue(a);
        case "portability":
          const portScore = { high: 3, medium: 2, low: 1, none: 0 };
          return portScore[b.portability] - portScore[a.portability];
      }
    });
    return sorted[0]?.id;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Ecosystem Comparison</h1>
        <p className="text-stone-400">PC vs Console vs Laptop — Find the best value for your needs</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-6 mb-8 p-6 bg-[#1c1917] border border-[#292524] rounded-xl">
        <div>
          <label className="block text-sm text-stone-400 mb-2">Budget</label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min={500}
              max={2000}
              step={100}
              value={budget}
              onChange={(e) => setBudget(parseInt(e.target.value))}
              className="w-40 accent-[#ff4b4b]"
            />
            <span className="text-lg font-semibold text-[#ffa828]">${budget}</span>
          </div>
        </div>

        <div>
          <label className="block text-sm text-stone-400 mb-2">Priority</label>
          <div className="flex gap-2">
            {(["performance", "value", "portability"] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPriority(p)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${priority === p
                  ? "bg-[#ff4b4b] text-white"
                  : "bg-[#292524] text-stone-400 hover:text-white"
                  }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* System Selection */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Select Systems to Compare (max 4)</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {filteredSystems.map((system) => (
            <button
              key={system.id}
              onClick={() => toggleSystem(system.id)}
              className={`p-4 rounded-xl border text-left transition-all ${selectedSystems.includes(system.id)
                ? "bg-[#1c1917] border-[#ffa828]"
                : "bg-[#171514] border-[#292524] hover:border-[#44403c]"
                }`}
            >
              <system.icon className={`w-6 h-6 mb-2 ${selectedSystems.includes(system.id) ? "text-[#ffa828]" : "text-stone-500"
                }`} />
              <div className="font-medium text-sm">{system.name}</div>
              <div className="text-sm text-[#ff4b4b]">${system.price}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Comparison Table */}
      {compareData.length > 0 && (
        <div className="bg-[#1c1917] border border-[#292524] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#292524]">
                  <th className="text-left p-4 text-sm font-medium text-stone-400">Spec</th>
                  {compareData.map((system) => (
                    <th key={system.id} className="p-4 text-center min-w-[180px]">
                      <div className="flex flex-col items-center gap-2">
                        <system.icon className="w-8 h-8 text-[#ffa828]" />
                        <span className="font-semibold text-stone-200">{system.name}</span>
                        <span className="text-lg font-bold text-[#ff4b4b]">${system.price}</span>
                        {getBestFor(priority) === system.id && (
                          <span className="px-2 py-1 bg-[#ff4b4b] text-white text-xs rounded-full">
                            Best {priority}
                          </span>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-[#292524]">
                  <td className="p-4 text-sm text-stone-400">FPS @ 1080p</td>
                  {compareData.map((s) => (
                    <td key={s.id} className="p-4 text-center font-semibold text-stone-200">
                      {s.fps1080p} FPS
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-[#292524]">
                  <td className="p-4 text-sm text-stone-400">FPS @ 1440p</td>
                  {compareData.map((s) => (
                    <td key={s.id} className="p-4 text-center font-semibold text-stone-200">
                      {s.fps1440p} FPS
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-[#292524]">
                  <td className="p-4 text-sm text-stone-400">FPS @ 4K</td>
                  {compareData.map((s) => (
                    <td key={s.id} className="p-4 text-center font-semibold text-stone-200">
                      {s.fps4k > 0 ? `${s.fps4k} FPS` : "N/A"}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-[#292524]">
                  <td className="p-4 text-sm text-stone-400">Storage</td>
                  {compareData.map((s) => (
                    <td key={s.id} className="p-4 text-center text-stone-200">{s.storage}</td>
                  ))}
                </tr>
                <tr className="border-b border-[#292524]">
                  <td className="p-4 text-sm text-stone-400">Upgradeability</td>
                  {compareData.map((s) => (
                    <td key={s.id} className="p-4 text-center">
                      <span className={`capitalize ${s.upgradeability === "high" ? "text-[#ffa828]" :
                        s.upgradeability === "medium" ? "text-[#c678dd]" :
                          s.upgradeability === "low" ? "text-stone-400" : "text-[#ff4b4b]"
                        }`}>
                        {s.upgradeability}
                      </span>
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-[#292524]">
                  <td className="p-4 text-sm text-stone-400">Portability</td>
                  {compareData.map((s) => (
                    <td key={s.id} className="p-4 text-center">
                      <span className={`capitalize ${s.portability === "high" ? "text-[#ffa828]" :
                        s.portability === "medium" ? "text-[#c678dd]" :
                          s.portability === "low" ? "text-stone-400" : "text-[#ff4b4b]"
                        }`}>
                        {s.portability === "none" ? "Desktop only" : s.portability}
                      </span>
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-[#292524]">
                  <td className="p-4 text-sm text-stone-400">Value Score</td>
                  {compareData.map((s) => {
                    const value = calculateValue(s);
                    const maxValue = Math.max(...compareData.map(calculateValue));
                    return (
                      <td key={s.id} className="p-4">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-24 h-2 bg-[#292524] rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${(value / maxValue) * 100}%` }}
                              className="h-full bg-[#ff4b4b]"
                            />
                          </div>
                          <span className="text-sm font-medium text-stone-200">{Math.round(value)}</span>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pros & Cons */}
      {compareData.length > 0 && (
        <div className="mt-8 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {compareData.slice(0, 3).map((system) => (
            <motion.div
              key={system.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 bg-[#1c1917] border border-[#292524] rounded-xl"
            >
              <div className="flex items-center gap-3 mb-4">
                <system.icon className="w-8 h-8 text-[#ffa828]" />
                <div>
                  <h3 className="font-semibold text-stone-200">{system.name}</h3>
                  <span className="text-[#ff4b4b] font-medium">${system.price}</span>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <span className="text-sm text-stone-400">Pros</span>
                  <ul className="mt-1 space-y-1">
                    {system.pros.map((pro) => (
                      <li key={pro} className="flex items-center gap-2 text-sm text-stone-300">
                        <Check className="w-4 h-4 text-[#ffa828]" />
                        {pro}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <span className="text-sm text-stone-400">Cons</span>
                  <ul className="mt-1 space-y-1">
                    {system.cons.map((con) => (
                      <li key={con} className="flex items-center gap-2 text-sm text-stone-300">
                        <X className="w-4 h-4 text-[#ff4b4b]" />
                        {con}
                      </li>
                    ))}
                  </ul>
                </div>
                {system.exclusives.length > 0 && (
                  <div>
                    <span className="text-sm text-stone-400">Exclusives</span>
                    <p className="text-sm mt-1 text-stone-300">{system.exclusives.join(", ")}</p>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* CTA */}
      <div className="mt-12 text-center">
        <p className="text-stone-400 mb-4">
          Decided on building a PC? Let us help you pick the perfect parts.
        </p>
        <Link
          href="/builder"
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#ff4b4b] hover:bg-[#ffa828] text-white font-semibold rounded-xl transition-all"
        >
          Start Building
          <ArrowRight className="w-5 h-5" />
        </Link>
      </div>
    </div>
  );
}
