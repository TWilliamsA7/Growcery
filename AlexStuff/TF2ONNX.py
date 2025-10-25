import tensorflow as tf
from keras import models
import tf2onnx
import os

# Path to your trained model (.keras)
MODEL_PATH = "/home/agn/ProgramSpace/TensorFlow/Growcery/checkpoint.keras"
ONNX_PATH = "/home/agn/ProgramSpace/TensorFlow/Growcery/efficientnetv2s_produce.onnx"

# Load the model
model = models.load_model(MODEL_PATH)
print("✅ Loaded Keras model")

# Convert to ONNX
spec = (tf.TensorSpec((None, 256, 256, 3), tf.float32, name="input"),)
output_path = tf2onnx.convert.from_keras(
    model,
    input_signature=spec,
    opset=17,  # you can bump to 18 if supported
    output_path=ONNX_PATH
)

print(f"✅ Exported ONNX model to: {ONNX_PATH}")
