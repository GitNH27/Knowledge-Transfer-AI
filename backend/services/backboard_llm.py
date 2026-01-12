# LLM operations, message handling, tool calls, and memory
import json
from typing import AsyncIterator, List, Dict, Optional
from services.backboard_service import client

async def send_message_streaming(
    thread_id: str,
    content: str,
    llm_provider: str = "openai",
    model_name: str = "gpt-4o"
) -> AsyncIterator[str]:
    """
    Send a message with streaming response.
    From quickstart first-message.py
    
    Args:
        thread_id: The thread ID to send the message to
        content: The message content
        llm_provider: LLM provider (e.g., "openai")
        model_name: Model name (e.g., "gpt-4o")
    
    Yields:
        Chunks of content as they arrive
    """
    async for chunk in await client.add_message(
        thread_id=thread_id,
        content=content,
        llm_provider=llm_provider,
        model_name=model_name,
        stream=True
    ):
        if chunk['type'] == 'content_streaming':
            yield chunk['content']
        elif chunk['type'] == 'message_complete':
            break

async def send_message(
    thread_id: str,
    content: str,
    llm_provider: str = "openai",
    model_name: str = "gpt-4o",
    memory: Optional[str] = None
):
    """
    Send a message without streaming (returns full response).
    From quickstart first-message.py and memory.py
    
    Args:
        thread_id: The thread ID
        content: The message content
        llm_provider: LLM provider
        model_name: Model name
        memory: Memory mode ("Auto" for persistent memory, None for no memory)
    
    Returns:
        Response object with .content attribute
    """
    response = await client.add_message(
        thread_id=thread_id,
        content=content,
        llm_provider=llm_provider,
        model_name=model_name,
        memory=memory,
        stream=False
    )
    return response

async def send_message_with_tools(
    thread_id: str,
    content: str,
    tools: List[Dict],
    llm_provider: str = "openai",
    model_name: str = "gpt-4o"
):
    """
    Send message with tool calls support.
    From quickstart tool-calls.py
    
    Args:
        thread_id: The thread ID
        content: The message content
        tools: List of tool definitions
        llm_provider: LLM provider
        model_name: Model name
    
    Returns:
        Final response after tool execution
    """
    response = await client.add_message(
        thread_id=thread_id,
        content=content,
        stream=False
    )
    
    # Check if the assistant requires action (tool call)
    if response.status == "REQUIRES_ACTION" and response.tool_calls:
        tool_outputs = []
        
        # Process each tool call
        for tc in response.tool_calls:
            if tc.function.name == "get_current_weather":
                # Get parsed arguments (required parameters are guaranteed by API)
                args = tc.function.parsed_arguments
                location = args["location"]
                
                # Execute your function and format the output
                weather_data = {
                    "temperature": "68°F",
                    "condition": "Sunny",
                    "location": location
                }
                
                tool_outputs.append({
                    "tool_call_id": tc.id,
                    "output": json.dumps(weather_data)
                })
        
        # Submit the tool outputs back to continue the conversation
        final_response = await client.submit_tool_outputs(
            thread_id=thread_id,
            run_id=response.run_id,
            tool_outputs=tool_outputs
        )
        
        return final_response
    
    return response

async def send_message_with_memory(
    thread_id: str,
    content: str,
    memory: str = "Auto",
    llm_provider: str = "openai",
    model_name: str = "gpt-4o"
):
    """
    Send message with persistent memory enabled.
    From quickstart memory.py
    
    Args:
        thread_id: The thread ID
        content: The message content
        memory: Memory mode ("Auto" to automatically save and retrieve context)
        llm_provider: LLM provider
        model_name: Model name
    
    Returns:
        Response object with .content attribute
    """
    response = await client.add_message(
        thread_id=thread_id,
        content=content,
        memory=memory,
        stream=False
    )
    return response
