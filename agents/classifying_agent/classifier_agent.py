import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

import uvicorn
from google.adk import Agent
from google.adk.cli.fast_api import get_fast_api_app
import requests

# --- Gemini API setup ---
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent"


def classify(type: str, image: str = "", prompt: str = "", **kwargs) -> str:
    """
    Classify an image of produce or crop using Gemini vision.
    
    Args:
        type: The type of item being classified
        image: Base64-encoded image data
        prompt: Custom classification prompt (optional)
        
    Returns:
        The identified crop or produce name
    """
    if not prompt:
        prompt = "Identify this crop or produce."
    
    if not image:
        return "No image provided"

    # Prepare Gemini request
    body = {
        "contents": [
            {
                "parts": [
                    {"text": prompt},
                    {"inline_data": {"mime_type": "image/jpeg", "data": image}}
                ]
            }
        ]
    }

    try:
        response = requests.post(
            f"{GEMINI_URL}?key={GEMINI_API_KEY}",
            headers={"Content-Type": "application/json"},
            json=body,
        )
        result = response.json()

        # Extract the text classification result
        text_output = result["candidates"][0]["content"]["parts"][0]["text"]
        return text_output.strip()

    except Exception as e:
        print("Error during classification:", e)
        return "Unknown"


# Create the root agent
root_agent = Agent(
    name="classifier_agent",
    instruction="You classify images of produce and crops using the classify tool.",
    tools=[classify]
)


if __name__ == "__main__":
    # Create FastAPI app
    AGENT_DIR = os.path.dirname(os.path.abspath(__file__))
    
    app = get_fast_api_app(
        agents_dir=AGENT_DIR,
        session_service_uri="sqlite:///classifier_agent.db",
        allow_origins=["*"],
        web=False
    )
    
    # Run the server
    uvicorn.run(app, host="0.0.0.0", port=8001)