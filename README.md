# SiliconSage

SiliconSage is an AI-powered PC building assistant that optimizes computer builds for value and performance using machine learning.

## Overview

A hybrid application combining a Next.js frontend with a Python (FastAPI) ML backend. It goes beyond compatibility checking to provide real-time performance analytics and architectural advice.

## Key Features

- **PC Builder & Visualizer**: Interactive drag-and-drop interface with schematic visualization.
- **ML Performance Lab**: Real-time FPS prediction, bottleneck detection, and build integrity analysis (PSU efficiency & Motherboard tier checks).
- **AI Advisor**: Expert persona ("SiliconSage") powered by Llama 3 for context-aware part recommendations and troubleshooting.
- **Ecosystem Comparison**: Analytical tool comparing custom builds against consoles (PS5/Xbox) and laptops to ensure optimal value.

## Technology Stack

### Frontend
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React

### Backend (ML Engine)
- **Framework**: FastAPI (Python)
- **ML Libraries**: Scikit-Learn, Pandas, NumPy
- **Server**: Uvicorn

### Infrastructure
- **Database**: Supabase (PostgreSQL)
- **AI Inference**: Groq API (Llama 3)

## Setup Instructions

### Prerequisites
- Node.js 18+
- Python 3.10+
- A Supabase project
- A Groq API Key

### 1. Repository Setup
Clone the repository:
```bash
git clone https://github.com/sammy200-ui/SiliconSage.git
cd SiliconSage
```

### 2. Frontend Setup
Navigate to the frontend directory and install dependencies:
```bash
cd frontend
npm install
```

Create a `.env.local` file in the `frontend` directory:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
GROQ_API_KEY=your_groq_api_key
```

Run the frontend development server:
```bash
npm run dev
```
The application will be available at `http://localhost:3000`.

### 3. ML Engine Setup
Open a new terminal and navigate to the `ml_engine` directory:
```bash
cd ml_engine
```

Create a virtual environment and activate it:
```bash
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
```

Install Python dependencies:
```bash
pip install fastapi uvicorn scikit-learn pandas numpy joblib
```

Run the ML Engine server:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```
The API will be available at `http://localhost:8000`.

## Architecture Notes
The Frontend and ML Engine are designed to run concurrently. The frontend makes direct API calls to `localhost:8000/predict/fps` to fetch real-time analytics. Ensure both servers are running for the full application experience.
