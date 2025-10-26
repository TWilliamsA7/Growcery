import os
from google.adk.a2a.utils.agent_to_a2a import to_a2a
from orchestrator_agent import call_agent

PROMPT_FILE_PATH = os.path.join(os.path.dirname(__file__), '..', 'prompts.json')

import json

with open(PROMPT_FILE_PATH) as f:
    prompts = json.load(f)

type_value;
instruction = prompts["classifying"].replace("${type}", type_value)

root_agent = Agent(
    model='gemini-2.0-flash',
    name='hello_world_agent',
    instruction=instruction
)

call_agent()

# Make your agent A2A-compatible
a2a_app = to_a2a(root_agent, port=8001, agent_card="../orchestrator/agent_card.json")