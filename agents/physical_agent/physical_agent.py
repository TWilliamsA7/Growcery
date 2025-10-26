import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

import uvicorn
from google.adk import Agent
from google.adk.cli.fast_api import get_fast_api_app
from gemini_util import call_gemini


def physical_qualities(user_type: str, name: str = "", prompt: str = "", **kwargs) -> str:
    """
    Describe physical qualities to identify good produce.
    
    Args:
        user_type: The type of user
        name: The name of the item
        prompt: Custom prompt (optional)
        
    Returns:
        Description of physical qualities
    """
    if not prompt:
        prompt = f"Describe physical qualities to identify a good {name}."
    return call_gemini(prompt)


# Create the root agent
root_agent = Agent(
    name="physical_agent",
    instruction="You describe physical qualities of produce using the physical_qualities tool.",
    tools=[physical_qualities]
)


if __name__ == "__main__":
    # Create FastAPI app
    AGENT_DIR = os.path.dirname(os.path.abspath(__file__))
    
    app = get_fast_api_app(
        agents_dir=AGENT_DIR,
        session_service_uri="sqlite:///physical_agent.db",
        allow_origins=["*"],
        web=False
    )
    
    # Run the server
    uvicorn.run(app, host="0.0.0.0", port=8007)