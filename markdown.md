SinCity AI: Intelligent Vegas Trip Optimizer

------------------------------------------
Objective
------------------------------------------
Build an AI-powered system that generates optimized, explainable Las Vegas itineraries based on user preferences, budget, and duration using RAG and LLMs.

------------------------------------------
Core Features
------------------------------------------

- Take user input:
  - Budget
  - Number of days
  - Interests (casinos, nightlife, shows, food)

- Generate AI-based itinerary:
  - Day-wise plan
  - Activities and locations

- Provide cost breakdown:
  - Hotel
  - Food
  - Activities

- Ensure budget constraint:
  - Total cost must not exceed user budget

- Explainability:
  - Justify choices made in itinerary
  - Reasoning for cost allocation and scheduling

- Adaptive regeneration:
  - Modify plan based on user feedback
  - Examples:
    - “Make it cheaper”
    - “Add more nightlife”

------------------------------------------
System Design
------------------------------------------

- Frontend → React + Tailwind
- Backend → FastAPI (Python)

Pipeline:
- User Input
- RAG Retrieval (ChromaDB + embeddings)
- LLM Generation (Groq API)
- Budget Optimization
- Response Output

------------------------------------------
RAG Implementation
------------------------------------------

- Dataset:
  - Hotels
  - Casinos
  - Restaurants
  - Shows

- Steps:
  - Load data
  - Split text
  - Generate embeddings
  - Store in ChromaDB
  - Retrieve relevant data for queries

------------------------------------------
AI/ML Components
------------------------------------------

- LLM:
  - Used for itinerary generation
  - Prompt engineering for structured output

- Embeddings:
  - Used for semantic search in RAG

------------------------------------------
Budget Optimization Logic
------------------------------------------

- Estimate cost for:
  - Stay
  - Food
  - Activities

- If cost > budget:
  - Replace expensive items
  - Adjust plan dynamically

------------------------------------------
User Interaction
------------------------------------------

- Input form
- Display:
  - Itinerary
  - Cost breakdown
  - Explanation

- Buttons:
  - Regenerate plan
  - Modify preferences

------------------------------------------
Data Requirements
------------------------------------------

- 20–30 entries minimum
- Each entry includes:
  - Name
  - Type
  - Cost
  - Description

------------------------------------------
Deployment
------------------------------------------

- Frontend → Vercel
- Backend → Render

Requirements:
- Live working link
- Low latency response

------------------------------------------
Code Structure
------------------------------------------

/backend
  - main.py
  - routes/
  - services/
      - rag.py
      - planner.py
      - budget.py

/frontend
  - components/
  - pages/

/data
  - vegas_data.json

------------------------------------------
Documentation
------------------------------------------

- README must include:
  - Problem statement
  - Architecture
  - Tech stack
  - Setup instructions
  - Screenshots

------------------------------------------
Constraints
------------------------------------------

- No hardcoded outputs
- Must use real AI/ML logic
- Maintain clean code structure
- Secure API keys using .env

------------------------------------------
End Goal
------------------------------------------

Deliver a fully functional AI system that:
- Uses RAG for real data retrieval
- Generates intelligent itineraries
- Optimizes based on constraints
- Provides clear explanations
- Is deployed and demo-ready