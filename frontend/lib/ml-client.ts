export interface BuildSpecs {
    cpu_benchmark: number;
    gpu_benchmark: number;
    ram_gb: number;
    ram_speed: number;
    storage_type: "ssd" | "hdd" | "nvme";
    target_resolution: "1080p" | "1440p" | "4k";
    // Integrity Inputs
    cpu_tdp: number;
    gpu_tdp: number;
    psu_wattage: number;
    psu_efficiency: string;
    mobo_chipset: string;
    cpu_clock: number;
}

export interface FPSPrediction {
    predicted_fps: number;
    bottleneck_component: string;
    bottleneck_severity: "none" | "minor" | "moderate" | "severe";
    recommendation: string;
    // Integrity Outputs
    integrity_score: number;
    integrity_status: string;
    integrity_warnings: string[];
    integrity_notes: string[];
}

export interface ValueTierResult {
    tier: string;
    value_score: number;
    similar_parts: string[];
}

const ML_API_URL = "http://localhost:8000";

export const mlClient = {
    async predictFPS(specs: BuildSpecs): Promise<FPSPrediction> {
        try {
            const response = await fetch(`${ML_API_URL}/predict/fps`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(specs),
            });

            if (!response.ok) throw new Error("ML Engine unavailable");
            return await response.json();
        } catch (error) {
            console.error("ML Prediction Error:", error);
            // Return fallback data if ML engine is down so UI doesn't crash
            return {
                predicted_fps: 0,
                bottleneck_component: "Unknown",
                bottleneck_severity: "none",
                recommendation: "Ensure ML Engine backend is running on port 8000.",
                integrity_score: 0,
                integrity_status: "Unknown",
                integrity_warnings: [],
                integrity_notes: [],
            };
        }
    },

    async checkHealth(): Promise<boolean> {
        try {
            const response = await fetch(`${ML_API_URL}/`);
            return response.ok;
        } catch {
            return false;
        }
    }
};
