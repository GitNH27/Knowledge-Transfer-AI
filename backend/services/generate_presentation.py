# Takes query from combination of topic + preset prompt(Ex: "Generate lecture on...") and retrieves relevant docs from Pinecone
import json
import response
from openai import OpenAI
from pydantic import BaseModel
from pinecone_connection import query_vector_database

# Prompts are in a separate file (prompts/KT-Agent.txt)

def generate_presentation_content(topic: str, session_id: str, top_k: int):
    # Prepare context blocks by querying vector database
    top_matches = query_vector_database(topic, session_id, top_k=top_k)
    
    # Generate context text for LLM input (Concatenate top k chunks)
    context_text = "\n\n---\n\n".join([m['metadata']['text'] for m in top_matches])
    
    response.client.response.parse(
        model="gpt-4",
        messages=[
            {
                "role": "system",
                "content": (
                    "You are a Senior Technical Instructor. Create a brief, engaging lecture. "
                    "Use ONLY the provided context. If context is missing, say 'Information not found'. "
                    "You must return a JSON object with two keys: "
                    "'slide_content' (a list of 3-5 bullet points) and "
                    "'lecture_script' (a conversational 2-minute script for the audio)."
                )
            },
            {
                "role": "user",
                "content": f"Context: {context_text}\n\nTopic: {topic}\n\nReturn JSON format."
            }
        ]
    )
    
    # Parse the response to extract slide content and lecture script
    response_text = response.client.response.choices[0].message['content']
    response_json = json.loads(response_text)
    slide_content = response_json['slide_content']
    lecture_script = response_json['lecture_script']
    
    return slide_content, lecture_script