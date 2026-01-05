import Link from "next/link";
import { Cpu, Zap, TrendingUp, MessageSquare, ArrowRight, Monitor, Gamepad2, Database, Sparkles } from "lucide-react";
import { getDatabaseStats, getFeaturedParts } from "./actions/parts";

const features = [
  {
    icon: Cpu,
    title: "Smart Parts Matcher",
    description: "AI-powered compatibility checking with 2D visualization of your build.",
    color: "from-violet-500 to-purple-600",
  },
  {
    icon: Zap,
    title: "Bottleneck Calculator",
    description: "ML model predicts FPS and warns if your CPU is choking your GPU.",
    color: "from-amber-500 to-orange-600",
  },
  {
    icon: TrendingUp,
    title: "Value Optimization",
    description: "Get the best performance per dollar with tier-based recommendations.",
    color: "from-emerald-500 to-teal-600",
  },
  {
    icon: MessageSquare,
    title: "AI Advisor",
    description: "Chat with Llama 3 to understand why a build is good or bad.",
    color: "from-cyan-500 to-blue-600",
  },
];

const ecosystemCards = [
  {
    icon: Monitor,
    title: "Custom PC",
    description: "Full control, upgradability, best value for power users",
    specs: "Up to 240 FPS • Unlimited storage • VR Ready",
  },
  {
    icon: Gamepad2,
    title: "Console (PS5/Xbox)",
    description: "Plug and play, exclusive games, consistent experience",
    specs: "60-120 FPS • 1TB storage • Couch gaming",
  },
  {
    icon: Monitor,
    title: "Gaming Laptop",
    description: "Portable power, all-in-one solution",
    specs: "60-144 FPS • Portable • Work + Play",
  },
];

