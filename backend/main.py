import os
import shutil
import tempfile
import json
from datetime import datetime

from fastapi import FastAPI, UploadFile, File, Form
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles # This is for serving static files

from models import LectureTopicRequest, GeneratedLectureResponse, LectureAudioResponse, QAAudioTranscriptResponse, QARequest, QAResponse

from services.backboard_service import create_assistant, create_thread
from services.backboard_rag import upload_document_to_assistant
from services.backboard_llm import send_message, send_message_with_memory, send_message_streaming
from services.eleven_labs import text_to_speech

session_assistants = {}  # {session_id: assistant_id}
session_threads = {}     # {session_id: thread_id}
session_documents = {}   # {session_id: [list of document info]}

app = FastAPI()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files for audio
app.mount("/audio", StaticFiles(directory="session_cache"), name="audio")

@app.post("/ingestDocuments")
async def ingest_documents(session_id: str = Form(...), file: UploadFile = File(...)):
    # temp_path = f"/tmp/{file.filename}" # For AWS Lambda
    temp_dir = tempfile.gettempdir()
    temp_path = os.path.join(temp_dir, file.filename)
    
    with open(temp_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    try:

        if session_id not in session_assistants:
            assistant = await create_assistant(
                name=f"Assistant for {session_id}",
                description="AI onboarding assistant"
            )

            session_assistants[session_id] = assistant.assistant_id

            thread = await create_thread(assistant.assistant_id)
            session_threads[session_id] = thread.thread_id

        assistant_id = session_assistants[session_id]

        document = await upload_document_to_assistant(assistant_id, temp_path)
        
        # Track the document
        if session_id not in session_documents:
            session_documents[session_id] = []
        
        # Get file size
        file_size = os.path.getsize(temp_path) if os.path.exists(temp_path) else 0
        
        session_documents[session_id].append({
            "filename": file.filename,
            "document_id": document.document_id,
            "uploaded_at": datetime.now().isoformat(),
            "size": file_size,
            "content_type": file.content_type or "unknown"
        })
        
        return {
            "status": "success",
            "message": f"Successfully uploaded document for session {session_id}",
            "document_id": document.document_id,
            "filename": file.filename
        }

    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }
    
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)
        

# Endpoint where user requests lecture generation on a topic they input
@app.post("/generateLecture", response_model=GeneratedLectureResponse)
async def generate_lecture(request: LectureTopicRequest):
    try:
        thread_id = session_threads.get(request.session_id)
        if not thread_id:
            return {
                "session_id": request.session_id,
                "topic": request.topic,
                "slide_content": [],
                "lecture_script": "Error: Session not found. Please upload documents first."
            }
            
        prompt = f"""Generate a lecture on {request.topic}. 
            Use the uploaded documents as context.
            Return ONLY a valid JSON object with:
            - "slide_content": list of 3-5 bullet points
            - "lecture_script": a conversational 2-minute script
            
            Example format:
            {{
                "slide_content": ["Point 1", "Point 2", "Point 3"],
                "lecture_script": "Your script here..."
            }}"""

        response = await send_message(
            thread_id=thread_id,
            content=prompt,
            memory="Auto"
        )

        # Check if response content exists
        if not response.content:
            return {
                "session_id": request.session_id,
                "topic": request.topic,
                "slide_content": [],
                "lecture_script": "Error: Empty response from AI"
            }

        # Try to extract JSON from response (might have markdown code blocks or extra text)
        content = response.content.strip()
        
        # Remove markdown code blocks if present
        if content.startswith("```json"):
            content = content[7:]  # Remove ```json
        elif content.startswith("```"):
            content = content[3:]  # Remove ```
        
        if content.endswith("```"):
            content = content[:-3]  # Remove closing ```
        
        content = content.strip()

        # Try to parse JSON
        try:
            response_json = json.loads(content)
        except json.JSONDecodeError as e:
            # If JSON parsing fails, return the raw content as lecture script
            return {
                "session_id": request.session_id,
                "topic": request.topic,
                "slide_content": [f"Error parsing JSON: {str(e)}"],
                "lecture_script": response.content  # Return raw response
            }

        return {
            "session_id": request.session_id,
            "topic": request.topic,
            "slide_content": response_json.get("slide_content", []),
            "lecture_script": response_json.get("lecture_script", "")
        }
    except Exception as e:
        # Return proper format even for exceptions
        return {
            "session_id": request.session_id,
            "topic": request.topic,
            "slide_content": [],
            "lecture_script": f"Error: {str(e)}"
        }
    

# Endpoint to generate audio lecture from generated lecture script
@app.post("/generateLectureAudio", response_model=LectureAudioResponse)
async def generate_lecture_audio(request: GeneratedLectureResponse):
    try:
        # Generate audio file
        audio_file_path = text_to_speech(
            session_id=request.session_id, 
            text=request.lecture_script
        )
        
        filename = os.path.basename(audio_file_path) # Get just 'file.mp3'
        audio_url = f"http://localhost:8000/audio/{filename}"

        return { 
            "topic": request.topic,
            "lecture_script": request.lecture_script,
            "audio_url": audio_url # Returns URL to audio
        }

    except Exception as e:
        return {
            "topic": request.topic,
            "lecture_script": request.lecture_script,
            "audio_url": f"Error generating audio: {str(e)}"
        }
    
# Endpoint for user to ask question via (audio input)
@app.post("/askQuestionAudio", response_model=QAResponse)
async def ask_question_audio(session_id: str = Form(...), audio_file: UploadFile = File(...)):
    
    # Logic for transcribing audio and generating answer goes here
    
    return {"question": "Transcribed question",
            "answer": "Generated answer",
            "audio_url": "http://example.com/answer_audio.mp3",
            "source_documents": ["Doc 1", "Doc 2"]}

# Endpoint for user to ask question via (text input)
@app.post("/askQuestion", response_model=QAResponse)
async def ask_question(request: QARequest):
    try:
        thread_id = session_threads.get(request.session_id)
        if not thread_id:
            return {
                "question": request.question,
                "answer": f"Error: Session not found",
                "audio_url": "",
                "source_documents": [] 
            }
        
        response = await send_message_with_memory(
            thread_id=thread_id,
            content=request.question,
            memory="Auto"  # Uses uploaded documents automatically
        )
        
        return {
            "question": request.question,
            "answer": response.content,
            "audio_url": "",  # Add audio generation later
            "source_documents": []  # Backboard handles this internally
        }
    except Exception as e:
        return {
            "question": request.question,
            "answer": f"Error: {str(e)}",
            "audio_url": "",
            "source_documents": [] 
        }



# Endpoint to get list of uploaded documents for a session
@app.get("/getDocuments/{session_id}")
async def get_documents(session_id: str):
    """Get list of uploaded documents for a session"""
    documents = session_documents.get(session_id, [])
    return {
        "session_id": session_id,
        "documents": documents,
        "count": len(documents)
    }

# # Endpoint for user to ask question with streaming ()
# @app.post("/askQuestionStream")
# async def ask_question_stream(request: QARequest):
#     pass