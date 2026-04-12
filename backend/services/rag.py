import json
import os
import chromadb
from sentence_transformers import SentenceTransformer

# Define paths
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_PATH = os.path.join(BASE_DIR, "../data/vegas_data.json")
CHROMA_DB_DIR = os.path.join(BASE_DIR, "chroma_db")

MODEL_NAME = "all-MiniLM-L6-v2"

# Initialize ChromaDB Persistent Client
client = chromadb.PersistentClient(path=CHROMA_DB_DIR)
collection_name = "vegas_attractions"
collection = client.get_or_create_collection(name=collection_name)

def init_db():
    if collection.count() > 0:
        print("Database already initialized with", collection.count(), "entries.")
        return

    print("Initializing Database with embeddings...")
    with open(DATA_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)

    # Initialize Sentence Transformer model
    model = SentenceTransformer(MODEL_NAME)

    ids = []
    documents = []
    metadatas = []
    embeddings = []

    for item in data:
        # Create a text representation for semantic searching
        text_for_embedding = f"{item['name']} - {item['type']}. {item['description']}. Approximate Cost: ${item['cost']}"
        
        ids.append(item["id"])
        documents.append(text_for_embedding)
        metadatas.append({
            "name": item["name"],
            "type": item["type"],
            "cost": item["cost"],
            "description": item["description"]
        })
        
        # Generate embedding
        embedding = model.encode(text_for_embedding).tolist()
        embeddings.append(embedding)

    # Add to Chroma
    collection.add(
        ids=ids,
        documents=documents,
        metadatas=metadatas,
        embeddings=embeddings
    )
    print("Database initialized successfully.")

def search_attractions(query: str, n_results: int = 5):
    """
    Search for attractions based on a text query.
    Returns the top matching metadatas.
    """
    model = SentenceTransformer(MODEL_NAME)
    query_embedding = model.encode(query).tolist()
    
    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=n_results
    )
    
    retrieved_items = []
    if results['metadatas'] and len(results['metadatas'][0]) > 0:
        for metadata in results['metadatas'][0]:
            retrieved_items.append(metadata)
            
    return retrieved_items

if __name__ == "__main__":
    init_db()
