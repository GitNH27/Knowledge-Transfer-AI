# Pydantic models for core models used in the backend application.
from pydantic import BaseModel

class IngestSuccessResponse(BaseModel) :
    status: str
    message: str
    document_id: str
    filename: str

# After doc ingest and in vector DB, topic prompt for what user wants lecture on
class LectureTopicRequest(BaseModel):
    session_id: str
    topic: str
    
# Model representing the response for a generated lecture
# Example Includes Topic, Slides
class GeneratedLectureResponse(BaseModel):
    session_id: str
    topic: str
    slide_content: list[str]
    lecture_script: str

# Model for Audio lecture response to reduce botteneck
class LectureAudioResponse(BaseModel):
    session_id: str
    topic: str
    lecture_script: str
    audio_url: str
    
# Model for QA request string
class QARequest(BaseModel):
    session_id: str
    question: str
    
# Model for QA response
class QAResponse(BaseModel):
    session_id: str
    question: str
    answer: str
    audio_url: str
    source_documents: list[str]
    