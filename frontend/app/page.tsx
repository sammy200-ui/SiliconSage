"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle, XCircle, Cpu, Zap, TrendingUp, Monitor, Gamepad2, Laptop, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { PCBuildAnimation } from "@/components/home/pc-build-animation";
import { ValueEngineAnimation } from "@/components/home/value-engine-animation";
import { useState } from "react";

// Mock Data for Curated Builds
// Mock Data for Curated Builds
const curatedBuilds = [
  {
    id: 1,
    name: "The 1080p Value King",
    price: 685,
    specs: "Ryzen 5 5600 • RX 6600 • 16GB DDR4",
    details: {
      cpu: "AMD Ryzen 5 5600",
      gpu: "ASRock Radeon RX 6600 Challenger D",
      mobo: "MSI B550M PRO-VDH WIFI",
      ram: "Silicon Power 16GB (2x8GB) DDR4-3200",
      storage: "TeamGroup MP33 1TB NVMe",
      psu: "MSI MAG A550BN 550W",
      case: "Montech AIR 100 ARGB",
      cpu_price: 135, gpu_price: 190, mobo_price: 100, ram_price: 35, storage_price: 55, psu_price: 50, case_price: 60
    },
    bottleneck: "0%",
    valueScore: "9.8/10",
    imageColor: "bg-[#ffa828]",
  },
  {
    id: 2,
    name: "1440p High Refresh",
    price: 1250,
    specs: "Ryzen 5 7600X • RTX 4070 • 32GB DDR5",
    details: {
      cpu: "AMD Ryzen 5 7600X",
      gpu: "Gigabyte RTX 4070 WINDFORCE OC",
      mobo: "Gigabyte B650 AORUS ELITE AX",
      ram: "G.Skill Flare X5 32GB (2x16GB) DDR5-6000",
      storage: "WD Black SN770 1TB NVMe",
      psu: "Corsair RM750e 750W",
      case: "Lian Li CH210",
      cpu_price: 200, gpu_price: 550, mobo_price: 190, ram_price: 100, storage_price: 70, psu_price: 90, case_price: 50
    },
    bottleneck: "2%",
    valueScore: "9.5/10",
    imageColor: "bg-[#ff4b4b]",
  },
  {
    id: 3,
    name: "4K Ray Tracing Beast",
    price: 2400,
    specs: "Ryzen 7 7800X3D • RTX 4080 Super • 32GB DDR5",
    details: {
      cpu: "AMD Ryzen 7 7800X3D",
      gpu: "ASUS TUF RTX 4080 Super",
      mobo: "ASUS ROG STRIX B650-A GAMING WIFI",
      ram: "Corsair Vengeance RGB 32GB DDR5-6000",
      storage: "Samsung 990 Pro 2TB",
      psu: "Corsair RM1000e 1000W",
      case: "Hyte Y60",
      cpu_price: 380, gpu_price: 1000, mobo_price: 220, ram_price: 125, storage_price: 160, psu_price: 140, case_price: 180
    },
    bottleneck: "0%",
    valueScore: "9.2/10",
    imageColor: "bg-[#c678dd]",
  },
];

