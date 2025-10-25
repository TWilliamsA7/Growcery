import tensorflow as tf
from keras import models

# Path to your trained Keras model
MODEL_PATH = "/home/agn/ProgramSpace/TensorFlow/Growcery/checkpoint.keras"
OUTPUT_FILE = "/home/agn/ProgramSpace/TensorFlow/Growcery/class_names.txt"

# Load model
model = models.load_model(MODEL_PATH)

# Try to find class names from metadata if available
if hasattr(model, "class_names"):
    class_names = model.class_names
else:
    # Fallback: if you used image_dataset_from_directory, the class names are stored in your dataset object
    # You can hardcode or re-import them like this if you still have access to your dataset folder:
    import os
    DATA_DIR = "/home/agn/Downloads/Fruit And Vegetable Diseases Dataset"
    class_names = sorted([d for d in os.listdir(DATA_DIR) if os.path.isdir(os.path.join(DATA_DIR, d))])

# Save to text file
with open(OUTPUT_FILE, "w") as f:
    f.write("\n".join(class_names))

print(f"✅ Saved {len(class_names)} class names to {OUTPUT_FILE}")
