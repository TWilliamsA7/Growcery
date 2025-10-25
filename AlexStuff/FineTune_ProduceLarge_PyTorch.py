import os
import datetime
from pathlib import Path
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, random_split
from torchvision import datasets, models, transforms
from torch.utils.tensorboard import SummaryWriter
from torch.amp import GradScaler, autocast  # ✅ New AMP API

# ------------------ CONFIG ------------------
DATA_DIR = "/home/agn/Downloads/Fruit And Vegetable Diseases Dataset"
OUT_DIR = "/home/agn/ProgramSpace/TensorFlow/Growcery"
IMG_SIZE = 256
BATCH_SIZE = 32
NUM_WORKERS = 4
EPOCHS = 15
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")
os.makedirs(OUT_DIR, exist_ok=True)

# ------------------ TRANSFORMS ------------------
train_transform = transforms.Compose([
    transforms.RandomHorizontalFlip(),
    transforms.RandomRotation(20),
    transforms.RandomResizedCrop(IMG_SIZE, scale=(0.8, 1.0)),
    transforms.ColorJitter(brightness=0.2, contrast=0.3, saturation=0.3, hue=0.08),
    transforms.ToTensor(),
])

val_transform = transforms.Compose([
    transforms.Resize((IMG_SIZE, IMG_SIZE)),
    transforms.ToTensor(),
])

# ------------------ DATASETS ------------------
full_dataset = datasets.ImageFolder(DATA_DIR)
num_val = int(0.2 * len(full_dataset))
num_train = len(full_dataset) - num_val
train_dataset, val_dataset = random_split(full_dataset, [num_train, num_val])
train_dataset.dataset.transform = train_transform
val_dataset.dataset.transform = val_transform

train_loader = DataLoader(train_dataset, batch_size=BATCH_SIZE, shuffle=True, num_workers=NUM_WORKERS, pin_memory=True)
val_loader = DataLoader(val_dataset, batch_size=BATCH_SIZE, num_workers=NUM_WORKERS, pin_memory=True)

# ------------------ MODEL ------------------
model = models.efficientnet_v2_s(weights=models.EfficientNet_V2_S_Weights.IMAGENET1K_V1)
model.classifier[1] = nn.Linear(model.classifier[1].in_features, len(full_dataset.classes))
model = model.to(DEVICE)

# ------------------ OPTIMIZATION ------------------
criterion = nn.CrossEntropyLoss()
optimizer = optim.AdamW(model.parameters(), lr=1e-3, weight_decay=1e-4)  # ✅ AdamW instead of Adam
scheduler = optim.lr_scheduler.ReduceLROnPlateau(optimizer, mode="min", factor=0.5, patience=2)
scaler = GradScaler(device="cuda")  # ✅ Works for ROCm & CUDA

# ------------------ LOGGING ------------------
log_dir = os.path.join(OUT_DIR, "logs", datetime.datetime.now().strftime("%Y%m%d-%H%M%S"))
writer = SummaryWriter(log_dir=log_dir)

# ------------------ TRAINING FUNCTION ------------------
def run_epoch(loader, model, optimizer, criterion, scaler, epoch, phase="train"):
    is_train = phase == "train"
    model.train(is_train)

    total_loss, total_correct = 0.0, 0
    total_samples = len(loader.dataset)

    for images, labels in loader:
        images, labels = images.to(DEVICE, non_blocking=True), labels.to(DEVICE, non_blocking=True)

        with autocast(device_type=DEVICE.type):
            outputs = model(images)
            loss = criterion(outputs, labels)

        if is_train:
            optimizer.zero_grad(set_to_none=True)
            scaler.scale(loss).backward()
            scaler.step(optimizer)
            scaler.update()

        total_loss += loss.detach().item() * images.size(0)
        total_correct += (outputs.argmax(1) == labels).sum().item()

    avg_loss = total_loss / total_samples
    avg_acc = total_correct / total_samples

    print(f"{phase.capitalize()} Epoch {epoch}: Loss={avg_loss:.4f}, Acc={avg_acc:.4f}")
    writer.add_scalar(f"{phase}/loss", avg_loss, epoch)
    writer.add_scalar(f"{phase}/accuracy", avg_acc, epoch)
    return avg_loss, avg_acc

# ------------------ TRAINING LOOP ------------------
best_val_loss = float("inf")
warmup_epochs = 5

# Freeze base
for param in model.features.parameters():
    param.requires_grad = False

for epoch in range(EPOCHS):
    # Unfreeze after warm-up
    if epoch == warmup_epochs:
        for param in model.features.parameters():
            param.requires_grad = True
        optimizer = optim.AdamW(model.parameters(), lr=1e-4, weight_decay=1e-4)
        print("🧠 Unfreezing base layers and reducing LR...")

    train_loss, _ = run_epoch(train_loader, model, optimizer, criterion, scaler, epoch, "train")

    # Validation (no grads)
    with torch.no_grad():
        val_loss, val_acc = run_epoch(val_loader, model, optimizer, criterion, scaler, epoch, "val")

    scheduler.step(val_loss)

    # Save best model
    if val_loss < best_val_loss:
        best_val_loss = val_loss
        save_path = os.path.join(OUT_DIR, "efficientnetv2s_best.pth")
        torch.save(model.state_dict(), save_path)
        print(f"✅ Saved new best model: {save_path}")

# Final save
torch.save(model.state_dict(), os.path.join(OUT_DIR, "efficientnetv2s_final.pth"))
writer.close()
print("Training complete ✅")
