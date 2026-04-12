# SinCity AI: Intelligent Vegas Trip Optimizer

## Contributors

Jiya Merja (BA2025016)<br>
Prerana Kurra (BA2025021)

## Problem Statement

Planning a trip to Las Vegas can be overwhelming. There are thousands of hotels, shows, dining options, and nightlife venues, making it incredibly difficult to optimize a trip that strictly adheres to a fixed budget and duration while catering to specific interests.
SinCity AI solves this by leveraging modern Large Language Models and Retrieval-Augmented Generation (RAG) to instantly plan, calculate, and justify a highly tailored itinerary based on real-time constraints.

## Architecture

This project is built as a decoupled Full-Stack Web Application:
- **Frontend**: React + Vite + Tailwind CSS. Provides a rich, highly interactive "Luxury Resort" User Interface.
- **Backend**: FastAPI (Python). Provides low-latency API routes and Python-based logic processing.
- **RAG & Vector Search**: ChromaDB is used to store high-dimensional embeddings of Las Vegas venues (generated locally using HuggingFace `sentence-transformers`).
- **LLM Engine**: Groq API using open-source models (like LLaMA-3) generates explainable itineraries based on the injected local context from ChromaDB.

## Tech Stack
- Frontend: React / Vite / Node.js
- Frontend Styling: Tailwind CSS
- Backend: Python 3 / FastAPI / Uvicorn
- AI/ML: Groq API / ChromaDB / sentence-transformers
- Deployment: Vercel (Frontend), Render (Backend)

## Local Setup Instructions

### 1. Backend Setup
1. Navigate to `/backend`.
2. Create a virtual environment: `python -m venv venv`
`py 3.10 -m venv venv` worked better
3. Activate it:
   - Windows: `venv\Scripts\activate`
   - Mac/Linux: `source venv/bin/activate`
4. Install dependencies: `pip install -r requirements.txt`
5. Edit `.env` file and insert your Groq API Key: `GROQ_API_KEY="your-key-here"`
6. Initialize the Vector Database: `python services/rag.py`
7. Start the FastAPI server: `uvicorn main:app --reload`
(The API will be available at `http://localhost:8000`)

### 2. Frontend Setup
1. Navigate to `/frontend`.
2. Install Node dependencies: `npm install`
3. Start the Vite development server: `npm run dev`
(The UI will be available at `http://localhost:5173`)

## Features
- **Intelligent RAG Retrieval**: Dynamically fetches the most relevant hotels and clubs directly related to user inputs.
- **Explainable AI**: The LLM justifies its decisions on cost and schedule distribution.
- **Budget Guardian**: Built-in backend systems verify that the generated trip strictly conforms to user financial constraints.