export default function Home() {
  const [activeEcosystem, setActiveEcosystem] = useState<"pc" | "console">("pc");

  return (
    <div className="min-h-screen bg-[#171514]">
      {/* Hero Section */}
      <section className="relative pt-32 pb-24 lg:pt-48 lg:pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto min-h-[90vh] flex flex-col justify-center">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#292524] border border-[#44403c] rounded-full text-sm text-[#ffa828]">
              <span className="w-2 h-2 bg-[#ffa828] rounded-full animate-pulse" />
              AI-Powered Value Optimization
            </div>

            <h1 className="text-5xl sm:text-6xl font-bold tracking-tight text-white leading-[1.1]">
              Build Smarter, <br />
              <span className="text-[#ff4b4b]">Not Harder.</span>
            </h1>

            <p className="text-xl text-stone-400 max-w-lg">
              SiliconSage analyzes thousands of parts to predict bottlenecks, optimize value, and save you money before you buy.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/builder"
                className="inline-flex items-center justify-center px-8 py-4 bg-[#ff4b4b] hover:bg-[#ffa828] text-white font-semibold rounded-xl transition-all shadow-lg shadow-[#ff4b4b]/20"
              >
                Start Building Now
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
              <Link
                href="/compare"
                className="inline-flex items-center justify-center px-8 py-4 bg-[#292524] hover:bg-[#1c1917] text-stone-200 font-semibold rounded-xl transition-colors border border-[#44403c]"
              >
                Compare Ecosystems
              </Link>
            </div>
          </div>

          <div className="flex justify-center lg:justify-end">
            <PCBuildAnimation />
          </div>
        </div>
      </section>

      {/* Value Engine Section */}
      <section className="py-24 bg-[#1c1917] border-y border-[#292524]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">The Value Engine Difference</h2>
            <p className="text-stone-400 text-lg">Stop overspending on parts that don't matter.</p>
          </div>

          <ValueEngineAnimation />
        </div>
      </section>

      {/* Curated Builds Carousel */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-12">
          <div>
            <h2 className="text-3xl font-bold mb-2">Curated Builds</h2>
            <p className="text-stone-400">Hand-picked by our algorithms for every budget.</p>
          </div>
          <Link href="/builder" className="hidden sm:flex items-center gap-2 text-[#ffa828] hover:text-[#ff4b4b] font-medium transition-colors">
            View All Parts <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {curatedBuilds.map((build) => (
            <div key={build.id} className="group relative bg-[#1c1917] border border-[#292524] rounded-2xl overflow-hidden hover:border-[#ff4b4b] transition-all hover:translate-y-[-4px]">
              <div className={`h-2 bg-gradient-to-r ${build.id === 1 ? 'from-[#ffa828] to-yellow-500' : build.id === 2 ? 'from-[#ff4b4b] to-red-600' : 'from-[#c678dd] to-purple-600'}`} />
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-bold text-lg leading-tight">{build.name}</h3>
                  <span className="font-mono text-[#ff4b4b] font-bold">${build.price}</span>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="text-sm text-stone-400 pb-3 border-b border-[#292524]">
                    {build.specs}
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-stone-500">Bottleneck</span>
                    <span className="text-stone-300 font-medium">{build.bottleneck}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-stone-500">Value Score</span>
                    <span className="text-[#ffa828] font-medium">{build.valueScore}</span>
                  </div>
                </div>

                <Link
                  href={`/builder?cpu=${encodeURIComponent(build.details.cpu)}&cpu_price=${build.details.cpu_price}&gpu=${encodeURIComponent(build.details.gpu)}&gpu_price=${build.details.gpu_price}&mobo=${encodeURIComponent(build.details.mobo)}&mobo_price=${build.details.mobo_price}&ram=${encodeURIComponent(build.details.ram)}&ram_price=${build.details.ram_price}&storage=${encodeURIComponent(build.details.storage)}&storage_price=${build.details.storage_price}&psu=${encodeURIComponent(build.details.psu)}&psu_price=${build.details.psu_price}&case=${encodeURIComponent(build.details.case)}&case_price=${build.details.case_price}`}
                  className="block w-full text-center py-2.5 bg-[#292524] hover:bg-[#ff4b4b] hover:text-white text-stone-300 rounded-lg text-sm font-medium transition-colors"
                >
                  View Build Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Ecosystem Comparison */}
      <section className="py-24 bg-[#1c1917]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">PC vs. Console</h2>
              <p className="text-stone-400 text-lg mb-8">
                Is a $500 console actually cheaper than a PC? We crunch the numbers on long-term costs, not just hardware price.
              </p>

              <div className="flex gap-4 mb-8">
                <button
                  onClick={() => setActiveEcosystem("pc")}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${activeEcosystem === "pc"
                    ? "bg-[#ff4b4b] text-white"
                    : "bg-[#292524] text-stone-400 hover:text-white"
                    }`}
                >
                  <Monitor className="w-5 h-5" /> Gaming PC
                </button>
                <button
                  onClick={() => setActiveEcosystem("console")}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${activeEcosystem === "console"
                    ? "bg-[#ff4b4b] text-white"
                    : "bg-[#292524] text-stone-400 hover:text-white"
                    }`}
                >
                  <Gamepad2 className="w-5 h-5" /> Console
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-lg ${activeEcosystem === "pc" ? "bg-[#ffa828]/20 text-[#ffa828]" : "bg-[#292524] text-stone-500"}`}>
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm text-stone-500">Average FPS (1440p)</div>
                    <div className="text-xl font-bold">{activeEcosystem === "pc" ? "110+ FPS" : "60 FPS (capped)"}</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-lg ${activeEcosystem === "pc" ? "bg-[#c678dd]/20 text-[#c678dd]" : "bg-[#292524] text-stone-500"}`}>
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm text-stone-500">Game Cost (5 Yr)</div>
                    <div className="text-xl font-bold">{activeEcosystem === "pc" ? "~$250 (Sales & Bundles)" : "~$600 (Full Price)"}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-[#ff4b4b]/10 to-[#ffa828]/10 blur-3xl rounded-full" />
              <div className="relative bg-[#171514] border border-[#292524] rounded-2xl p-8">
                {/* Visual Bar Chart Animation */}
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-stone-400">Total 5-Year Cost</span>
                      <span className="text-stone-200 font-bold">{activeEcosystem === "pc" ? "$1,850" : "$2,100"}</span>
                    </div>
                    <div className="h-4 bg-[#292524] rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-[#ff4b4b]"
                        initial={{ width: "50%" }}
                        animate={{ width: activeEcosystem === "pc" ? "65%" : "85%" }}
                        transition={{ type: "spring", bounce: 0.2 }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-stone-400">Performance Score</span>
                      <span className="text-stone-200 font-bold">{activeEcosystem === "pc" ? "92/100" : "75/100"}</span>
                    </div>
                    <div className="h-4 bg-[#292524] rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-[#ffa828]"
                        initial={{ width: "50%" }}
                        animate={{ width: activeEcosystem === "pc" ? "92%" : "75%" }}
                        transition={{ type: "spring", bounce: 0.2 }}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-8 border-t border-[#292524] text-center">
                  <p className="text-stone-400 text-sm mb-4">
                    {activeEcosystem === "pc"
                      ? "PC has a higher upfront cost, but saves money long-term on games and subscriptions."
                      : "Consoles are cheaper upfront, but online fees and game prices add up fast."}
                  </p>
                  <Link href="/compare" className="text-[#ffa828] hover:text-[#ff4b4b] text-sm font-medium flex items-center justify-center gap-1">
                    See Full Breakdown <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-[#292524] bg-[#171514]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-stone-500 text-sm">
              © 2026 SiliconSage. Only the truth about hardware.
            </p>
            <div className="flex items-center gap-6 text-sm text-stone-500">
              <Link href="/builder" className="hover:text-[#ff4b4b] transition-colors">Builder</Link>
              <Link href="/compare" className="hover:text-[#ff4b4b] transition-colors">Ecosystems</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