export default async function Home() {
  // Fetch real data from Supabase
  const [stats, featured] = await Promise.all([
    getDatabaseStats(),
    getFeaturedParts(),
  ]);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-violet-950/20 via-zinc-950 to-zinc-950" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-to-r from-violet-600/20 to-cyan-600/20 blur-3xl rounded-full" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-32">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-800/50 border border-zinc-700 rounded-full text-sm text-zinc-300 mb-8">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              AI-Powered PC Building
            </div>
            
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
              Build Smarter,{" "}
              <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                Not Harder
              </span>
            </h1>
            
            <p className="text-xl text-zinc-400 max-w-2xl mx-auto mb-10">
              SiliconSage uses Machine Learning to predict bottlenecks, optimize value, 
              and tell you if a PS5 is actually a better deal than your $700 build.
            </p>

            {/* Database Stats Badge */}
            {stats && (
              <div className="flex items-center justify-center gap-2 mb-10">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-950/50 border border-emerald-700/50 rounded-full text-sm text-emerald-300">
                  <Database className="w-4 h-4" />
                  <span className="font-semibold">{stats.totalParts.toLocaleString()}</span> real parts from our database
                </div>
              </div>
            )}
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/builder"
                className="group flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white font-semibold rounded-xl transition-all hover:shadow-xl hover:shadow-violet-500/25"
              >
                Start Building
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/compare"
                className="px-8 py-4 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold rounded-xl transition-colors border border-zinc-700"
              >
                Compare Ecosystems
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-zinc-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              More Than a Compatibility Checker
            </h2>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
              SiliconSage is a Value Optimization Engine powered by real ML models.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group p-6 bg-zinc-900 border border-zinc-800 rounded-2xl hover:border-zinc-700 transition-all part-card"
              >
                <div className={`w-12 h-12 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-4`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-zinc-400 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Parts Section - Real Data from Supabase */}
      {(featured.cpus.length > 0 || featured.gpus.length > 0) && (
        <section className="py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-violet-950/50 border border-violet-700/50 rounded-full text-xs text-violet-300 mb-4">
                <Sparkles className="w-3 h-3" />
                Live from Database
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Top Performance Picks
              </h2>
              <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
                Best performing parts under $500 (CPUs) and $800 (GPUs) from our database.
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Top CPUs */}
              {featured.cpus.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-violet-400 flex items-center gap-2">
                    <Cpu className="w-5 h-5" />
                    Top CPUs
                  </h3>
                  <div className="space-y-3">
                    {featured.cpus.map((cpu, idx) => (
                      <div
                        key={cpu.id}
                        className="flex items-center justify-between p-4 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-violet-700/50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <span className="text-2xl font-bold text-zinc-600">#{idx + 1}</span>
                          <div>
                            <p className="font-medium">{cpu.name}</p>
                            <p className="text-sm text-zinc-500">
                              {cpu.core_count} cores • {cpu.boost_clock}GHz boost • {cpu.tdp}W TDP
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-semibold text-emerald-400">${cpu.price?.toFixed(2)}</p>
                          <p className="text-xs text-zinc-500">Score: {cpu.benchmark_score?.toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Top GPUs */}
              {featured.gpus.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-cyan-400 flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    Top GPUs
                  </h3>
                  <div className="space-y-3">
                    {featured.gpus.map((gpu, idx) => (
                      <div
                        key={gpu.id}
                        className="flex items-center justify-between p-4 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-cyan-700/50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <span className="text-2xl font-bold text-zinc-600">#{idx + 1}</span>
                          <div>
                            <p className="font-medium">{gpu.name}</p>
                            <p className="text-sm text-zinc-500">
                              {gpu.chipset} • {gpu.memory}GB • {gpu.boost_clock}MHz
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-semibold text-emerald-400">${gpu.price?.toFixed(2)}</p>
                          <p className="text-xs text-zinc-500">Score: {gpu.benchmark_score?.toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="text-center mt-10">
              <Link
                href="/builder"
                className="inline-flex items-center gap-2 text-violet-400 hover:text-violet-300 font-medium"
              >
                Browse all {stats?.totalParts.toLocaleString()} parts in the builder
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Ecosystem Comparison Preview */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              PC vs Console vs Laptop
            </h2>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
              We don&apos;t just help you build a PC—we tell you if you even should.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {ecosystemCards.map((card, index) => (
              <div
                key={card.title}
                className={`p-6 rounded-2xl border transition-all part-card ${
                  index === 0
                    ? "bg-gradient-to-br from-violet-950/50 to-zinc-900 border-violet-500/30"
                    : "bg-zinc-900 border-zinc-800 hover:border-zinc-700"
                }`}
              >
                <card.icon className={`w-10 h-10 mb-4 ${index === 0 ? "text-violet-400" : "text-zinc-400"}`} />
                <h3 className="text-xl font-semibold mb-2">{card.title}</h3>
                <p className="text-zinc-400 text-sm mb-4">{card.description}</p>
                <p className="text-xs text-zinc-500">{card.specs}</p>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-10">
            <Link
              href="/compare"
              className="inline-flex items-center gap-2 text-violet-400 hover:text-violet-300 font-medium"
            >
              See full comparison
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-b from-zinc-900 to-zinc-950">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            Ready to Build Your Dream PC?
          </h2>
          <p className="text-zinc-400 text-lg mb-10">
            Let our AI guide you through every step, from part selection to final build.
          </p>
          <Link
            href="/builder"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white font-semibold rounded-xl transition-all hover:shadow-xl hover:shadow-violet-500/25"
          >
            <Cpu className="w-5 h-5" />
            Launch PC Builder
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-zinc-500 text-sm">
              © 2026 SiliconSage. Built with Next.js, FastAPI & Scikit-Learn.
            </p>
            <div className="flex items-center gap-6 text-sm text-zinc-500">
              <Link href="/builder" className="hover:text-white transition-colors">Builder</Link>
              <Link href="/compare" className="hover:text-white transition-colors">Compare</Link>
              <Link href="/advisor" className="hover:text-white transition-colors">AI Advisor</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
