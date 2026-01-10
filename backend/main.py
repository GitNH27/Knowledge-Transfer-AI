import os
import shutil
import tempfile
from fastapi import FastAPI, UploadFile, File, Form
from models import LectureTopicRequest, GeneratedLectureResponse, LectureAudioResponse, QAAudioTranscriptResponse, QARequest, QAResponse
from services.document_ingestion import ingest_documents_input
from services.pinecone_connection import embed_and_store_documents

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
        docs = ingest_documents_input(temp_path, file.filename.split(".")[-1], session_id)
        count = embed_and_store_documents(docs, session_id)
        
        return {
            "status": "success",
            "message": f"Successfully stored {count} chunks for session {session_id}"
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
    
    # Logic for generating lecture goes here
    
    return {"session_id": request.session_id,
            "topic": request.topic,
            "slide_content": ["Slide 1", "Slide 2"],
            "lecture_script": "Lecture script goes here"}
    
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
    
    # Logic for generating answer from text question goes here
    
    return {"question": request.question,
            "answer": "Generated answer",
            "audio_url": "http://example.com/answer_audio.mp3",
            "source_documents": ["Doc 1", "Doc 2"]}