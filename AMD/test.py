import torch
import torchvision.models as models
import torchvision.transforms as transforms
from PIL import Image
import time
import json
import numpy as np
import os
from collections import OrderedDict

# --- CONFIGURATION ---
NUM_RUNS = 20 # Increase for better average stability
WARMUP_RUNS = 5
IMG_SIZE = (256, 256)
MEAN = [0.485, 0.456, 0.406]
STD = [0.229, 0.224, 0.225]

# --- NEW IMAGE PATHS ---
PRODUCE_IMAGE_PATH = "assets/banana3.jpg" # Used for Produce models
CROP_IMAGE_PATH = "assets/corn.jpg"        # <--- SET YOUR CROP IMAGE PATH HERE
# ---------------------

# --- MODEL DEFINITIONS ---
# CORRECTED: Using models.efficientnet_v2_s and classifier_idx: 3 for the EfficientNetV2-S checkpoints
MODELS_TO_BENCHMARK = [
    {
        "name": "Produce MobileNetV3-S",
        "type": "produce",
        "model_func": models.mobilenet_v3_small,
        "state_dict_path": "model/produce/mobilenetv3small_produce.pth",
        "class_names_file": "model/produce/class_names_produce.txt",
        "classifier_idx": 3,
    },
    {
        "name": "Produce EfficientNetV2-S",
        "type": "produce",
        "model_func": models.efficientnet_v2_s, # <--- CORRECTED MODEL
        "state_dict_path": "model/produce/efficientnetv2s_best_produce.pth",
        "class_names_file": "model/produce/class_names_produce.txt",
        "classifier_idx": 1, # <--- CORRECTED INDEX for EfficientNetV2-S
    },
    {
        "name": "Crop MobileNetV3-S",
        "type": "crop",
        "model_func": models.mobilenet_v3_small,
        "state_dict_path": "model/crop/mobilenetv3small_best_crop_8020.pth",
        "class_names_file": "model/crop/class_names_crop.txt",
        "classifier_idx": 3,
    },
    {
        "name": "Crop EfficientNetV2-S",
        "type": "crop",
        "model_func": models.efficientnet_v2_s,
        "state_dict_path": "model/crop/efficientnetv2s_best_crop.pth",
        "class_names_file": "model/crop/class_names_crop.txt",
        "classifier_idx": 1, # <--- CORRECTED INDEX for EfficientNetV2-S
    },
]

# --- SETUP DEVICE (Your existing logic) ---
def setup_device():
    if torch.cuda.is_available():
        device = torch.device("cuda:0")
        try:
            gpu_name = torch.cuda.get_device_name(0)
            print(f"✅ ROCm GPU ({gpu_name}) found. Using GPU.")
        except Exception:
            print("✅ ROCm GPU found. Using GPU (Name N/A).")
            device = torch.device("cuda:0")
    else:
        print("⚠️ ROCm GPU not found. Using CPU.")
        device = torch.device("cpu")
    return device

