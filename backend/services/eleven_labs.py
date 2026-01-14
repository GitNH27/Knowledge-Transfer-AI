import os
from dotenv import load_dotenv
from elevenlabs import ElevenLabs, stream

class eleven_labs:
    # 1. Load the .env file
    load_dotenv()
    
    def __init__(self):
        self.client = ElevenLabs(api_key=os.getenv("ELEVEN_API_KEY"))
        self.voice_id = "JBFqnCBsd6RMkjVDRZzb"
        self.model_id = "eleven_multilingual_v2"

    def generate_voice(self, text: str):
        # Using .convert() instead of .stream() if you want to return a file/URL
        audio_iterator = self.client.text_to_speech.convert(
            voice_id=self.voice_id,
            output_format="mp3_44100_128",
            text=text,
            model_id=self.model_id
        )
        
        # For a hackathon, saving to a local 'static' folder is the fastest way 
        # to get a URL for your React frontend.
        file_name = f"lecture_{hash(text)}.mp3"
        file_path = f"static/audio/{file_name}"
        
        with open(file_path, "wb") as f:
            for chunk in audio_iterator:
                f.write(chunk)
                
        return f"/static/audio/{file_name}"

audio_service = eleven_labs()