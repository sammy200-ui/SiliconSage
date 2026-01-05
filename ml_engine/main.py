"""
SiliconSage ML Engine - FastAPI Backend
The Brain of the PC Building Value Optimization Engine
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import uvicorn

from models.bottleneck import BottleneckCalculator
from models.value_tier import ValueTierClusterer

app = FastAPI(
    title="SiliconSage ML Engine",
    description="AI-Powered PC Part Value Optimization API",
    version="1.0.0"
)

# CORS middleware for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize ML models
bottleneck_calculator = BottleneckCalculator()
value_clusterer = ValueTierClusterer()


# Request/Response Models
class BuildSpecs(BaseModel):
    cpu_benchmark: float  # PassMark or similar score
    gpu_benchmark: float  # 3DMark or similar score
    ram_gb: int
    ram_speed: int  # MHz
    storage_type: str  # "ssd" or "hdd"
    target_resolution: str  # "1080p", "1440p", "4k"


class PartSpec(BaseModel):
    name: str
    price: float
    benchmark_score: float
    category: str  # "cpu", "gpu", "ram", etc.


class FPSPrediction(BaseModel):
    predicted_fps: float
    bottleneck_component: str
    bottleneck_severity: str  # "none", "minor", "moderate", "severe"
    recommendation: str


class ValueTierResult(BaseModel):
    tier: str  # "budget", "midrange", "highend", "enthusiast"
    value_score: float  # 0-100
    similar_parts: list[str]


class HealthCheck(BaseModel):
    status: str
    ml_models_loaded: bool
    version: str


# API Endpoints
@app.get("/", response_model=HealthCheck)
async def root():
    """Health check endpoint"""
    return HealthCheck(
        status="healthy",
        ml_models_loaded=bottleneck_calculator.is_loaded and value_clusterer.is_loaded,
        version="1.0.0"
    )


@app.post("/predict/fps", response_model=FPSPrediction)
async def predict_fps(specs: BuildSpecs):
    """
    Predict FPS and detect bottlenecks based on build specifications.
    Uses RandomForestRegressor trained on benchmark data.
    """
    try:
        result = bottleneck_calculator.predict(
            cpu_score=specs.cpu_benchmark,
            gpu_score=specs.gpu_benchmark,
            ram_gb=specs.ram_gb,
            ram_speed=specs.ram_speed,
            storage_type=specs.storage_type,
            resolution=specs.target_resolution
        )
        return FPSPrediction(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/analyze/value-tier", response_model=ValueTierResult)
async def analyze_value_tier(part: PartSpec):
    """
    Analyze a part's value tier using K-Means clustering.
    Returns the tier and similar parts for upsell/downsell suggestions.
    """
    try:
        result = value_clusterer.analyze(
            name=part.name,
            price=part.price,
            benchmark=part.benchmark_score,
            category=part.category
        )
        return ValueTierResult(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/ecosystem/compare")
async def compare_ecosystem(build_price: float, build_fps_1080p: float):
    """
    Compare a custom PC build against consoles and gaming laptops.
    Returns value analysis and recommendations.
    """
    # Reference prices and performance (as of 2026)
    comparisons = {
        "ps5": {"price": 499, "fps_1080p": 60, "name": "PlayStation 5"},
        "xbox_series_x": {"price": 499, "fps_1080p": 60, "name": "Xbox Series X"},
        "steam_deck_oled": {"price": 549, "fps_1080p": 40, "name": "Steam Deck OLED"},
        "budget_gaming_laptop": {"price": 799, "fps_1080p": 60, "name": "Budget Gaming Laptop"},
        "midrange_gaming_laptop": {"price": 1299, "fps_1080p": 100, "name": "Mid-Range Gaming Laptop"},
    }
    
    # Calculate value scores (FPS per dollar)
    build_value = build_fps_1080p / build_price if build_price > 0 else 0
    
    results = []
    for key, system in comparisons.items():
        system_value = system["fps_1080p"] / system["price"]
        value_diff = ((build_value - system_value) / system_value) * 100 if system_value > 0 else 0
        
        results.append({
            "system": system["name"],
            "price": system["price"],
            "fps_1080p": system["fps_1080p"],
            "your_value_vs_system": round(value_diff, 1),
            "recommendation": "Your build is better value" if value_diff > 10 else 
                            "Similar value" if value_diff > -10 else 
                            f"Consider {system['name']} instead"
        })
    
    return {
        "your_build": {"price": build_price, "fps_1080p": build_fps_1080p, "value_score": round(build_value * 100, 2)},
        "comparisons": results,
        "best_value_alternative": min(results, key=lambda x: x["your_value_vs_system"])["system"] if build_value < 0.12 else None
    }


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
