from PIL import Image
import os

DATA_DIR = "/home/agn/Downloads/Fruit And Vegetable Diseases Dataset"
for root, _, files in os.walk(DATA_DIR):
    for file in files:
        ext = os.path.splitext(file)[-1].lower()
        if ext in [".jpg", ".jpeg", ".png", ".bmp", ".gif"]:
            path = os.path.join(root, file)
            try:
                img = Image.open(path)
                rgb = img.convert("RGB")
                rgb.save(path, "JPEG")
            except Exception as e:
                print("Failed convert:", path, e)
