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
2. Run `winget install Python.Python.3.10`
3. Create a virtual environment: `py -3.10 -m venv venv` 
4. Activate it:
   - Windows: `venv\Scripts\Activate`
   - Mac/Linux: `source venv/bin/activate`
5. Install dependencies: `python -m pip install -r requirements.txt`
6. ### Environment Variables
   Create a .env file inside the backend folder and add your own API key: GROQ_API_KEY=your_groq_api_key_here
   You can get a free API key from: https://console.groq.com/
7. Initialize the Vector Database: `python services/rag.py`
8. Start the FastAPI server: `uvicorn main:app --reload --reload-exclude venv`
(The API will be available at `http://localhost:8000`)

### 2. Frontend Setup
1. Navigate to `/frontend`.
2. Run `winget install OpenJS.NodeJS.LTS`
3. Install Node dependencies: `npm install`
4. Start the Vite development server: `npm run dev`
(The UI will be available at `http://localhost:5173`)


## Features
- **Intelligent RAG Retrieval**: Dynamically fetches the most relevant hotels and clubs directly related to user inputs.
- **Explainable AI**: The LLM justifies its decisions on cost and schedule distribution.
- **Budget Guardian**: Built-in backend systems verify that the generated trip strictly conforms to user financial constraints.

