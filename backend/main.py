from fastapi import FastAPI, UploadFile, File, Form
from models import LectureTopicRequest, GeneratedLectureResponse, LectureAudioResponse, QAAudioTranscriptResponse, QARequest, QAResponse
from services.document_Ingestion import ingest_documents

app = FastAPI()

# Note : In AWS lambda (must save tmp files to /tmp directory with limited 512MB space)
# ingest_documents takes in file path, file type and session id to return cleaned, chunked documents with metadata
# Must save uploaded file to /tmp and pass that path to ingest_documents
@app.post("/ingestDocuments")
async def ingest_documents(session_id: str = Form(...), file: UploadFile = File(...)):
    
    # Logic for chunking, vectorzing and storing documents goes here
    docs = ingest_documents(file.filename, file.content_type, session_id)
    
    return {"status": "success",
            "message": f"Documents ingested for session {session_id} and stored in vector DB."}

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