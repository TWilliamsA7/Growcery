import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

import uvicorn
import json
from google.adk import Agent
from google.adk.cli.fast_api import get_fast_api_app
from gemini_util import call_gemini


def health(type: str, image: str = "", prompt: str = "", **kwargs) -> dict:
    """
    Determine crop health and identify any diseases.
    
    Args:
        type: The type of item
        image: Base64-encoded image data
        prompt: Custom prompt (optional)
        
    Returns:
        Dictionary with health status and disease information
    """
    if not prompt:
        prompt = "Determine crop health and disease if applicable. Respond with JSON format: {\"health\": \"...\", \"disease\": \"...\"}"
    
    result_text = call_gemini(prompt, image)

    # Expecting Gemini to respond with valid JSON
    try:
        return json.loads(result_text)
    except:
        # if Gemini returned plain text, wrap it in structure
        return {"health": result_text, "disease": "Unknown"}


# Create the root agent
root_agent = Agent(
    name="health_agent",
    instruction="You assess crop health and identify diseases using the health tool.",
    tools=[health]
)


if __name__ == "__main__":
    # Create FastAPI app
    AGENT_DIR = os.path.dirname(os.path.abspath(__file__))
    
    app = get_fast_api_app(
        agents_dir=AGENT_DIR,
        session_service_uri="sqlite:///health_agent.db",
        allow_origins=["*"],
        web=False
    )
    
    # Run the server
    uvicorn.run(app, host="0.0.0.0", port=8003)