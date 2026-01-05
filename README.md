# SiliconSage: The AI-Powered PC Architect 🧠🖥️

> **Project Status:** Active Development
> **Goal:** To build the "Ultimate" PC Part Picker that optimizes for value, performance, and ecosystem (PC vs. Console vs. Laptop).

## 📖 Overview
SiliconSage is not just a compatibility checker. It is a **Value Optimization Engine**. Unlike traditional builders that only check if parts fit, SiliconSage uses Machine Learning to predict performance bottlenecks and Generative AI to offer contextual advice (e.g., "A PS5 is better value than this $700 PC").

## 🏗️ Architecture (Hybrid Microservices)
This project uses a hybrid architecture to combine the SEO/UI benefits of Next.js with the Data Science capabilities of Python.

### 1. The Frontend (The Body)
- **Framework:** Next.js 14+ (App Router)
- **Styling:** Tailwind CSS + Framer Motion (for 2D hardware visualization)
- **State:** React Server Components + Server Actions
- **Deployment:** Vercel (Planned)

### 2. The ML Engine (The Brain)
- **Framework:** Python (FastAPI)
- **ML Library:** Scikit-Learn
- **Models:**
    - `RandomForestRegressor`: Predicts FPS based on CPU/GPU/RAM benchmarks.
    - `K-Means`: Clusters parts into "Value Tiers" for smart upsells.
- **Data Source:** Static JSON dataset seeded into DB (see below).

### 3. The Data Layer
- **Database:** Supabase (PostgreSQL)
- **Vector/AI:** Groq Cloud API (Llama 3) for generating natural language reviews.
- **Schema:** Relational tables for `cpus`, `gpus`, `motherboards`, `builds`.

## 📊 Data Strategy (Crucial)
We are avoiding real-time scraping to prevent IP bans and complexity.
- **Primary Data Source:** **[docyx/pc-part-dataset](https://github.com/docyx/pc-part-dataset)**
    - *Action:* We download the raw JSON files from this repository.
    - *Usage:* A `seed.js` script parses these JSONs to populate the Supabase database initially.
- **Benchmark Data:** Training data for ML models will be sourced from Kaggle (CPU/GPU Benchmarks) to train the Scikit-Learn models.

## 🚀 Key Features
- **Smart Parts Matcher:** A 2D visualizer that dynamically validates physical compatibility (SVG/CSS mapping).
- **The Bottleneck Calculator:** A regression model that warns users if their CPU is choking their GPU performance.
- **Ecosystem Comparison:** Real-time logic comparing the user's custom build price/performance against current Consoles (PS5/Xbox) and Gaming Laptops.
- **AI Advisor:** A chat interface that explains *why* a build is good or bad using Llama 3 (via Groq).

