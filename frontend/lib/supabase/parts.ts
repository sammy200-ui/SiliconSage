/**
 * Supabase Parts Service
 * Fetches PC parts from Supabase database with fallback to sample data
 */

import { getSupabase, isSupabaseConfigured } from "./client";
import type { CPU, GPU, Motherboard, RAM, Storage, PSU, Case, CPUCooler, PartCategory } from "../types/database";

// Base part interface for common properties
interface BasePart {
  id: string;
  name: string;
  price: number | null;
  benchmark_score?: number;
}

// Table name mapping
const TABLE_MAP: Record<PartCategory, string> = {
  cpu: "cpus",
  gpu: "gpus",
  motherboard: "motherboards",
  ram: "memory",
  storage: "storage",
  psu: "power_supplies",
  case: "cases",
  cooler: "cpu_coolers",
};

// Fallback sample data when Supabase is not configured
export const SAMPLE_PARTS = {
  cpu: [
    { id: "1", name: "AMD Ryzen 7 9800X3D", price: 451.5, core_count: 8, core_clock: 4.7, boost_clock: 5.2, microarchitecture: "Zen 5", tdp: 120, graphics: "Radeon", benchmark_score: 35000 },
    { id: "2", name: "AMD Ryzen 7 7800X3D", price: 340.05, core_count: 8, core_clock: 4.2, boost_clock: 5.0, microarchitecture: "Zen 4", tdp: 120, graphics: "Radeon", benchmark_score: 32000 },
    { id: "3", name: "AMD Ryzen 5 7600X", price: 170.49, core_count: 6, core_clock: 4.7, boost_clock: 5.3, microarchitecture: "Zen 4", tdp: 105, graphics: "Radeon", benchmark_score: 22000 },
    { id: "4", name: "Intel Core i5-14600K", price: 199.99, core_count: 14, core_clock: 3.5, boost_clock: 5.3, microarchitecture: "Raptor Lake Refresh", tdp: 125, graphics: "Intel UHD Graphics 770", benchmark_score: 28000 },
    { id: "5", name: "Intel Core i7-13700K", price: 390.33, core_count: 16, core_clock: 3.4, boost_clock: 5.4, microarchitecture: "Raptor Lake", tdp: 125, graphics: "Intel UHD Graphics 770", benchmark_score: 35000 },
    { id: "6", name: "AMD Ryzen 5 5600", price: 74.22, core_count: 6, core_clock: 3.6, boost_clock: 4.2, microarchitecture: "Zen 3", tdp: 65, graphics: null, benchmark_score: 15000 },
    { id: "7", name: "Intel Core i5-12400F", price: 129.99, core_count: 6, core_clock: 2.5, boost_clock: 4.4, microarchitecture: "Alder Lake", tdp: 65, graphics: null, benchmark_score: 17500 },
    { id: "8", name: "AMD Ryzen 9 7950X", price: 449.96, core_count: 16, core_clock: 4.5, boost_clock: 5.7, microarchitecture: "Zen 4", tdp: 170, graphics: "Radeon", benchmark_score: 45000 },
  ] as CPU[],
  gpu: [
    { id: "1", name: "MSI GAMING TRIO", price: 359.99, chipset: "GeForce RTX 4060", memory: 8, core_clock: 2280, boost_clock: 2640, color: "Black", length: 248, benchmark_score: 18000 },
    { id: "2", name: "Sapphire PULSE", price: 327.12, chipset: "Radeon RX 6600", memory: 8, core_clock: 1626, boost_clock: 2491, color: "Black / Red", length: 193, benchmark_score: 14000 },
    { id: "3", name: "NVIDIA RTX 4070 Super", price: 599, chipset: "GeForce RTX 4070 SUPER", memory: 12, core_clock: 1980, boost_clock: 2475, color: "Black", length: 304, benchmark_score: 28000 },
    { id: "4", name: "AMD RX 7700 XT", price: 449, chipset: "Radeon RX 7700 XT", memory: 12, core_clock: 1900, boost_clock: 2544, color: "Black", length: 267, benchmark_score: 24000 },
    { id: "5", name: "ASUS ROG STRIX", price: 1599.99, chipset: "GeForce RTX 4090", memory: 24, core_clock: 2235, boost_clock: 2640, color: "White", length: 358, benchmark_score: 55000 },
    { id: "6", name: "XFX Speedster MERC", price: 989, chipset: "Radeon RX 6800", memory: 16, core_clock: 1700, boost_clock: 2105, color: "Black", length: 340, benchmark_score: 20000 },
    { id: "7", name: "EVGA RTX 3070", price: 450, chipset: "GeForce RTX 3070", memory: 8, core_clock: 1500, boost_clock: 1725, color: "Black", length: 285, benchmark_score: 22000 },
    { id: "8", name: "Intel Arc A770", price: 289, chipset: "Arc A770", memory: 16, core_clock: 2100, boost_clock: 2400, color: "Black", length: 267, benchmark_score: 16000 },
  ] as GPU[],
  motherboard: [
    { id: "1", name: "MSI PRO B660M-A", price: 119, socket: "LGA1700", form_factor: "Micro ATX", max_memory: 64, memory_slots: 2, color: "Black" },
    { id: "2", name: "ASUS ROG STRIX B550-F", price: 179, socket: "AM4", form_factor: "ATX", max_memory: 128, memory_slots: 4, color: "Black" },
    { id: "3", name: "Gigabyte B650 AORUS Elite", price: 199, socket: "AM5", form_factor: "ATX", max_memory: 128, memory_slots: 4, color: "Black" },
    { id: "4", name: "MSI MAG Z790 TOMAHAWK", price: 289, socket: "LGA1700", form_factor: "ATX", max_memory: 128, memory_slots: 4, color: "Black" },
    { id: "5", name: "ASUS ROG STRIX X670E-E", price: 449, socket: "AM5", form_factor: "ATX", max_memory: 128, memory_slots: 4, color: "Black" },
    { id: "6", name: "ASRock B450M Pro4", price: 79, socket: "AM4", form_factor: "Micro ATX", max_memory: 64, memory_slots: 4, color: "Black" },
  ] as Motherboard[],
  ram: [
    { id: "1", name: "Corsair Vengeance LPX 16GB", price: 45, speed_ddr: 4, speed_mhz: 3200, module_count: 2, module_size: 8, total_capacity: 16, price_per_gb: 2.81, color: "Black", first_word_latency: 10, cas_latency: 16 },
    { id: "2", name: "G.Skill Ripjaws V 32GB", price: 79, speed_ddr: 4, speed_mhz: 3600, module_count: 2, module_size: 16, total_capacity: 32, price_per_gb: 2.47, color: "Black", first_word_latency: 10, cas_latency: 18 },
    { id: "3", name: "Kingston Fury Beast 32GB DDR5", price: 119, speed_ddr: 5, speed_mhz: 5600, module_count: 2, module_size: 16, total_capacity: 32, price_per_gb: 3.72, color: "Black", first_word_latency: 6.43, cas_latency: 36 },
    { id: "4", name: "G.Skill Trident Z5 RGB 64GB", price: 249, speed_ddr: 5, speed_mhz: 6400, module_count: 2, module_size: 32, total_capacity: 64, price_per_gb: 3.89, color: "Black", first_word_latency: 5, cas_latency: 32 },
    { id: "5", name: "TeamGroup T-Force Delta RGB 16GB", price: 55, speed_ddr: 4, speed_mhz: 3200, module_count: 2, module_size: 8, total_capacity: 16, price_per_gb: 3.44, color: "White", first_word_latency: 10, cas_latency: 16 },
  ] as RAM[],
  storage: [
    { id: "1", name: "Kingston A400 480GB", price: 35, capacity: 480, price_per_gb: 0.073, type: "SSD", cache: null, form_factor: "2.5", interface: "SATA III" },
    { id: "2", name: "Samsung 970 EVO Plus 1TB", price: 89, capacity: 1000, price_per_gb: 0.089, type: "SSD", cache: null, form_factor: "M.2-2280", interface: "PCIe 3.0 x4" },
    { id: "3", name: "WD Black SN850X 2TB", price: 169, capacity: 2000, price_per_gb: 0.085, type: "SSD", cache: null, form_factor: "M.2-2280", interface: "PCIe 4.0 x4" },
    { id: "4", name: "Seagate Barracuda 2TB HDD", price: 55, capacity: 2000, price_per_gb: 0.0275, type: "7200", cache: 256, form_factor: "3.5", interface: "SATA III" },
    { id: "5", name: "Samsung 990 Pro 4TB", price: 349, capacity: 4000, price_per_gb: 0.087, type: "SSD", cache: null, form_factor: "M.2-2280", interface: "PCIe 4.0 x4" },
  ] as Storage[],
  psu: [
    { id: "1", name: "EVGA 500 W1", price: 45, type: "ATX", efficiency: "plus", wattage: 500, modular: "No", color: "Black" },
    { id: "2", name: "Corsair CX650M", price: 79, type: "ATX", efficiency: "bronze", wattage: 650, modular: "Semi", color: "Black" },
    { id: "3", name: "Seasonic Focus GX-750", price: 109, type: "ATX", efficiency: "gold", wattage: 750, modular: "Full", color: "Black" },
    { id: "4", name: "Corsair RM1000x", price: 189, type: "ATX", efficiency: "gold", wattage: 1000, modular: "Full", color: "Black" },
    { id: "5", name: "be quiet! Straight Power 12 850W", price: 159, type: "ATX", efficiency: "platinum", wattage: 850, modular: "Full", color: "Black" },
  ] as PSU[],
  case: [
    { id: "1", name: "NZXT H510", price: 79, type: "ATX Mid Tower", color: "Black", psu: null, side_panel: "Tempered Glass", external_volume: 46.5, internal_35_bays: 2 },
    { id: "2", name: "Fractal Design Meshify C", price: 109, type: "ATX Mid Tower", color: "Black", psu: null, side_panel: "Tempered Glass", external_volume: 45.6, internal_35_bays: 2 },
    { id: "3", name: "Lian Li O11 Dynamic", price: 149, type: "ATX Mid Tower", color: "Black", psu: null, side_panel: "Tempered Glass", external_volume: 53.5, internal_35_bays: 2 },
    { id: "4", name: "Corsair 4000D Airflow", price: 94, type: "ATX Mid Tower", color: "Black", psu: null, side_panel: "Tempered Glass", external_volume: 48.6, internal_35_bays: 2 },
    { id: "5", name: "Phanteks Eclipse P400A", price: 89, type: "ATX Mid Tower", color: "Black", psu: null, side_panel: "Tempered Glass", external_volume: 47.2, internal_35_bays: 2 },
  ] as Case[],
  cooler: [
    { id: "1", name: "Cooler Master Hyper 212", price: 35, rpm_min: 650, rpm_max: 2000, noise_level_min: 8, noise_level_max: 26, color: "Black", size: null },
    { id: "2", name: "Noctua NH-D15", price: 99, rpm_min: 300, rpm_max: 1500, noise_level_min: 19, noise_level_max: 24, color: "Brown / Beige", size: null },
    { id: "3", name: "NZXT Kraken X63", price: 149, rpm_min: 500, rpm_max: 1800, noise_level_min: 21, noise_level_max: 36, color: "Black", size: 280 },
    { id: "4", name: "Corsair iCUE H150i Elite", price: 189, rpm_min: 400, rpm_max: 2400, noise_level_min: 10, noise_level_max: 37, color: "Black", size: 360 },
    { id: "5", name: "DeepCool AK620", price: 69, rpm_min: 500, rpm_max: 1850, noise_level_min: 28, noise_level_max: 28, color: "Black", size: null },
  ] as CPUCooler[],
};

