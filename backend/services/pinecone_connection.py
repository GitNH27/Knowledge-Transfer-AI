import os
from openai import OpenAI
from pinecone import Pinecone
from typing import List
from dotenv import load_dotenv  # <-- ADD THIS

# 1. Load the .env file so os.getenv works
load_dotenv()

# Initialize Clients
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))
index = pc.Index(host=os.getenv("PINECONE_INDEX_HOST"))

# Example Format of data stored in Pinecone:
# {
#   "id": "session123#source_doc#chunk_0",
#   "values": [0.123, 0.456, ...],  # Embedding vector
#   "metadata": {
#       "text": "The actual chunk text...",
#       "session_id": "session123",
#       "source": "source_doc"
#      }
# }


def embed_and_store_documents(docs: List, session_id: str):
    if not docs:
        return 0
    
    try:
        input_texts = [doc.page_content for doc in docs]
        
        # Batch if needed (OpenAI limit: 2048 inputs)
        batch_size = 100
        all_vectors = []
        
        for i in range(0, len(input_texts), batch_size):
            batch = input_texts[i:i+batch_size]
            
            response = client.embeddings.create(
                model="text-embedding-3-large",
                input=batch,
                dimensions=1024
            )
            
            for j, item in enumerate(response.data):
                doc_idx = i + j
                # Define source name from metadata
                source_name = docs[doc_idx].metadata.get("source", "doc").replace(" ", "_")
                all_vectors.append({
                    "id": f"{session_id}#{source_name}#chunk_{doc_idx}",    # Unique ID
                    "values": item.embedding,   # Embedding vector
                    "metadata": {   # Additional metadata (chunk text, session id, source)
                        "text": docs[doc_idx].page_content,
                        "session_id": session_id,
                        "source": docs[doc_idx].metadata.get("source", "unknown")
                    }
                })
        
        # Upsert in batches to Pinecone
        for i in range(0, len(all_vectors), 100):
            batch = all_vectors[i:i+100]
            index.upsert(vectors=batch, namespace=session_id)
        
        return len(all_vectors)
        
    except Exception as e:
        print(f"Error embedding/storing documents: {e}")
        raise
    
# Vector retrieval function (Topic for presentation/KT)
def query_vector_database(query: str, session_id: str, top_k: int):
    try:
        # Generate embedding for the query
        response = client.embeddings.create(
            model="text-embedding-3-large",
            input=[query],
            dimensions=1024
        )
        query_vector = response.data[0].embedding
        
        # Query Pinecone index
        search_response = index.query(
            vector=query_vector,
            top_k=top_k,
            namespace=session_id,
            include_metadata=True
        )
        
        return search_response.matches  # Return the matched vectors with metadata
    
    except Exception as e:
        print(f"Error querying vector database: {e}")
        raise