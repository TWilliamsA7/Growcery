import torch
import torchvision.models as models
import torchvision.transforms as transforms
from PIL import Image # Pillow library for image loading
import time
import json
import os
import numpy as np
from collections import OrderedDict # Import OrderedDict
import sys
import traceback

# --------------------------------------------------------------------------------------
# --- Configuration (MobileNet / Produce) ---
# NOTE: Paths match your successful run output: "model/produce/mobilenetv3small_produce.pth"
STATE_DICT_PATH = "model/produce/mobilenetv3small_produce.pth"
CLASS_NAMES_FILE = "model/class_names_produce.txt"
IMAGE_PATH = "assets/cucumber3.jpeg"
# --------------------------------------------------------------------------------------
# Standard ImageNet preprocessing values
IMG_SIZE = (256, 256)
MEAN = [0.485, 0.456, 0.406]
STD = [0.229, 0.224, 0.225]
NUM_RUNS = 5

print("--- PyTorch Inference Script (MobileNetV3-Small / Produce) ---")


# --- Step 1: Set Device (Attempt ROCm GPU) ---
if torch.cuda.is_available():
    device = torch.device("cuda:0")
    try:
        gpu_name = torch.cuda.get_device_name(0)
        print(f"✅ ROCm GPU ({gpu_name}) found. Using GPU.")
    except Exception as e:
        print(f"✅ ROCm GPU found, but couldn't get name. Using GPU. Error: {e}")
        device = torch.device("cuda:0")
else:
    # Fallback to CPU if ROCm isn't working
    print("⚠️ ROCm GPU not found or PyTorch ROCm setup failed. Using CPU.")
    device = torch.device("cpu")

# --- Step 2: Load Class Names ---
try:
    with open(CLASS_NAMES_FILE, "r") as f:
        CLASS_NAMES = [line.strip() for line in f]
    NUM_CLASSES = len(CLASS_NAMES)
    print(f"Loaded {NUM_CLASSES} class names from {CLASS_NAMES_FILE}.")
except FileNotFoundError:
    print(f"❌ ERROR: Class names file not found at {CLASS_NAMES_FILE}")
    sys.exit(1)
except Exception as e:
    print(f"❌ ERROR: Could not read class names file: {e}")
    sys.exit(1)

# --- Step 3: Load Model Architecture & Modify Classifier ---
print("Loading MobileNetV3-Small model architecture...")
try:
    # Load MobileNetV3-Small architecture (use models.mobilenet_v3_small)
    model = models.mobilenet_v3_small(weights=None) # Load structure only

    # Get the number of input features for the LAST classifier layer
    # Index 3 is standard for MobileNetV3-Small's final linear layer
    num_ftrs = model.classifier[3].in_features

    # Replace the LAST layer to match your number of classes
    model.classifier[3] = torch.nn.Linear(num_ftrs, NUM_CLASSES)
    print(f"Model classifier head modified for {NUM_CLASSES} classes.")

except Exception as e:
    print(f"❌ ERROR: Could not load or modify model architecture: {e}")
    sys.exit(1)

# --- Step 4: Load Your State Dictionary ---
print(f"Loading state dictionary from: {STATE_DICT_PATH}")
try:
    # Load the state dict to CPU first for safety/inspection
    state_dict = torch.load(STATE_DICT_PATH, map_location=torch.device('cpu'))

    # Clean up keys if needed (e.g., remove "module." prefix)
    new_state_dict = OrderedDict()
    for k, v in state_dict.items():
        name = k.replace("module.", "")
        new_state_dict[name] = v

    # Load the adjusted state dict into the model architecture
    missing_keys, unexpected_keys = model.load_state_dict(new_state_dict, strict=True)
    if missing_keys:
        print(f"⚠️ Warning: Missing keys when loading state_dict: {missing_keys}")
    if unexpected_keys:
        print(f"⚠️ Warning: Unexpected keys when loading state_dict: {unexpected_keys}")
    print("State dictionary loaded successfully.")

