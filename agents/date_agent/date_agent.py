import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

import uvicorn
from google.adk import Agent
from google.adk.cli.fast_api import get_fast_api_app
from gemini_util import call_gemini


def date(user_type: str, name: str = "", prompt: str = "", **kwargs) -> str:
    """
    Estimate harvest date or expiration date for produce.
    
    Args:
        user_type: Type of user (e.g., "farmer" or "consumer")
        name: The name of the item
        prompt: Custom prompt (optional)
        
    Returns:
        Estimated date information
    """
    if not prompt:
        date_type = 'harvest date' if user_type == 'farmer' else 'expiration date'
        prompt = f"Estimate {date_type} for {name}."
    return call_gemini(prompt)


# Create the root agent
root_agent = Agent(
    name="date_agent",
    instruction="You estimate harvest dates or expiration dates for produce using the date tool.",
    tools=[date]
)


if __name__ == "__main__":
    # Create FastAPI app
    AGENT_DIR = os.path.dirname(os.path.abspath(__file__))
    
    app = get_fast_api_app(
        agents_dir=AGENT_DIR,
        session_service_uri="sqlite:///date_agent.db",
        allow_origins=["*"],
        web=False
    )
    
    # Run the server
    uvicorn.run(app, host="0.0.0.0", port=8006)