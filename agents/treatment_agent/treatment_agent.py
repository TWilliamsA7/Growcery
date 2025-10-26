import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

import uvicorn
from google.adk import Agent
from google.adk.cli.fast_api import get_fast_api_app
from gemini_util import call_gemini


def treat(type: str, name: str = "", disease: str = "", prompt: str = "", **kwargs) -> str:
    """
    Suggest treatment options for diseased crops.
    
    Args:
        type: The type of item
        name: The name of the item
        disease: The identified disease
        prompt: Custom prompt (optional)
        
    Returns:
        Treatment recommendations
    """
    if not prompt:
        prompt = f"Suggest treatment options for {name} with {disease}."
    return call_gemini(prompt)


# Create the root agent
root_agent = Agent(
    name="treatment_agent",
    instruction="You provide treatment recommendations for diseased crops using the treat tool.",
    tools=[treat]
)


if __name__ == "__main__":
    # Create FastAPI app
    AGENT_DIR = os.path.dirname(os.path.abspath(__file__))
    
    app = get_fast_api_app(
        agents_dir=AGENT_DIR,
        session_service_uri="sqlite:///treatment_agent.db",
        allow_origins=["*"],
        web=False
    )
    
    # Run the server
    uvicorn.run(app, host="0.0.0.0", port=8005)