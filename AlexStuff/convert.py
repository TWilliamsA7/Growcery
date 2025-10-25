import torch
import onnx
import os
from onnx2pytorch import ConvertModel # Use the import from the new library

# --- Configuration ---
ONNX_MODEL_PATH = "/home/agn/ProgramSpace/TensorFlow/Growcery/Produce_Small/MobileNet_ProduceOpset18.onnx" # Make sure this path is correct relative to the script
PYTORCH_OUTPUT_PATH = "mobilenet_produce_onnx2pytorch.pth" # New output name

print(f"Loading ONNX model from: {ONNX_MODEL_PATH}")

try:
    # Load the ONNX model using the standard onnx library
    onnx_model = onnx.load(ONNX_MODEL_PATH)
    print("ONNX model loaded successfully.")

    # Optional: Check model
    # onnx.checker.check_model(onnx_model)
    # print("ONNX model check passed.")

    print("\nAttempting conversion to PyTorch using onnx2pytorch...")
    # Convert the model using onnx2pytorch
    pytorch_model = ConvertModel(onnx_model)
    print("Conversion successful.")

    # Set model to evaluation mode (important for inference)
    pytorch_model.eval()

    # --- Save the PyTorch model's state dictionary ---
    print(f"\nSaving PyTorch model state dictionary to: {PYTORCH_OUTPUT_PATH}")
    torch.save(pytorch_model.state_dict(), PYTORCH_OUTPUT_PATH)
    print("PyTorch model state_dict saved.")

    # --- Verification Placeholder ---
    print("\nVerification requires loading state_dict into the correct PyTorch model architecture.")
    print("You will need to define or import the EfficientNetV2-S model structure in PyTorch separately.")
    # Example:
    # from torchvision.models import efficientnet_v2_s
    # verification_model = efficientnet_v2_s(num_classes=YOUR_NUM_CLASSES) # Adjust num_classes
    # verification_model.load_state_dict(torch.load(PYTORCH_OUTPUT_PATH))
    # verification_model.eval()
    # print("PyTorch model state_dict loaded back successfully (placeholder).")


except FileNotFoundError:
    print(f"❌ ERROR: ONNX model file not found at {ONNX_MODEL_PATH}")
except Exception as e:
    print(f"❌ ERROR during conversion or saving: {e}")

print("\n--- Conversion Script Finished ---")