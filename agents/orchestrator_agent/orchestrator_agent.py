"""
orchestrator_agent.py
"""

import os
import shutil
import json
import uvicorn
from fastapi import FastAPI
from pydantic import BaseModel
from google.adk.agents.remote_a2a_agent import RemoteA2aAgent, AGENT_CARD_WELL_KNOWN_PATH
from datetime import datetime
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize A2A clients for downstream agents
classifier_client = RemoteA2aAgent(
    name="classifier_agent",
    description="Agent that classifies items",
    agent_card=f"http://localhost:8001{AGENT_CARD_WELL_KNOWN_PATH}"
)

attribute_client = RemoteA2aAgent(
    name="attribute_agent",
    description="Agent that extracts attributes",
    agent_card=f"http://localhost:8002{AGENT_CARD_WELL_KNOWN_PATH}"
)

health_client = RemoteA2aAgent(
    name="health_agent",
    description="Agent that assesses health and disease",
    agent_card=f"http://localhost:8003{AGENT_CARD_WELL_KNOWN_PATH}"
)

storage_client = RemoteA2aAgent(
    name="storage_agent",
    description="Agent that determines storage requirements",
    agent_card=f"http://localhost:8004{AGENT_CARD_WELL_KNOWN_PATH}"
)

treatment_client = RemoteA2aAgent(
    name="treatment_agent",
    description="Agent that provides treatment recommendations",
    agent_card=f"http://localhost:8005{AGENT_CARD_WELL_KNOWN_PATH}"
)

date_client = RemoteA2aAgent(
    name="date_agent",
    description="Agent that determines expiration or harvest dates",
    agent_card=f"http://localhost:8006{AGENT_CARD_WELL_KNOWN_PATH}"
)

physical_client = RemoteA2aAgent(
    name="physical_agent",
    description="Agent that assesses physical qualities",
    agent_card=f"http://localhost:8007{AGENT_CARD_WELL_KNOWN_PATH}"
)

# Create FastAPI app
app = FastAPI()

class OrchestrateRequest(BaseModel):
    type: str
    location: str
    image: str = ""

@app.post("/orchestrate")
async def orchestrate(request: OrchestrateRequest):
    """
    Main orchestrator endpoint.
    """
    logger.info(f"Starting orchestration for type={request.type}, location={request.location}")
    
    MASTER_FILE_PATH = os.path.join(os.path.dirname(__file__), '..', 'skeleton.json')
    WORKING_FILE_PATH = os.path.join(os.path.dirname(__file__), 'skeleton_working.json')
    
    shutil.copy(MASTER_FILE_PATH, WORKING_FILE_PATH)
    with open(WORKING_FILE_PATH, 'r') as f:
        data = json.load(f)

    params = {"type": request.type, "location": request.location, "image": request.image}
    
    # Update working data
    data["user_type"] = request.type
    data["location"] = request.location

    # Call agents through A2A
    logger.info("Calling classifier agent...")
    data["name"] = classifier_client.call(request.type, params)
    logger.info(f"Classifier returned: {data['name']}")
    
    params["name"] = data["name"]

    logger.info("Calling attribute agent...")
    data["attributes"] = attribute_client.call(request.type, params)
    logger.info(f"Attributes returned: {data['attributes']}")
    
    params["attributes"] = data["attributes"]

    logger.info("Calling health agent...")
    health_disease = health_client.call(request.type, params)
    if isinstance(health_disease, dict):
        data["health"] = health_disease.get("health")
        data["disease"] = health_disease.get("disease")
    else:
        data["health"], data["disease"] = health_disease
    logger.info(f"Health returned: {data['health']}, Disease: {data['disease']}")

    logger.info("Calling storage agent...")
    data["storage"] = storage_client.call(request.type, data)
    logger.info(f"Storage returned: {data['storage']}")

    if data.get("health") == "Diseased":
        logger.info("Calling treatment agent...")
        data["treatment"] = treatment_client.call(request.type, data)

    logger.info("Calling date agent...")
    data["date"] = date_client.call(data["user_type"], data)
    logger.info(f"Date returned: {data['date']}")
    
    logger.info("Calling physical agent...")
    data["physical_qualities"] = physical_client.call(data["user_type"], data)
    logger.info(f"Physical qualities returned: {data['physical_qualities']}")
    
    data["meta"] = {"orchestrated_at": datetime.utcnow().isoformat()}
    
    logger.info("Orchestration complete!")
    return data


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8009)