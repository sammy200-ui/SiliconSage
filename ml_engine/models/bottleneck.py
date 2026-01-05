"""
Bottleneck Calculator Model
Uses RandomForestRegressor to predict FPS and detect component bottlenecks
"""

import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import LabelEncoder
import joblib
import os


class BottleneckCalculator:
    def __init__(self):
        self.model: RandomForestRegressor | None = None
        self.resolution_encoder = LabelEncoder()
        self.storage_encoder = LabelEncoder()
        self.is_loaded = False
        
        # Initialize with default encodings
        self.resolution_encoder.fit(["1080p", "1440p", "4k"])
        self.storage_encoder.fit(["hdd", "ssd", "nvme"])
        
        # Try to load pre-trained model, otherwise initialize with synthetic data
        self._initialize_model()
    
    def _initialize_model(self):
        """Initialize or load the model"""
        model_path = os.path.join(os.path.dirname(__file__), "bottleneck_model.joblib")
        
        if os.path.exists(model_path):
            try:
                self.model = joblib.load(model_path)
                self.is_loaded = True
                return
            except Exception:
                pass
        
        # Train with synthetic data for initial deployment
        self._train_synthetic()
    
    def _train_synthetic(self):
        """Train model with synthetic benchmark data"""
        np.random.seed(42)
        n_samples = 1000
        
        # Generate synthetic training data
        # CPU scores: 5000-50000 (PassMark style)
        cpu_scores = np.random.uniform(5000, 50000, n_samples)
        # GPU scores: 3000-30000 (3DMark style)
        gpu_scores = np.random.uniform(3000, 30000, n_samples)
        # RAM: 8-64 GB
        ram_gb = np.random.choice([8, 16, 32, 64], n_samples)
        # RAM Speed: 2400-6000 MHz
        ram_speed = np.random.choice([2400, 3200, 3600, 4800, 6000], n_samples)
        # Storage: 0=HDD, 1=SSD, 2=NVMe
        storage = np.random.choice([0, 1, 2], n_samples)
        # Resolution: 0=1080p, 1=1440p, 2=4K
        resolution = np.random.choice([0, 1, 2], n_samples)
        
        # Calculate synthetic FPS based on realistic relationships
        # GPU is primary driver, CPU matters more at low resolutions
        resolution_factor = np.array([1.0, 0.65, 0.35])[resolution]
        cpu_factor = np.array([0.3, 0.2, 0.1])[resolution]  # CPU matters less at higher res
        
        base_fps = (
            (gpu_scores / 300) * resolution_factor +  # GPU primary driver
            (cpu_scores / 1000) * cpu_factor +  # CPU secondary
            (ram_gb / 16) * 5 +  # RAM impact
            (ram_speed / 1000) * 2 +  # RAM speed minor impact
            storage * 3  # Storage minimal impact on FPS
        )
        
        # Add noise
        fps = base_fps + np.random.normal(0, 5, n_samples)
        fps = np.clip(fps, 15, 240)  # Reasonable FPS range
        
        # Create feature matrix
        X = np.column_stack([cpu_scores, gpu_scores, ram_gb, ram_speed, storage, resolution])
        y = fps
        
        # Train model
        self.model = RandomForestRegressor(
            n_estimators=100,
            max_depth=15,
            random_state=42,
            n_jobs=-1
        )
        self.model.fit(X, y)
        self.is_loaded = True
        
        # Save model
        try:
            model_path = os.path.join(os.path.dirname(__file__), "bottleneck_model.joblib")
            joblib.dump(self.model, model_path)
        except Exception:
            pass  # Non-critical if save fails
    
    def predict(
        self,
        cpu_score: float,
        gpu_score: float,
        ram_gb: int,
        ram_speed: int,
        storage_type: str,
        resolution: str
    ) -> dict:
        """
        Predict FPS and detect bottlenecks.
        
        Returns:
            dict with predicted_fps, bottleneck_component, bottleneck_severity, recommendation
        """
        if not self.is_loaded or self.model is None:
            raise RuntimeError("Model not loaded")
        
        # Encode categorical features
        storage_encoded = {"hdd": 0, "ssd": 1, "nvme": 2}.get(storage_type.lower(), 1)
        resolution_encoded = {"1080p": 0, "1440p": 1, "4k": 2}.get(resolution.lower(), 0)
        
        # Prepare features
        features = np.array([[cpu_score, gpu_score, ram_gb, ram_speed, storage_encoded, resolution_encoded]])
        
        # Predict FPS
        predicted_fps = float(self.model.predict(features)[0])
        
        # Detect bottleneck by analyzing component balance
        bottleneck, severity, recommendation = self._analyze_bottleneck(
            cpu_score, gpu_score, ram_gb, resolution, predicted_fps
        )
        
        return {
            "predicted_fps": round(predicted_fps, 1),
            "bottleneck_component": bottleneck,
            "bottleneck_severity": severity,
            "recommendation": recommendation
        }
    
    def _analyze_bottleneck(
        self,
        cpu_score: float,
        gpu_score: float,
        ram_gb: int,
        resolution: str,
        predicted_fps: float
    ) -> tuple[str, str, str]:
        """Analyze component balance to detect bottlenecks"""
        
        # Expected ratios for balanced systems (GPU:CPU score ratio)
        # Higher resolution = GPU more important
        ideal_ratios = {"1080p": 0.6, "1440p": 0.5, "4k": 0.4}
        ideal_ratio = ideal_ratios.get(resolution.lower(), 0.5)
        
        actual_ratio = gpu_score / cpu_score if cpu_score > 0 else 1
        
        # RAM bottleneck check
        if ram_gb < 16 and resolution in ["1440p", "4k"]:
            return "RAM", "moderate", f"Upgrade to 16GB+ RAM for {resolution} gaming. Current {ram_gb}GB may cause stuttering."
        
        if ram_gb < 8:
            return "RAM", "severe", "8GB RAM minimum required. Upgrade to 16GB for smooth gaming."
        
        # CPU vs GPU balance
        ratio_diff = actual_ratio - ideal_ratio
        
        if ratio_diff > 0.3:  # GPU much stronger than CPU
            severity = "severe" if ratio_diff > 0.5 else "moderate"
            return "CPU", severity, f"Your CPU is limiting GPU performance. Consider upgrading CPU or lowering to {resolution}."
        
        if ratio_diff < -0.3:  # CPU much stronger than GPU
            severity = "severe" if ratio_diff < -0.5 else "moderate"
            return "GPU", severity, "Your GPU is the limiting factor. Upgrade GPU for better frame rates."
        
        if abs(ratio_diff) < 0.15:
            return "none", "none", "Well-balanced build! All components work efficiently together."
        
        # Minor imbalance
        bottleneck = "CPU" if ratio_diff > 0 else "GPU"
        return bottleneck, "minor", f"Minor {bottleneck} limitation detected. Performance impact is minimal."
