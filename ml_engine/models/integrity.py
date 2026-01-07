"""
Build Integrity Calculator
Uses heuristics to evaluate the balance and reliability of the build.
"""

class IntegrityAnalyzer:
    def __init__(self):
        self.is_loaded = True

    def analyze(
        self,
        cpu_tdp: float,
        gpu_tdp: float,
        psu_wattage: float,
        psu_efficiency: str,
        mobo_chipset: str,
        cpu_clock: float
    ) -> dict:
        """
        Analyze build integrity.
        Returns score (0-100) and list of warnings.
        """
        score = 100
        warnings = []
        positive_notes = []

        # 1. Power Supply Analysis
        estimated_wattage = cpu_tdp + gpu_tdp + 50  # +50W for other parts
        recommended_wattage = estimated_wattage * 1.25 # 25% headroom desirable

        if psu_wattage < estimated_wattage:
            score -= 40
            warnings.append(f"DANGER: PSU {psu_wattage}W is below system load ({int(estimated_wattage)}W)")
        elif psu_wattage < recommended_wattage:
            score -= 10
            warnings.append(f"PSU headroom is tight. Recommended: {int(recommended_wattage)}W+")
        else:
            positive_notes.append("Healthy PSU headroom")

        # Efficiency penalty
        if "gold" not in psu_efficiency.lower() and "platinum" not in psu_efficiency.lower():
             # Minor penalty for non-gold units in high-end builds
             if estimated_wattage > 400:
                 score -= 5
                 warnings.append("Consider Gold/Platinum PSU for efficiency at this wattage")

        # 2. Motherboard Tier Analysis (Simple Heuristic mapping)
        # Assuming chipsets: A(Entry), B(Mid), Z/X(High)
        mobo_tier = "entry"
        if "z" in mobo_chipset.lower() or "x" in mobo_chipset.lower(): mobo_tier = "high"
        elif "b" in mobo_chipset.lower() or "h" in mobo_chipset.lower(): mobo_tier = "mid"
        
        cpu_tier = "mid"
        if cpu_clock > 4.5 or cpu_tdp > 100: cpu_tier = "high"
        elif cpu_tdp < 65: cpu_tier = "entry"

        if cpu_tier == "high" and mobo_tier == "entry":
            score -= 15
            warnings.append("High-end CPU on Entry-level Motherboard (VRM throttling risk)")
        elif cpu_tier == "entry" and mobo_tier == "high":
            # No stability penalty, but value warning
            warnings.append("Overkill motherboard for this CPU (Value warning)")

        if score < 0: score = 0
        
        status = "Solid"
        if score < 60: status = "Unstable"
        elif score < 80: status = "Acceptable"
        elif score >= 90: status = "Excellent"

        return {
            "score": score,
            "status": status,
            "warnings": warnings,
            "notes": positive_notes
        }
