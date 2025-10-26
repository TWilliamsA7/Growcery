import shutil
from flask import Flask, request, jsonify
import requests
import json
import os

app = Flask(__name__)

# A2A call helper
def call_agent(url, method, params):
    payload = {
        "jsonrpc": "2.0",
        "method": method,
        "params": params,
        "id": 1
    }
    response = requests.post(url, json=payload)
    return response.json()["result"]

# Orchestrator endpoint
@app.route("/rpc", methods=["POST"])
def orchestrator_rpc():
    req = request.get_json()
    method = req.get("method")
    params = req.get("params", {})
    req_id = req.get("id")

    if method == "orchestrate":
        MASTER_FILE_PATH = os.path.join(os.path.dirname(__file__), '..', 'skeleton_master.json')
        WORKING_FILE_PATH = os.path.join(os.path.dirname(__file__), 'skeleton_working.json')
        PROMPT_FILE_PATH = os.path.join(os.path.dirname(__file__), '..', 'prompts.json')

        # 2. Copy the master file to the working file
        shutil.copy(MASTER_FILE_PATH, WORKING_FILE_PATH)

        # 3. Open and load the WORKING file
        with open(WORKING_FILE_PATH, 'r') as f:
            data = json.load(f)

        data.user_type = params.type
        data.location = params.location

        # classification agent
        data.name = call_agent("http://localhost:8001/rpc", params.type, params) # CHANGE PORT LATER

        params.name = data.name

        # attribute agent
        data.attributes = call_agent("http://localhost:8002/rpc", params.type, params) # how to include name in the params?

        params.attributes = data.attributes
    
        data.health, data.disease = call_agent("http://localhost:8003/rpc", params.type, params)

        # storage agent
        data.storage = call_agent("http://localhost:8004/rpc", params.type, data)

        # treatment agent
        if (data.health == "Diseased"):
            data.treatment = call_agent("http://localhost:8005/rpc", params.type, data)

        params = {
            "name": data.name,
            "location": data.location,
            "attributes": data.attributes,
            "prompt": PROMPT_FILE_PATH.date_prediction[data.user_type]
        }

        # expiration/harvest date agent
        data.date = call_agent("http://localhost:8006/rpc", data.user_type, data) # CHANGE PORT LATER 

        data.physical_qualities = call_agent("http://localhost:8007/rpc", data.user_type, data)


        return jsonify({
            "jsonrpc": "2.0",
            "id": req_id,
            "result": data
        })

    return jsonify({
        "jsonrpc": "2.0",
        "id": req_id,
        "error": "Unknown method"
    })

if __name__ == "__main__":
    app.run(port=8009)