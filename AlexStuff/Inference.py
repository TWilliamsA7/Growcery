import torch
import onnx
from onnx2pytorch import ConvertModel
from PIL import Image
import torchvision.transforms as transforms

# --- CONFIG ---
ONNX_MODEL_PATH = "/home/agn/ProgramSpace/TensorFlow/Growcery/Produce_Small/MobileNet_ProduceOpset18.onnx"
PYTORCH_MODEL_PATH = "/home/agn/ProgramSpace/TensorFlow/mobilenet_produce_onnx2pytorch.pth"
IMAGE_PATH = "/home/agn/Downloads/test.jpeg"

CLASS_NAMES = [
    "Apple__Healthy", "Apple__Rotten",
    "Banana__Healthy", "Banana__Rotten",
    "Bellpepper__Healthy", "Bellpepper__Rotten",
    "Carrot__Healthy", "Carrot__Rotten",
    "Cucumber__Healthy", "Cucumber__Rotten",
    "Grape__Healthy", "Grape__Rotten",
    "Guava__Healthy", "Guava__Rotten",
    "Jujube__Healthy", "Jujube__Rotten",
    "Mango__Healthy", "Mango__Rotten",
    "Orange__Healthy", "Orange__Rotten",
    "Pomegranate__Healthy", "Pomegranate__Rotten",
    "Potato__Healthy", "Potato__Rotten",
    "Strawberry__Healthy", "Strawberry__Rotten",
    "Tomato__Healthy", "Tomato__Rotten"
]

# --- LOAD MODEL ---
print("Loading ONNX model...")
onnx_model = onnx.load(ONNX_MODEL_PATH)

# channel_last_inputs not supported in v0.5.1 → omit it
model = ConvertModel(onnx_model, experimental=True)
model.load_state_dict(torch.load(PYTORCH_MODEL_PATH, map_location="cpu"))
model.eval()

# --- PREPROCESS IMAGE ---
transform = transforms.Compose([
    transforms.Resize((256, 256)),
    transforms.ToTensor(),
    transforms.Lambda(lambda x: x * 2 - 1)
])

image = Image.open(IMAGE_PATH).convert("RGB")
input_tensor = transform(image).unsqueeze(0)  # (1, 3, 256, 256)

# v0.5.1 expects NHWC → permute dimensions
input_tensor = input_tensor.permute(0, 2, 3, 1)  # (1, 256, 256, 3)

# --- INFERENCE ---
with torch.no_grad():
    output = model(input_tensor)
    pred_idx = output.argmax(dim=1).item()
    pred_label = CLASS_NAMES[pred_idx]

print(f"\n✅ Predicted: {pred_label} ({pred_idx})")
