"use server";

/**
 * Server Actions for fetching PC parts from Supabase
 * These run on the server and can be called directly from components
 */

import { createClient } from "@supabase/supabase-js";
import type { CPU, GPU, Motherboard, RAM, Storage, PSU, Case, CPUCooler, PartCategory } from "@/lib/types/database";

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

// Create server-side Supabase client
function getServerSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!url || !key) {
    throw new Error("Supabase environment variables not configured");
  }
  
  return createClient(url, key);
}

// Result type for parts queries
export interface PartsResult<T> {
  data: T[];
  error: string | null;
  count: number;
}

// Stats for the homepage
export interface DatabaseStats {
  totalParts: number;
  categories: { name: string; count: number; avgPrice: number }[];
  topCpus: CPU[];
  topGpus: GPU[];
}

/**
 * Fetch parts by category with optional filters
 */
export async function getPartsByCategory<T>(
  category: PartCategory,
  options?: {
    limit?: number;
    offset?: number;
    orderBy?: string;
    ascending?: boolean;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
  }
): Promise<PartsResult<T>> {
  const {
    limit = 50,
    offset = 0,
    orderBy = "price",
    ascending = true,
    search,
    minPrice,
    maxPrice,
  } = options || {};

  try {
    const supabase = getServerSupabase();
    const tableName = TABLE_MAP[category];

    let query = supabase
      .from(tableName)
      .select("*", { count: "exact" })
      .not("price", "is", null)
      .gt("price", 0)
      .order(orderBy, { ascending })
      .range(offset, offset + limit - 1);

    if (search) {
      query = query.ilike("name", `%${search}%`);
    }

    if (minPrice !== undefined) {
      query = query.gte("price", minPrice);
    }

    if (maxPrice !== undefined) {
      query = query.lte("price", maxPrice);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error(`[ServerAction] Error fetching ${category}:`, error);
      return { data: [], error: error.message, count: 0 };
    }

    return {
      data: (data as T[]) || [],
      error: null,
      count: count || 0,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error(`[ServerAction] Failed to fetch ${category}:`, message);
    return { data: [], error: message, count: 0 };
  }
}

/**
 * Get database statistics for homepage
 */
export async function getDatabaseStats(): Promise<DatabaseStats | null> {
  try {
    const supabase = getServerSupabase();

    // Fetch counts and averages for each category
    const categoryPromises = Object.entries(TABLE_MAP).map(async ([category, table]) => {
      const { count, data } = await supabase
        .from(table)
        .select("price", { count: "exact" })
        .not("price", "is", null)
        .gt("price", 0);

      const prices = data?.map((d) => d.price).filter(Boolean) || [];
      const avgPrice = prices.length > 0 
        ? prices.reduce((a, b) => a + b, 0) / prices.length 
        : 0;

      return {
        name: category,
        count: count || 0,
        avgPrice: Math.round(avgPrice),
      };
    });

    const categories = await Promise.all(categoryPromises);
    const totalParts = categories.reduce((sum, c) => sum + c.count, 0);

    // Fetch top CPUs by benchmark
    const { data: topCpus } = await supabase
      .from("cpus")
      .select("*")
      .not("price", "is", null)
      .gt("price", 0)
      .order("benchmark_score", { ascending: false })
      .limit(3);

    // Fetch top GPUs by benchmark
    const { data: topGpus } = await supabase
      .from("gpus")
      .select("*")
      .not("price", "is", null)
      .gt("price", 0)
      .order("benchmark_score", { ascending: false })
      .limit(3);

    return {
      totalParts,
      categories,
      topCpus: (topCpus as CPU[]) || [],
      topGpus: (topGpus as GPU[]) || [],
    };
  } catch (error) {
    console.error("[ServerAction] Failed to fetch database stats:", error);
    return null;
  }
}

/**
 * Search parts across all categories
 */
export async function searchAllParts(query: string, limit: number = 10) {
  const supabase = getServerSupabase();
  const results: { category: PartCategory; parts: { id: string; name: string; price: number }[] }[] = [];

  for (const [category, table] of Object.entries(TABLE_MAP)) {
    const { data } = await supabase
      .from(table)
      .select("id, name, price")
      .not("price", "is", null)
      .ilike("name", `%${query}%`)
      .limit(limit);

    if (data && data.length > 0) {
      results.push({
        category: category as PartCategory,
        parts: data,
      });
    }
  }

  return results;
}

/**
 * Get featured parts for homepage display
 */
export async function getFeaturedParts() {
  try {
    const supabase = getServerSupabase();

    // Get best value CPU (high benchmark, reasonable price)
    const { data: cpus } = await supabase
      .from("cpus")
      .select("*")
      .not("price", "is", null)
      .gt("price", 0)
      .lte("price", 500)
      .order("benchmark_score", { ascending: false })
      .limit(4);

    // Get best value GPU
    const { data: gpus } = await supabase
      .from("gpus")
      .select("*")
      .not("price", "is", null)
      .gt("price", 0)
      .lte("price", 800)
      .order("benchmark_score", { ascending: false })
      .limit(4);

    return {
      cpus: (cpus as CPU[]) || [],
      gpus: (gpus as GPU[]) || [],
    };
  } catch (error) {
    console.error("[ServerAction] Failed to fetch featured parts:", error);
    return { cpus: [], gpus: [] };
  }
}