export type PartsData = typeof SAMPLE_PARTS;

/**
 * Fetch parts from Supabase with fallback to sample data
 */
export async function fetchParts<T>(
  category: PartCategory,
  options?: {
    limit?: number;
    orderBy?: string;
    ascending?: boolean;
    search?: string;
  }
): Promise<T[]> {
  const { limit = 100, orderBy = "price", ascending = true, search } = options || {};
  
  const supabase = getSupabase();
  
  // If Supabase is not configured, return sample data
  if (!isSupabaseConfigured() || !supabase) {
    console.log(`[Parts] Using sample data for ${category} (Supabase not configured)`);
    const parts = SAMPLE_PARTS[category] as T[];
    
    if (search) {
      return parts.filter((p) => 
        (p as BasePart).name.toLowerCase().includes(search.toLowerCase())
      );
    }
    return parts;
  }

  try {
    const tableName = TABLE_MAP[category];
    let query = supabase
      .from(tableName)
      .select("*")
      .not("price", "is", null)
      .order(orderBy, { ascending })
      .limit(limit);

    if (search) {
      query = query.ilike("name", `%${search}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error(`[Parts] Supabase error for ${category}:`, error);
      return SAMPLE_PARTS[category] as T[];
    }

    return (data as T[]) || [];
  } catch (error) {
    console.error(`[Parts] Failed to fetch ${category}:`, error);
    return SAMPLE_PARTS[category] as T[];
  }
}

/**
 * Fetch a single part by ID
 */
export async function fetchPartById<T>(
  category: PartCategory,
  id: string
): Promise<T | null> {
  const supabase = getSupabase();
  
  if (!isSupabaseConfigured() || !supabase) {
    const parts = SAMPLE_PARTS[category];
    return (parts.find((p) => (p as BasePart).id === id) as T) || null;
  }

  try {
    const tableName = TABLE_MAP[category];
    const { data, error } = await supabase
      .from(tableName)
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error(`[Parts] Error fetching ${category} by ID:`, error);
      return null;
    }

    return data as T;
  } catch (error) {
    console.error(`[Parts] Failed to fetch ${category} by ID:`, error);
    return null;
  }
}

/**
 * Get recommended parts based on budget and preferences
 */
export async function getRecommendedParts(
  category: PartCategory,
  budget: number,
  limit: number = 5
): Promise<BasePart[]> {
  const parts = await fetchParts<BasePart>(category, { limit: 100, orderBy: "price" });
  
  // Filter parts within budget and sort by benchmark if available
  return parts
    .filter((p: BasePart) => p.price && p.price <= budget)
    .sort((a: BasePart, b: BasePart) => {
      const aScore = a.benchmark_score || a.price || 0;
      const bScore = b.benchmark_score || b.price || 0;
      return bScore - aScore; // Best value first
    })
    .slice(0, limit);
}
