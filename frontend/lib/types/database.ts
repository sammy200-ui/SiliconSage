/**
 * SiliconSage Database Types
 * Matches the actual docyx/pc-part-dataset structure
 */

// CPU Table (from cpu.json)
export interface CPU {
  id: string;
  name: string;
  price: number | null;
  core_count: number;
  core_clock: number; // GHz
  boost_clock: number | null; // GHz
  microarchitecture: string;
  tdp: number;
  graphics: string | null; // Integrated graphics name or null
  benchmark_score?: number; // Computed by Supabase
  created_at?: string;
}

// GPU Table (from video-card.json)
export interface GPU {
  id: string;
  name: string;
  price: number | null;
  chipset: string;
  memory: number; // GB
  core_clock: number; // MHz
  boost_clock: number | null; // MHz
  color: string | null;
  length: number | null; // mm
  benchmark_score?: number; // Computed by Supabase
  created_at?: string;
}

// Motherboard Table (from motherboard.json)
export interface Motherboard {
  id: string;
  name: string;
  price: number | null;
  socket: string;
  form_factor: string; // ATX, Micro ATX, Mini ITX, etc.
  max_memory: number | null; // GB
  memory_slots: number | null;
  color: string | null;
  created_at?: string;
}

// RAM Table (from memory.json)
// Note: In DB, speed and modules are flattened into separate columns
export interface RAM {
  id: string;
  name: string;
  price: number | null;
  // Flattened from speed: [DDR, MHz] array
  speed_ddr: number | null; // DDR version (4, 5, etc.)
  speed_mhz: number | null; // MHz
  // Flattened from modules: [count, size] array  
  module_count: number | null; // Number of modules
  module_size: number | null; // GB per module
  total_capacity?: number; // Computed: module_count * module_size
  price_per_gb: number | null;
  color: string | null;
  first_word_latency: number | null;
  cas_latency: number | null;
  created_at?: string;
}

// Storage Table (from internal-hard-drive.json)
export interface Storage {
  id: string;
  name: string;
  price: number | null;
  capacity: number; // GB
  price_per_gb: number | null;
  type: string; // "SSD" or RPM number for HDD
  cache: number | null; // MB
  form_factor: string | null; // M.2-xxxx or inch size
  interface: string | null;
  created_at?: string;
}

// PSU Table (from power-supply.json)
export interface PSU {
  id: string;
  name: string;
  price: number | null;
  type: string | null; // ATX, SFX, etc.
  efficiency: string | null; // plus, bronze, silver, gold, platinum, titanium
  wattage: number;
  modular: string | null; // Full, Semi, or false
  color: string | null;
  created_at?: string;
}

// Case Table (from case.json)
export interface Case {
  id: string;
  name: string;
  price: number | null;
  type: string | null; // ATX, mATX, etc.
  color: string | null;
  psu: number | null; // Included PSU wattage
  side_panel: string | null;
  external_volume: number | null; // Liters
  internal_35_bays: number | null;
  created_at?: string;
}

// CPU Cooler Table (from cpu-cooler.json)
// Note: In DB, rpm and noise_level are flattened to min/max columns
export interface CPUCooler {
  id: string;
  name: string;
  price: number | null;
  rpm_min: number | null;
  rpm_max: number | null;
  noise_level_min: number | null; // dB
  noise_level_max: number | null; // dB
  color: string | null;
  size: number | null; // Radiator size in mm (for AIOs)
  created_at?: string;
}

// Build Configuration
export interface Build {
  id: string;
  user_id?: string;
  name: string;
  cpu_id?: string;
  gpu_id?: string;
  motherboard_id?: string;
  memory_id?: string;
  storage_id?: string;
  case_id?: string;
  psu_id?: string;
  cooler_id?: string;
  total_price: number | null;
  predicted_fps: number | null;
  bottleneck_component: string | null;
  created_at?: string;
  updated_at?: string;
}

// Populated Build (with full part details)
export interface PopulatedBuild extends Omit<Build, 'cpu_id' | 'gpu_id' | 'motherboard_id' | 'memory_id' | 'storage_id' | 'psu_id' | 'case_id' | 'cooler_id'> {
  cpu?: CPU;
  gpu?: GPU;
  motherboard?: Motherboard;
  memory?: RAM;
  storage?: Storage;
  psu?: PSU;
  case?: Case;
  cooler?: CPUCooler;
}

// ML Engine Types
export interface FPSPrediction {
  predicted_fps: number;
  bottleneck_component: string;
  bottleneck_severity: "none" | "minor" | "moderate" | "severe";
  recommendation: string;
}

export interface ValueTierResult {
  tier: "budget" | "midrange" | "highend" | "enthusiast";
  value_score: number;
  similar_parts: string[];
}

export interface EcosystemComparison {
  your_build: {
    price: number;
    fps_1080p: number;
    value_score: number;
  };
  comparisons: {
    system: string;
    price: number;
    fps_1080p: number;
    your_value_vs_system: number;
    recommendation: string;
  }[];
  best_value_alternative: string | null;
}

// Part Category Union Type
export type PCPart = CPU | GPU | Motherboard | RAM | Storage | PSU | Case | CPUCooler;
export type PartCategory = "cpu" | "gpu" | "motherboard" | "ram" | "storage" | "psu" | "case" | "cooler";

// Helper type for part list display with unified properties
export interface PartListItem {
  id: string;
  name: string;
  price: number | null;
  specs: string;
  benchmarkScore?: number;
}
