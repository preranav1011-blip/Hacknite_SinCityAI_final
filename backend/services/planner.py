import os
import json
from groq import Groq
from services.rag import search_attractions

def generate_itinerary(budget: int, days: int, interests: list, feedback: str = ""):
    GROQ_API_KEY = os.getenv("GROQ_API_KEY")
    
    query = f"Las Vegas spots related to: {', '.join(interests)}. Feedback: {feedback}"
    retrieved = search_attractions(query, n_results=10)
    
    context = ""
    for item in retrieved:
        context += f"- {item['name']} ({item['type']}): {item['description']} (Cost: ${item['cost']})\n"
        
    feedback_prompt = f"User Feedback from previous generation (adjust accordingly): {feedback}\n" if feedback else ""
        
    prompt = f"""
    You are an intelligent Las Vegas trip planner.
    User's Total Budget: ${budget}
    Number of Days: {days}
    Interests: {', '.join(interests)}
    {feedback_prompt}
    
    Here is some local data to use for recommendations:
    {context}
    
    Generate a JSON itinerary. Total estimated cost must be UNDER or EQUAL to ${budget}. Combine the provided data with your general knowledge to fill in gaps if necessary, but prioritize the local data.
    CRITICAL INSTRUCTION: For every single day, you MUST provide at least one activity for the "Morning", one for the "Afternoon/Evening", and one for the "Night". 
    For each activity, estimate the transit distance and a rough cab fare from the previous activity (or from the user's hotel for the first activity of the day). Do NOT add this estimated cab_fare to the `total_cost`, we will display it as an extra.
    
    EXPECTED JSON FORMAT:
    {{
        "total_cost": number,
        "explanation": "A short string explaining why these choices were made.",
        "itinerary": [
            {{
                "day": 1,
                "activities": [
                    {{
                        "time": "Morning/Afternoon/Evening", 
                        "name": "...", 
                        "cost": number, 
                        "description": "...",
                        "distance": "1.2 miles",
                        "cab_fare": "$15"
                    }}
                ]
            }}
        ]
    }}
    IMPORTANT: Output ONLY the JSON object, absolutely NO markdown tags or extra text.
    """
    
    if not GROQ_API_KEY:
        # Mock behavior if api key not provided yet
        return {
            "error": "GROQ_API_KEY is missing in backend/.env file. Please add it to generate real itineraries.",
            "total_cost": 0,
            "explanation": "No API key found",
            "itinerary": []
        }

    client = Groq(api_key=GROQ_API_KEY)
    
    try:
        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile", 
            messages=[
                {"role": "system", "content": "You are a helpful JSON-only output assistant."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
        )
        response_text = completion.choices[0].message.content.strip()
        # Clean up if the model outputs markdown accidentally
        if response_text.startswith("```json"):
            response_text = response_text[7:-3]
        return json.loads(response_text)
    except Exception as e:
        return {"error": f"Failed to generate itinerary with LLM: {str(e)}"}

def generate_alternatives(budget: int, interests: list, current_places: list = None):
    if current_places is None:
        current_places = []
        
    GROQ_API_KEY = os.getenv("GROQ_API_KEY")
    if not GROQ_API_KEY:
        return {"alternatives": []}
        
    query = f"Las Vegas spots related to: {', '.join(interests)} with a mix of Casinos, Shows, Dining, Sightseeing, and Nightlife."
    retrieved = search_attractions(query, n_results=20)
    
    context = ""
    for item in retrieved:
        context += f"- {item['name']} ({item['type']}): {item['description']} (Cost: ${item['cost']})\n"
        
    prompt = f"""
    You are an intelligent Las Vegas trip planner.
    The user has a remaining budget of ${budget} and interests: {', '.join(interests)}.
    
    IMPORTANT: Do NOT suggest any of these places, as the user already has them in their itinerary:
    {current_places}
    
    Here is some local data:
    {context}
    
    Generate at least 5 new, different, and exciting alternative activities they could do. Ensure there is a diverse mix across different categories if possible (Shows, Dining, Sightseeing, Casinos, Nightlife).
    The cost of EACH activity must be LESS THAN ${budget}.
    
    EXPECTED JSON FORMAT:
    {{
        "alternatives": [
            {{
                "time": "Flexible", 
                "name": "...", 
                "cost": number, 
                "description": "...",
                "distance": "1.2 miles",
                "cab_fare": "$15"
            }}
        ]
    }}
    IMPORTANT: Output ONLY the JSON object, absolutely NO markdown tags or extra text.
    """
    
    client = Groq(api_key=GROQ_API_KEY)
    try:
        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile", 
            messages=[
                {"role": "system", "content": "You are a helpful JSON-only output assistant."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.8,
        )
        response_text = completion.choices[0].message.content.strip()
        if response_text.startswith("```json"):
            response_text = response_text[7:-3]
        return json.loads(response_text)
    except Exception as e:
        return {"error": f"Failed to generate alternatives: {str(e)}"}

