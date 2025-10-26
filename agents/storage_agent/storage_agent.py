import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

import uvicorn
from google.adk import Agent
from google.adk.cli.fast_api import get_fast_api_app
from gemini_util import call_gemini


def store(type: str, name: str = "", prompt: str = "", **kwargs) -> str:
    """
    Determine storage location for produce.
    
    Args:
        type: The type of item
        name: The name of the item
        prompt: Custom prompt (optional)
        
    Returns:
        Storage location (Refrigerator, Freezer, or Pantry)
    """
    if not prompt:
        prompt = f"Decide if {name} should go in the Refrigerator, Freezer, or Pantry. Return one word only."
    return call_gemini(prompt)


# Create the root agent
root_agent = Agent(
    name="storage_agent",
    instruction="You determine storage locations for produce using the store tool.",
    tools=[store]
)


if __name__ == "__main__":
    # Create FastAPI app
    AGENT_DIR = os.path.dirname(os.path.abspath(__file__))
    
    app = get_fast_api_app(
        agents_dir=AGENT_DIR,
        session_service_uri="sqlite:///storage_agent.db",
        allow_origins=["*"],
        web=False
    )
    
    # Run the server
    uvicorn.run(app, host="0.0.0.0", port=8004)