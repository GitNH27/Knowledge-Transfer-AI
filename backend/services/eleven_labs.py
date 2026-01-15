import os
import uuid
from io import BytesIO
from dotenv import load_dotenv
from elevenlabs.client import ElevenLabs

load_dotenv()

client = ElevenLabs(
    api_key=os.getenv("ELEVENLABS_API_KEY"),
)

# Get the current directory
current_dir = os.path.dirname(os.path.abspath(__file__))
audio_cache = os.path.abspath(os.path.join(current_dir, "..", "session_cache"))
os.makedirs(audio_cache, exist_ok=True)

def text_to_speech(session_id, text):
    # .convert returns a generator of bytes
    response = client.text_to_speech.convert(
        voice_id='JBFqnCBsd6RMkjVDRZzb',
        output_format="mp3_44100_128",
        text=text,
        model_id="eleven_multilingual_v2"
    )
    # Save to file
    unique_id = uuid.uuid4()
    file_path = os.path.join(audio_cache, f"{session_id}_{unique_id}.mp3")
    
    with open(file_path, "wb") as f:    # wb = write binary
        for chunk in response:
            f.write(chunk)
                
    return file_path

# Speech to text using ElevenLabs API
def speech_to_text(audio_bytes):
    
    response = client.speech_to_text.convert(
        audio_file=BytesIO(audio_bytes),
        model="scribe_v2"
    )
    transcript_text = response.text
    
    return transcript_text

# Gather Specific transcript from ElevenLabs API
def retrieve_transcript(session_id, transcription_id):
    client.speech_to_text.transcripts.get(
    transcription_id=transcription_id
)
    
# if __name__ == "__main__":
#     # Simulate a session and some text
#     test_session = "user_12345"
#     test_text = "Hello! This is a test to see if the unique audio ID generation works."
    
#     print(f"Generating audio for session: {test_session}...")
    
#     try:
#         path = text_to_speech(test_session, test_text)
#         print(f"Success! File saved at: {path}")
        
#         # Check if file actually exists on disk
#         if os.path.exists(path):
#             print(f"Verified: File size is {os.path.getsize(path)} bytes.")
            
#     except Exception as e:
#         print(f"An error occurred: {e}")