# --- CORE BENCHMARKING FUNCTION ---
def run_benchmark(config, preprocessed_images, device):
    """Loads a model, runs timed inference, and returns latency/result."""
    
    model_name = config["name"]
    model_type = config["type"]
    print(f"\n--- Starting Benchmark: {model_name} ---")

    # Select the correct image batch based on the model type
    if model_type == 'produce':
        img_batch = preprocessed_images['produce']
        image_name = PRODUCE_IMAGE_PATH
    elif model_type == 'crop':
        img_batch = preprocessed_images['crop']
        image_name = CROP_IMAGE_PATH
    else:
        print(f"❌ ERROR: Unknown model type: {model_type}")
        return None

    # 1. Load Class Names
    try:
        with open(config["class_names_file"], "r") as f:
            class_names = [line.strip() for line in f]
        num_classes = len(class_names)
    except FileNotFoundError:
        print(f"❌ ERROR: Class names file not found at {config['class_names_file']}")
        return None
    
    # 2. Load Model Architecture & Modify Classifier
    try:
        # Initialize the base model (now correctly matching the checkpoint)
        model = config["model_func"](weights=None)
        
        # Get the last layer for feature count and replace it
        if config["model_func"] == models.mobilenet_v3_small:
            # MobileNetV3: Classifier is nn.Sequential with Linear layer at index 3
            last_layer = model.classifier[config["classifier_idx"]]
        elif config["model_func"] == models.efficientnet_v2_s:
            # EfficientNetV2-S: Classifier is nn.Sequential with Linear layer at index 3
            last_layer = model.classifier[config["classifier_idx"]]
        else:
            raise NotImplementedError("Model type modification not implemented.")

        num_ftrs = last_layer.in_features
        
        # Replace the layer with a new Linear layer for the correct number of classes
        model.classifier[config["classifier_idx"]] = torch.nn.Linear(num_ftrs, num_classes)
            
    except Exception as e:
        print(f"❌ ERROR: Could not modify model architecture: {e}")
        return None

    # 3. Load State Dictionary
    try:
        state_dict = torch.load(config["state_dict_path"], map_location=torch.device('cpu'))
        # Remove 'module.' prefix if present
        new_state_dict = OrderedDict((k.replace("module.", ""), v) for k, v in state_dict.items())
        # Load the state dict (should now match the architecture)
        model.load_state_dict(new_state_dict, strict=False)
    except Exception as e:
        print(f"❌ ERROR: Could not load state dictionary from {config['state_dict_path']}: {e}")
        return None

    # 4. Set Model to Eval Mode and Move to Device
    model.eval()
    model.to(device)

    # 5. Warm-up and Timed Runs
    with torch.no_grad():
        # WARM-UP
        for _ in range(WARMUP_RUNS):
            _ = model(img_batch) 

        # TIMED RUNS
        latencies = []
        outputs = None
        for i in range(NUM_RUNS):
            start = time.time()
            outputs = model(img_batch)
            latency = (time.time() - start) * 1000.0
            latencies.append(latency)

    # 6. Calculate Results
    avg_latency = np.mean(latencies)

    # Process the LAST output
    probabilities = torch.nn.functional.softmax(outputs[0], dim=0)
    confidence, pred_idx = torch.max(probabilities, 0)
    
    top_class = class_names[pred_idx.cpu().item()]
    
    print(f"✅ Image: {os.path.basename(image_name)} | Prediction: {top_class} (Confidence: {confidence.cpu().item():.2%})")
    print(f"✅ Avg. Latency over {NUM_RUNS} runs: {avg_latency:.2f} ms")

    return {
        "Model": model_name,
        "Test Image": os.path.basename(image_name), # Report which image was used
        "Top Prediction": top_class,
        "Avg. Latency (ms)": round(avg_latency, 2),
        "Confidence (%)": round(confidence.cpu().item() * 100, 2)
    }

# --- MAIN EXECUTION ---
if __name__ == "__main__":
    device = setup_device()

    # --- Preload and Preprocess BOTH Images ---
    preprocess = transforms.Compose([
        transforms.Resize(IMG_SIZE),
        transforms.ToTensor(),
        transforms.Normalize(mean=MEAN, std=STD)
    ])
    
    preprocessed_images = {}

    for name, path in [('produce', PRODUCE_IMAGE_PATH), ('crop', CROP_IMAGE_PATH)]:
        print(f"\n--- Loading {name.upper()} Image ({path}) ---")
        try:
            img_pil = Image.open(path).convert('RGB')
            img_tensor = preprocess(img_pil)
            img_batch = img_tensor.unsqueeze(0).to(device)
            preprocessed_images[name] = img_batch
            print(f"Image loaded and ready on {device}.")
        except FileNotFoundError:
            print(f"❌ ERROR: Image file not found at {path}. Skipping models that use this image.")
            preprocessed_images[name] = None
        except Exception as e:
            print(f"❌ ERROR: Could not load or preprocess image: {e}")
            preprocessed_images[name] = None
            
    # --- Run all Benchmarks ---
    all_results = []
    for model_config in MODELS_TO_BENCHMARK:
        # Check if the required image for this model type was successfully loaded
        if preprocessed_images.get(model_config['type']) is not None:
            result = run_benchmark(model_config, preprocessed_images, device)
            if result:
                all_results.append(result)
        else:
            print(f"\n--- Skipping Benchmark: {model_config['name']} (Missing required {model_config['type']} image) ---")


    # --- Display Results ---
    print("\n" + "="*85)
    print("                      ✨ ROCm GPU Inference Benchmark Results (Final) ✨")
    print("="*85)
    
    if all_results:
        # Simple table printing
        header = "| Model | Test Image | Avg. Latency (ms) | Confidence (%) | Top Prediction |"
        separator = "|:" + "-:"*4 + "|:--|"
        print(header)
        print(separator)
        
        for res in all_results:
            row = (
                f"| {res['Model']} "
                f"| {res['Test Image']} "
                f"| {res['Avg. Latency (ms)']} "
                f"| {res['Confidence (%)']} "
                f"| {res['Top Prediction']} |"
            )
            print(row)
    else:
        print("No successful benchmarks to display.")
    
    print("="*85)