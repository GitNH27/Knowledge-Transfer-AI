import re
import os
import shutil
import tempfile
import json
from datetime import datetime

from fastapi import FastAPI, UploadFile, File, Form, Request
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles # This is for serving static files

from models import LectureTopicRequest, GeneratedLectureResponse, LectureAudioResponse, QARequest, QAResponse, IngestSuccessResponse

from services.backboard_service import create_assistant, create_thread, delete_thread
from services.backboard_rag import upload_document_to_assistant
from services.backboard_llm import send_message, send_message_with_memory, send_message_streaming
from services.eleven_labs import text_to_speech, speech_to_text

session_assistants = {}  # {session_id: assistant_id}
session_threads = {}     # {session_id: thread_id}
session_documents = {}   # {session_id: [list of document info]}

app = FastAPI()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Vite default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files for audio
app.mount("/audio", StaticFiles(directory="session_cache"), name="audio")

@app.post("/ingestDocuments", response_model=IngestSuccessResponse)
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
            "document_id": str(document.document_id),
            "uploaded_at": datetime.now().isoformat(),
            "size": file_size,
            "content_type": file.content_type or "unknown"
        })
        
        return {
            "status": "success",
            "message": f"Successfully uploaded document for session {session_id}",
            "document_id": str(document.document_id),
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
# ... (imports and other endpoints above)

@app.post("/generateLecture", response_model=GeneratedLectureResponse)
async def generate_lecture(request: LectureTopicRequest):
    try:
        thread_id = session_threads.get(request.session_id)
        if not thread_id:
            return {
                "session_id": request.session_id,
                "topic": request.topic,
                "slide_content": [],
                "lecture_script": "Error: Session not found."
            }
            
        prompt = f"""Generate a lecture on {request.topic}. 
            Use the uploaded documents as context.
            Return ONLY a valid JSON object. Do not include introductory text.
            Format:
            {{
                "slide_content": ["Point 1", "Point 2", "Point 3"],
                "lecture_script": "Your script here..."
            }}"""

        response = await send_message(
            thread_id=thread_id,
            content=prompt,
            memory="Auto"
        )

        if not response.content:
             return {"session_id": request.session_id, "topic": request.topic, "slide_content": [], "lecture_script": "Empty response"}

        raw_content = response.content.strip()

        # --- ROBUST JSON EXTRACTION ---
        # 1. Try to find JSON block using Regex (extracts anything between the first { and last })
        json_match = re.search(r"(\{.*\})", raw_content, re.DOTALL)
        
        if json_match:
            clean_content = json_match.group(1)
        else:
            # 2. Fallback: Manual markdown cleanup if regex fails
            clean_content = raw_content.replace("```json", "").replace("```", "").strip()

        try:
            response_json = json.loads(clean_content)
        except json.JSONDecodeError as e:
            # If parsing still fails, we return the raw text so the UI doesn't crash
            return {
                "session_id": request.session_id,
                "topic": request.topic,
                "slide_content": ["Failed to parse AI structure"],
                "lecture_script": raw_content # Fallback to showing the text as is
            }

        return {
            "session_id": request.session_id,
            "topic": request.topic,
            "slide_content": response_json.get("slide_content", []),
            "lecture_script": response_json.get("lecture_script", "")
        }
    except Exception as e:
        return {
            "session_id": request.session_id,
            "topic": request.topic,
            "slide_content": [],
            "lecture_script": f"System Error: {str(e)}"
        }   

# Endpoint to generate audio lecture from generated lecture script
@app.post("/generateLectureAudio", response_model=LectureAudioResponse)
async def generate_lecture_audio(audioRequest: Request, request: GeneratedLectureResponse):
    try:
        audio_file_path = text_to_speech(session_id=request.session_id, text=request.lecture_script)
        
        filename = os.path.basename(audio_file_path)
        base_url = str(audioRequest.base_url).rstrip("/")
        audio_url = f"{base_url}/audio/{filename}"

        return { 
            "session_id": request.session_id,
            "topic": request.topic,
            "lecture_script": request.lecture_script,
            "audio_url": audio_url
        }
    except Exception as e:
        return {
            "session_id": request.session_id,
            "topic": request.topic,
            "lecture_script": request.lecture_script,
            "audio_url": f"Error generating audio: {str(e)}"
        }

@app.post("/askQuestionAudio", response_model=QAResponse)
async def ask_question_audio(audioRequest: Request, session_id: str = Form(...), audio_file: UploadFile = File(...)):
    try:
        audio_bytes = await audio_file.read()
        user_question_text = speech_to_text(audio_bytes)
        
        if not user_question_text:
            return {
                "session_id": session_id,
                "question": "Transcription failed",
                "answer": "Error in audio processing",
                "audio_url": "",
                "source_documents": []
            }

        thread_id = session_threads.get(session_id)
        if not thread_id:
            return {
                "session_id": session_id,
                "question": user_question_text,
                "answer": "Error: Thread not found",
                "audio_url": "",
                "source_documents": []
            }

        llm_response = await send_message_with_memory(thread_id=thread_id, content=user_question_text, memory="Auto")
        answer_text = llm_response.content

        audio_path = text_to_speech(session_id, answer_text)
        filename = os.path.basename(audio_path)
        base_url = str(audioRequest.base_url).rstrip("/")
        audio_url = f"{base_url}/audio/{filename}"

        return {
            "session_id": session_id,
            "question": user_question_text,
            "answer": answer_text,
            "audio_url": audio_url,
            "source_documents": []
        }
    except Exception as e:
        return {
            "session_id": session_id,
            "question": "Audio processing failed",
            "answer": f"Error: {str(e)}",
            "audio_url": "",
            "source_documents": []
        }

@app.post("/askQuestion", response_model=QAResponse)
async def ask_question(audioRequest: Request, request: QARequest):
    try:
        thread_id = session_threads.get(request.session_id)
        if not thread_id:
            return {
                "session_id": request.session_id,
                "question": request.question,
                "answer": "Error: Session not found",
                "audio_url": "",
                "source_documents": [] 
            }
        
        response = await send_message_with_memory(thread_id=thread_id, content=request.question, memory="Auto")
        
        audio_path = text_to_speech(session_id=request.session_id, text=response.content)
        filename = os.path.basename(audio_path)
        base_url = str(audioRequest.base_url).rstrip("/")
        audio_url = f"{base_url}/audio/{filename}"
        
        return {
            "session_id": request.session_id,
            "question": request.question,
            "answer": response.content,
            "audio_url": audio_url,
            "source_documents": []
        }
    except Exception as e:
        return {
            "session_id": request.session_id,
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

# Delete Thread endpoint/session
@app.delete("/deleteSession/{session_id}")
async def delete_session(session_id: str):
    """
    Clears the session locally and deletes the associated thread on Backboard.
    """
    try:
        # 1. Check if the thread exists in our memory
        thread_id = session_threads.get(session_id)
        
        if thread_id:
            # 2. Call the Backboard service to delete the thread
            # This uses the 'delete_thread' function you imported from services.backboard_service
            await delete_thread(thread_id)
        
        # 3. Clean up local memory dictionaries
        # We use .pop(..., None) to avoid errors if the key was already gone
        session_threads.pop(session_id, None)
        session_assistants.pop(session_id, None)
        session_documents.pop(session_id, None)
        
        return {
            "status": "success",
            "session_id": session_id,
            "message": f"Session {session_id} and its associated thread have been deleted."
        }

    except Exception as e:
        return {
            "status": "error",
            "message": f"Failed to delete session: {str(e)}"
        }