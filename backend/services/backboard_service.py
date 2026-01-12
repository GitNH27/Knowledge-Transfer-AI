# Core Backboard client initialization and assistant/thread management
import os
from backboard import BackboardClient
from dotenv import load_dotenv

load_dotenv()

# Initialize the Backboard client

api_key=os.getenv("BACKBOARD_API_KEY")
if not api_key:
    raise ValueError(
        "BACKBOARD_API_KEY not found in environment variables. "
    )

client = BackboardClient(api_key=api_key)

async def create_assistant(name: str, description: str = None):
    """
    Create an assistant - from quickstart first-message.py
    Returns an assistant object with assistant_id
    """
    assistant = await client.create_assistant(
        name=name,
        description=description or "A helpful assistant"
    )
    return assistant

async def create_thread(assistant_id: str):
    """
    Create a thread - from quickstart first-message.py
    Returns a thread object with thread_id
    """
    thread = await client.create_thread(assistant_id)
    return thread

async def get_assistant(assistant_id: str):
    """Get an existing assistant by ID."""
    return await client.get_assistant(assistant_id)