except FileNotFoundError:
    print(f"❌ ERROR: State dictionary file not found at {STATE_DICT_PATH}")
    sys.exit(1)
except Exception as e:
    # Attempt strict=False fallback if strict=True fails
    print(f"❌ ERROR: Could not load state dictionary with strict=True: {e}")
    print("    Attempting to load with strict=False (may hide issues)...")
    try:
        missing_keys, unexpected_keys = model.load_state_dict(new_state_dict, strict=False)
        if missing_keys:
            print(f"⚠️ Warning (strict=False): Missing keys: {missing_keys}")
        if unexpected_keys:
            print(f"⚠️ Warning (strict=False): Unexpected keys: {unexpected_keys}")
        print("State dictionary loaded with strict=False.")
    except Exception as e2:
        print(f"❌ ERROR: Could not load state dictionary even with strict=False: {e2}")
        sys.exit(1)


# --- Step 5: Set Model to Eval Mode and Move to Selected Device ---
model.eval()
model.to(device)
print(f"Model moved to {device} and set to evaluation mode.")

# --- Step 6: Define Image Preprocessing Pipeline ---
preprocess = transforms.Compose([
    transforms.Resize(IMG_SIZE),
    transforms.ToTensor(),
    transforms.Normalize(mean=MEAN, std=STD)
])
print("Image preprocessing pipeline defined.")

# --- Step 7: Load and Preprocess the Image ---
print(f"Loading and preprocessing image: {IMAGE_PATH}")
try:
    img_pil = Image.open(IMAGE_PATH).convert('RGB')
    img_tensor = preprocess(img_pil)
    img_batch = img_tensor.unsqueeze(0)
    img_batch = img_batch.to(device)
    print("Image loaded, preprocessed, and moved to device.")
except FileNotFoundError:
    print(f"❌ ERROR: Image file not found at {IMAGE_PATH}")
    sys.exit(1)
except Exception as e:
    print(f"❌ ERROR: Could not load or preprocess image: {e}")
    sys.exit(1)

# --- Step 8: Run Inference with Warm-up and Loop ---
print(f"\nRunning Inference on {device}...")
try:
    # --- WARM-UP RUN ---
    print("Performing warm-up inference run...")
    with torch.no_grad():
        _ = model(img_batch)
    print("Warm-up complete.")

    # --- TIMED RUNS ---
    latencies = []
    outputs = None
    print(f"Performing {NUM_RUNS} timed inference runs...")
    for i in range(NUM_RUNS):
        start = time.time()
        with torch.no_grad():
            outputs = model(img_batch) # Perform inference
        # Synchronize GPU/ROCm time if running on GPU
        if device.type == 'cuda':
            torch.cuda.synchronize()
        latency = (time.time() - start) * 1000.0
        latencies.append(latency)

    # --- Calculate Average Latency ---
    avg_latency = np.mean(latencies)
    print(f"\nLatencies (ms): {[round(l, 2) for l in latencies]}")
    print(f"Average latency over {NUM_RUNS} runs: {round(avg_latency, 2)} ms")

    # --- Process the LAST output for results ---
    if outputs is None:
        raise RuntimeError("Inference did not produce output.")

    probabilities = torch.nn.functional.softmax(outputs[0], dim=0)
    confidence, pred_idx = torch.max(probabilities, 0)

    confidence_cpu = confidence.cpu().item()
    pred_idx_cpu = pred_idx.cpu().item()
    probabilities_cpu = probabilities.cpu().numpy()

    result = {
        "predictions": {CLASS_NAMES[i]: float(probabilities_cpu[i]) for i in range(NUM_CLASSES)},
        "top_class": CLASS_NAMES[pred_idx_cpu],
        "confidence": float(confidence_cpu),
        "latency_ms": round(avg_latency, 2)
    }
    print("\nInference Result (from last run):")
    print(json.dumps(result, indent=2))
    print(f"✅ Inference on {device} completed successfully.")

except Exception as e:
    print(f"❌ ERROR during inference: {e}")
    traceback.print_exc()

print("\n--- End Script ---")