import onnxruntime as ort
import numpy as np
import cv2, time, json, os

# ------------------------
# ON MACHINE INSTALL
# ------------------------

'''
sudo apt install rocm-dev rocm-libs
pip install onnxruntime-rocm numpy opencv-python
'''

# ------------------------
# CONFIG
# ------------------------

MODEL_PATH = ""
CLASS_NAMES_FILE = ""
IMAGE_PATH = ""
IMAGE_SIZE = (256,256)

# Load model
print("Loading ONNX mModel...")
session = ort.InferenceSession(MODEL_PATH, providers=["ROCMExecutionProvider", "CPUExecutionProvider"])
input_name = session.get_inputs()[0].name
output_name = session.get_outputs()[0].name
print(f"Model ready (input: {input_name}, output: {output_name})")


# Load class names
if os.path.exists(CLASS_NAMES_FILE):
    with open(CLASS_NAMES_FILE, "r") as f:
        CLASS_NAMES = [line.strip() for line in f]
else:
    num_classes = session.get_outputs()[0].shape[-1]
    CLASS_NAMES = [f"Class_{i}" for i in range(num_classes)]

# Preprocess image
def preprocess(img_path):
    img = cv2.imread(img_path)
    if img is None:
        raise ValueError(f"Cannot open {IMAGE_PATH}")
    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    img = cv2.resize(img, IMAGE_SIZE)
    img = img.astype(np.float32) / 255.0
    img = np.expand_dims(img, axis=0)
    return img

# Run Inference
img = preprocess(IMAGE_PATH)
start = time.time()
outputs = session.run([output_name], {input_name: img})[0]
latency = (time.time() - start) * 1000.0

probs = outputs[0]
pred_idx = np.argmax(probs)
result = {
    "predictions": {CLASS_NAMES[i]: float(probs[i]) for i in range(len(CLASS_NAMES))},
    "top_class": CLASS_NAMES[pred_idx],
    "confidence": float(probs[pred_idx]),
    "latency_ms": round(latency, 2)
}
print(json.dumps(result, indent=2))