import os
import json
import logging
from fastapi import FastAPI, File, UploadFile, Form
from fastapi.responses import JSONResponse
from flask import Flask, request, jsonify
from google import genai
from google.genai import types

# --- Configuration for Logging ---
# Set up a basic configuration for the logger
logging.basicConfig(
    level=logging.INFO, # Change to logging.DEBUG for more verbose output
    format='%(asctime)s - %(levelname)s - %(message)s',
    datefmt='%H:%M:%S'
)
logger = logging.getLogger(__name__)

# --- Configuration for Gemini Client ---
try:
    # Ensure your GEMINI_API_KEY is set as an environment variable
    client = genai.Client()
    logger.info("Gemini client initialized successfully.")
except Exception as e:
    logger.error(f"Error initializing Gemini client: {e}")
    logger.critical("Please ensure your GEMINI_API_KEY is set correctly.")
    exit()

def create_multimodal_prompt(
    image_path: str,
    json_path: str,
    location: str,
    item_type: str,
    user_prompt: str,
    model_name: str = 'gemini-2.5-flash'
):
    """
    Creates a multimodal prompt for the Gemini model and prints the string response.
    """
    logger.info(f"Starting multimodal request to model: {model_name}")

    # 1. Prepare the Image Part (PNG)
    logger.info(f"Processing image file: {image_path}")
    try:
        with open(image_path, 'rb') as f:
            image_bytes = f.read()
        image_part = types.Part.from_bytes(
            data=image_bytes,
            mime_type='image/png'
        )
        logger.info("Image successfully converted to Part object.")
    except FileNotFoundError:
        logger.error(f"Image file not found at {image_path}")
        return
    except Exception as e:
        logger.error(f"Error processing image: {e}")
        return
    
    # 2. Prepare the JSON Data Part (CORRECTED LINE)
    logger.info(f"Processing JSON file: {json_path}")
    try:
        with open(json_path, 'r') as f:
            data = json.load(f)
        json_string = json.dumps(data, indent=2)
        
        # CORRECTED: Pass the string directly. The API handles conversion to Part.
        json_part = f"### JSON Data:\n{json_string}"
        
        logger.info("JSON data successfully loaded and formatted.")
    except FileNotFoundError:
        logger.error(f"JSON file not found at {json_path}")
        return
    except json.JSONDecodeError:
        logger.error(f"Invalid JSON format in {json_path}")
        return

    # 3. Prepare the String Parts (CORRECTED LINES)
    # CORRECTED: Pass the strings directly.
    location_part = f"### Location:\n{location}"
    type_part = f"### Item Type:\n{item_type}"
    prompt_part = f"### Your Task:\n{user_prompt}"

    logger.info(f"Context strings prepared: Location='{location}', Type='{item_type}'.")

    # 4. Assemble all parts into the `contents` list
    # The image_part is still a Part object, the others are now simple strings.
    contents = [
        image_part,
        json_part,
        location_part,
        type_part,
        prompt_part
    ]
    logger.debug(f"Total parts in contents list: {len(contents)}")

    # 5. Call the Gemini API
    logger.info("Sending request to Gemini API...")
    try:
        response = client.models.generate_content(
            model=model_name,
            contents=contents
        )
        logger.info("Response received from Gemini API.")

        # 6. Print the final string output to the terminal
        print("\n" + "="*50)
        print("                 ✨ Model Response ✨")
        print("="*50)
        print(response.text)
        print("="*50 + "\n")

    except Exception as e:
        logger.error(f"An error occurred during API call: {e}")

# --- Example Setup (Creating dummy files for demonstration) ---

DUMMY_IMAGE_PATH = 'img.jpg'
DUMMY_JSON_PATH = 'sample_data.json'

# Placeholder for image file
if not os.path.exists(DUMMY_IMAGE_PATH):
    with open(DUMMY_IMAGE_PATH, 'w') as f:
        f.write('Placeholder for JPG')
    logger.warning(f"Created a placeholder file at {DUMMY_IMAGE_PATH}. Replace with a real PNG.")

# 2. Define your inputs
my_location = "Orlando"
my_item_type = "Crop"
my_prompt = "You are an AI vision reasoning model that refines an AMD-accelerated classification output. You are receiving a(n) ${my_item_type}, a JSON of class probabilities from the AMD inference model, and an image of the object. Determine the single most likely object name (e.g. 'cucumber', 'avocado', 'tomato plant', 'apple', 'wheat plant') by combining the image and probabilities. Ignore any descriptors related to condition, health, or quality such as 'rotten', 'healthy', 'diseased', 'fresh', or similar-only return the base type of crop or produce. Ensure the object name follows English grammatical rules for nouns (e.g. 'tomato plant' not 'plant tomato'). Output only a single plain string representing the object name, with spaces for multi-word names. Do NOT include reasoning, explanations, formatting, markdown, or extra keys. DO NOT say anything other than the string of the object name. Do NOT duplicate the string. Type: ${my_item_type}. JSON and image attached."

# 3. Run the function
create_multimodal_prompt(
    image_path=DUMMY_IMAGE_PATH,
    json_path=DUMMY_JSON_PATH,
    location=my_location,
    item_type=my_item_type,
    user_prompt=my_prompt
)

app = Flask(__name__)

@app.route("/analyze", methods=["POST"])
def analyze():
    """
    Exposes an endpoint that accepts an image + JSON + metadata.
    Calls your existing create_multimodal_prompt() function.
    """
    try:
        # Get form-data fields
        image_file = request.files.get("image")
        json_file = request.files.get("json")
        location = request.form.get("location", "Unknown")
        item_type = request.form.get("item_type", "Unknown")
        user_prompt = request.form.get("user_prompt", "No prompt provided")

        if not image_file or not json_file:
            return jsonify({"error": "Both image and JSON files are required"}), 400

        # Save temporary copies
        image_path = "uploaded_image.png"
        json_path = "uploaded_data.json"
        image_file.save(image_path)
        json_file.save(json_path)

        # Call your existing function (which runs Gemini)
        create_multimodal_prompt(
            image_path=image_path,
            json_path=json_path,
            location=location,
            item_type=item_type,
            user_prompt=user_prompt
        )

        return jsonify({"status": "success", "message": "Gemini prompt executed."})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    # Run Flask app
    app.run(host="0.0.0.0", port=5000, debug=True)