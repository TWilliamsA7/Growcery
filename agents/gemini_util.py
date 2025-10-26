import os
import requests

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent"

def call_gemini(prompt: str, image: str = None) -> str:
    """
    Sends a prompt (and optional base64 image) to Gemini and returns its response text.
    """
    parts = [{"text": prompt}]
    if image:
        parts.append({"inline_data": {"mime_type": "image/jpeg", "data": image}})

    body = {"contents": [{"parts": parts}]}

    response = requests.post(
        f"{GEMINI_URL}?key={GEMINI_API_KEY}",
        headers={"Content-Type": "application/json"},
        json=body
    )

    result = response.json()
    
    # Debug: print the full response
    print(f"Gemini API response: {result}")
    
    # Check for errors
    if "error" in result:
        error_msg = result["error"].get("message", "Unknown error")
        raise Exception(f"Gemini API error: {error_msg}")
    
    if "candidates" not in result:
        raise Exception(f"Unexpected Gemini response format: {result}")
    
    return result["candidates"][0]["content"]["parts"][0]["text"].strip()