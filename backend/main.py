import os
import shutil
import tempfile
import json
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.responses import StreamingResponse
from models import LectureTopicRequest, GeneratedLectureResponse, LectureAudioResponse, QAAudioTranscriptResponse, QARequest, QAResponse

from services.backboard_service import create_assistant, create_thread
from services.backboard_rag import upload_document_to_assistant
from services.backboard_llm import send_message, send_message_with_memory, send_message_streaming

session_assistants = {}  # {session_id: assistant_id}
session_threads = {}     # {sessoin_od: thread_id}

app = FastAPI()

# Note : In AWS lambda (must save tmp files to /tmp directory with limited 512MB space)
# ingest_documents takes in file path, file type and session id to return cleaned, chunked documents with metadata
# Must save uploaded file to /tmp and pass that path to ingest_documents
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
        
        return {
            "status": "success",
            "message": f"Successfully uploaded document for session {session_id}",
            "document_id": document.document_id
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
            return {"error": "Session not found. Please upload documents first."}
            
        prompt = f"""Generate a lecture on {request.topic}. 
            Use the uploaded documents as context.
            Return a JSON object with:
            - "slide_content": list of 3-5 bullet points
            - "lecture_script": a conversational 2-minute script"""

        response = await send_message(
            thread_id=thread_id,
            content=prompt,
            memory="Auto"
        )

        response_json = json.loads(response.content)

        return {"session_id": request.session_id,
                "topic": request.topic,
                "slide_content": response_json.get("slide_content", []),
                "lecture_script": response_json.get("lecture_script", "")
        }
    except Exception as e:
        return {"error": str(e)}
    

# Endpoint to generate audio lecture from generated lecture script
@app.post("/generateLectureAudio", response_model=LectureAudioResponse)
async def generate_lecture_audio(request: GeneratedLectureResponse):
    
    # Logic for generating audio from lecture script goes here
    
    return {"topic": request.topic,
            "lecture_script": request.lecture_script,
            "audio_url": "http://example.com/audio.mp3"}
    
    
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



# # Endpoint for user to ask question with streaming ()
# @app.post("/askQuestionStream")
# async def ask_question_stream(request: QARequest):
#     pass