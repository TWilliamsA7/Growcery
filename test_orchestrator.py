#!/usr/bin/env python3
"""
Test script for the orchestrator API
Usage: python test_orchestrator.py [path_to_image.jpg]
"""

import requests
import json
import base64
import sys
from pathlib import Path


def test_orchestrator(image_path=None, user_type="farmer", location="Florida, USA"):
    """
    Test the orchestrator endpoint with optional image
    
    Args:
        image_path: Path to image file (optional)
        user_type: "farmer" or "consumer"
        location: Location string
    """
    # Prepare the payload
    payload = {
        "type": user_type,
        "location": location,
        "image": ""
    }
    
    # If image provided, encode it
    if image_path:
        image_file = Path(image_path)
        if not image_file.exists():
            print(f"Error: Image file not found: {image_path}")
            return
        
        print(f"Reading image: {image_path}")
        with open(image_file, "rb") as f:
            image_data = base64.b64encode(f.read()).decode('utf-8')
            payload["image"] = image_data
            print(f"Image encoded: {len(image_data)} characters")
    
    # Make the request
    url = "http://localhost:8009/orchestrate"
    print(f"\nSending request to: {url}")
    print(f"Payload type: {payload['type']}")
    print(f"Payload location: {payload['location']}")
    print(f"Image included: {'Yes' if payload['image'] else 'No'}")
    print("\nWaiting for response...\n")
    
    try:
        response = requests.post(
            url,
            json=payload,  # Use json parameter, not data
            timeout=60  # Give it time to process
        )
        
        print(f"Status Code: {response.status_code}")
        print("-" * 50)
        
        if response.status_code == 200:
            result = response.json()
            print("✓ SUCCESS!")
            print("\nOrchestration Result:")
            print(json.dumps(result, indent=2))
            
            # Save to file
            with open("orchestration_result.json", "w") as f:
                json.dump(result, f, indent=2)
            print("\n✓ Result saved to orchestration_result.json")
            
        else:
            print("✗ ERROR!")
            print(f"Response: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print("✗ ERROR: Could not connect to orchestrator")
        print("Make sure the orchestrator is running on port 8009")
    except requests.exceptions.Timeout:
        print("✗ ERROR: Request timed out")
        print("The orchestrator is taking too long to respond")
    except Exception as e:
        print(f"✗ ERROR: {e}")


def test_without_image():
    """Test with no image (will fail classification but tests the flow)"""
    print("=" * 50)
    print("TEST 1: Without Image")
    print("=" * 50)
    test_orchestrator(user_type="farmer", location="Florida, USA")


def test_with_image(image_path):
    """Test with an actual image"""
    print("\n" + "=" * 50)
    print("TEST 2: With Image")
    print("=" * 50)
    test_orchestrator(
        image_path=image_path,
        user_type="farmer",
        location="Florida, USA"
    )


def check_agents_running():
    """Check if all agents are running"""
    print("Checking if agents are running...\n")
    
    agents = {
        "Classifier": "http://localhost:8001",
        "Attribute": "http://localhost:8002",
        "Health": "http://localhost:8003",
        "Storage": "http://localhost:8004",
        "Treatment": "http://localhost:8005",
        "Date": "http://localhost:8006",
        "Physical": "http://localhost:8007",
        "Orchestrator": "http://localhost:8009"
    }
    
    all_running = True
    for name, url in agents.items():
        try:
            # Try to connect (most agents have /docs endpoint from FastAPI)
            response = requests.get(f"{url}/docs", timeout=1)
            status = "✓ Running" if response.status_code == 200 else "⚠ Unknown"
        except requests.exceptions.ConnectionError:
            status = "✗ Not running"
            all_running = False
        except:
            status = "⚠ Unknown"
        
        print(f"{name:15} {url:25} {status}")
    
    print()
    return all_running


if __name__ == "__main__":
    print("=" * 50)
    print("ORCHESTRATOR TEST SCRIPT")
    print("=" * 50)
    print()
    
    # Check if agents are running
    if not check_agents_running():
        print("WARNING: Not all agents appear to be running!")
        print("Run: cd agents && ./start_all_agents.sh")
        print()
    
    # Run tests
    if len(sys.argv) > 1:
        # Image path provided
        image_path = sys.argv[1]
        test_with_image(image_path)
    else:
        # No image provided
        print("Usage: python test_orchestrator.py [path_to_image.jpg]")
        print("Running without image for basic test...\n")
        test_without_image()
        print("\nTip: Provide an image path for full test:")
        print("  python test_orchestrator.py /path/to/crop_image.jpg")