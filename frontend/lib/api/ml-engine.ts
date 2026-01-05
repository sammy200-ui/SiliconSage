/**
 * ML Engine API Client
 * Connects to the FastAPI backend for ML predictions
 */

import type { FPSPrediction, ValueTierResult, EcosystemComparison } from "../types/database";

const ML_ENGINE_URL = process.env.NEXT_PUBLIC_ML_ENGINE_URL || "http://localhost:8000";

interface BuildSpecs {
  cpu_benchmark: number;
  gpu_benchmark: number;
  ram_gb: number;
  ram_speed: number;
  storage_type: "hdd" | "ssd" | "nvme";
  target_resolution: "1080p" | "1440p" | "4k";
}

interface PartSpec {
  name: string;
  price: number;
  benchmark_score: number;
  category: string;
}

class MLEngineClient {
  private baseUrl: string;

  constructor(baseUrl: string = ML_ENGINE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Check if the ML Engine is healthy and models are loaded
   */
  async healthCheck(): Promise<{ status: string; ml_models_loaded: boolean; version: string }> {
    const response = await fetch(`${this.baseUrl}/`);
    if (!response.ok) {
      throw new Error(`ML Engine health check failed: ${response.statusText}`);
    }
    return response.json();
  }

  /**
   * Predict FPS and detect bottlenecks for a build
   */
  async predictFPS(specs: BuildSpecs): Promise<FPSPrediction> {
    const response = await fetch(`${this.baseUrl}/predict/fps`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(specs),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Failed to predict FPS");
    }

    return response.json();
  }

  /**
   * Analyze a part's value tier
   */
  async analyzeValueTier(part: PartSpec): Promise<ValueTierResult> {
    const response = await fetch(`${this.baseUrl}/analyze/value-tier`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(part),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Failed to analyze value tier");
    }

    return response.json();
  }

  /**
   * Compare build against consoles and gaming laptops
   */
  async compareEcosystem(buildPrice: number, buildFps1080p: number): Promise<EcosystemComparison> {
    const params = new URLSearchParams({
      build_price: buildPrice.toString(),
      build_fps_1080p: buildFps1080p.toString(),
    });

    const response = await fetch(`${this.baseUrl}/ecosystem/compare?${params}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Failed to compare ecosystem");
    }

    return response.json();
  }
}

// Export singleton instance
export const mlEngine = new MLEngineClient();

// Export class for custom instances
export { MLEngineClient };
export type { BuildSpecs, PartSpec };
