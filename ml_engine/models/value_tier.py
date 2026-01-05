"""
Value Tier Clusterer Model
Uses K-Means to cluster parts into value tiers for smart recommendations
"""

import numpy as np
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
import joblib
import os


class ValueTierClusterer:
    def __init__(self):
        self.model: KMeans | None = None
        self.scaler = StandardScaler()
        self.is_loaded = False
        self.tier_labels = ["budget", "midrange", "highend", "enthusiast"]
        
        # Sample parts database for similarity matching
        self.parts_db: dict[str, list[dict]] = {
            "cpu": [],
            "gpu": [],
            "ram": [],
            "storage": [],
            "motherboard": [],
            "psu": [],
            "case": []
        }
        
        self._initialize_model()
    
    def _initialize_model(self):
        """Initialize or load the clustering model"""
        model_path = os.path.join(os.path.dirname(__file__), "value_tier_model.joblib")
        
        if os.path.exists(model_path):
            try:
                data = joblib.load(model_path)
                self.model = data["model"]
                self.scaler = data["scaler"]
                self.parts_db = data.get("parts_db", self.parts_db)
                self.is_loaded = True
                return
            except Exception:
                pass
        
        # Initialize with synthetic data
        self._train_synthetic()
    
    def _train_synthetic(self):
        """Train with synthetic value tier data"""
        np.random.seed(42)
        
        # Generate parts across 4 tiers
        parts_data = []
        
        # Budget tier: Low price, decent performance
        for _ in range(100):
            price = np.random.uniform(50, 200)
            benchmark = np.random.uniform(3000, 8000)
            parts_data.append([price, benchmark, benchmark / price])
        
        # Midrange tier: Moderate price, good performance
        for _ in range(100):
            price = np.random.uniform(200, 400)
            benchmark = np.random.uniform(8000, 18000)
            parts_data.append([price, benchmark, benchmark / price])
        
        # High-end tier: High price, great performance
        for _ in range(100):
            price = np.random.uniform(400, 800)
            benchmark = np.random.uniform(18000, 30000)
            parts_data.append([price, benchmark, benchmark / price])
        
        # Enthusiast tier: Premium price, top performance
        for _ in range(100):
            price = np.random.uniform(800, 2000)
            benchmark = np.random.uniform(28000, 50000)
            parts_data.append([price, benchmark, benchmark / price])
        
        X = np.array(parts_data)
        
        # Fit scaler
        X_scaled = self.scaler.fit_transform(X)
        
        # Train K-Means with 4 clusters
        self.model = KMeans(n_clusters=4, random_state=42, n_init=10)
        self.model.fit(X_scaled)
        
        # Populate sample parts database
        self._populate_sample_parts()
        
        self.is_loaded = True
        
        # Save model
        try:
            model_path = os.path.join(os.path.dirname(__file__), "value_tier_model.joblib")
            joblib.dump({
                "model": self.model,
                "scaler": self.scaler,
                "parts_db": self.parts_db
            }, model_path)
        except Exception:
            pass
    
    def _populate_sample_parts(self):
        """Populate sample parts for similarity matching"""
        self.parts_db = {
            "cpu": [
                {"name": "Intel Core i3-12100F", "price": 109, "benchmark": 9500, "tier": "budget"},
                {"name": "AMD Ryzen 5 5600", "price": 149, "benchmark": 15000, "tier": "budget"},
                {"name": "Intel Core i5-12400F", "price": 179, "benchmark": 17500, "tier": "midrange"},
                {"name": "AMD Ryzen 5 7600X", "price": 249, "benchmark": 22000, "tier": "midrange"},
                {"name": "Intel Core i7-13700K", "price": 409, "benchmark": 35000, "tier": "highend"},
                {"name": "AMD Ryzen 7 7800X3D", "price": 449, "benchmark": 34000, "tier": "highend"},
                {"name": "Intel Core i9-14900K", "price": 589, "benchmark": 45000, "tier": "enthusiast"},
                {"name": "AMD Ryzen 9 7950X3D", "price": 699, "benchmark": 48000, "tier": "enthusiast"},
            ],
            "gpu": [
                {"name": "Intel Arc A580", "price": 179, "benchmark": 8500, "tier": "budget"},
                {"name": "AMD RX 6650 XT", "price": 239, "benchmark": 11000, "tier": "budget"},
                {"name": "NVIDIA RTX 4060", "price": 299, "benchmark": 13000, "tier": "midrange"},
                {"name": "AMD RX 7700 XT", "price": 449, "benchmark": 18000, "tier": "midrange"},
                {"name": "NVIDIA RTX 4070 Super", "price": 599, "benchmark": 22000, "tier": "highend"},
                {"name": "AMD RX 7900 XT", "price": 699, "benchmark": 24000, "tier": "highend"},
                {"name": "NVIDIA RTX 4080 Super", "price": 999, "benchmark": 28000, "tier": "enthusiast"},
                {"name": "NVIDIA RTX 4090", "price": 1599, "benchmark": 36000, "tier": "enthusiast"},
            ],
            "ram": [
                {"name": "Corsair Vengeance 16GB DDR4-3200", "price": 45, "benchmark": 3200, "tier": "budget"},
                {"name": "G.Skill Ripjaws 32GB DDR4-3600", "price": 79, "benchmark": 3600, "tier": "midrange"},
                {"name": "Kingston Fury 32GB DDR5-5600", "price": 119, "benchmark": 5600, "tier": "highend"},
                {"name": "G.Skill Trident Z5 64GB DDR5-6400", "price": 249, "benchmark": 6400, "tier": "enthusiast"},
            ],
        }
    
    def analyze(
        self,
        name: str,
        price: float,
        benchmark: float,
        category: str
    ) -> dict:
        """
        Analyze a part's value tier and find similar alternatives.
        
        Returns:
            dict with tier, value_score, similar_parts
        """
        if not self.is_loaded or self.model is None:
            raise RuntimeError("Model not loaded")
        
        # Calculate value (performance per dollar)
        value = benchmark / price if price > 0 else 0
        
        # Prepare features
        features = np.array([[price, benchmark, value]])
        features_scaled = self.scaler.transform(features)
        
        # Predict cluster
        cluster = int(self.model.predict(features_scaled)[0])
        
        # Map cluster to tier (sorted by centroid benchmark score)
        centroids = self.scaler.inverse_transform(self.model.cluster_centers_)
        tier_order = np.argsort(centroids[:, 1])  # Sort by benchmark
        tier_index = np.where(tier_order == cluster)[0][0]
        tier = self.tier_labels[tier_index]
        
        # Calculate value score (0-100)
        # Based on performance per dollar relative to tier average
        tier_parts = self.parts_db.get(category.lower(), [])
        tier_avg_value = np.mean([p["benchmark"] / p["price"] for p in tier_parts if p["tier"] == tier]) if tier_parts else value
        
        value_score = min(100, max(0, (value / tier_avg_value) * 50 + 50)) if tier_avg_value > 0 else 50
        
        # Find similar parts in the same tier
        similar_parts = [
            p["name"] for p in tier_parts
            if p["tier"] == tier and p["name"].lower() != name.lower()
        ][:5]
        
        return {
            "tier": tier,
            "value_score": round(value_score, 1),
            "similar_parts": similar_parts
        }
