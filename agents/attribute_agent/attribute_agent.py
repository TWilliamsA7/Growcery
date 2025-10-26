import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

import uvicorn
from fastapi import FastAPI
from pydantic import BaseModel
from gemini_util import call_gemini

app = FastAPI()

class AttributeRequest(BaseModel):
    type: str
    name: str = ""
    prompt: str = ""

@app.post("/attributes")
async def attributes(request: AttributeRequest):
    """
    Get notable non-visible attributes for an item.
    """
    prompt = request.prompt if request.prompt else f"List notable non-visible attributes for {request.name}."
    result = call_gemini(prompt)
    return {"attributes": result}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8002)