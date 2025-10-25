
import os
import datetime
from pathlib import Path

import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, random_split
from torchvision import datasets, models, transforms
from torch.utils.tensorboard import SummaryWriter
from torch.cuda.amp import GradScaler, autocast

# Configs
DATA_DIR = "/home/agn/Downloads/plantvillage dataset/color"
OUT_DIR = "/home/agn/ProgramSpace/PyTorch/Growcery"
IMG_SIZE = 256
BATCH_SIZE = 32
NUM_WORKERS = 4
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# Transforms
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

# Dataset & Dataloader
full_dataset = datasets.ImageFolder(DATA_DIR)
num_val = int(0.2 * len(full_dataset))
num_train = len(full_dataset) - num_val
train_dataset, val_dataset = random_split(full_dataset, [num_train, num_val])

train_dataset.dataset.transform = train_transform
val_dataset.dataset.transform = val_transform

train_loader = DataLoader(train_dataset, batch_size=BATCH_SIZE, shuffle=True, num_workers=NUM_WORKERS)
val_loader = DataLoader(val_dataset, batch_size=BATCH_SIZE, num_workers=NUM_WORKERS)

# Model
model = models.efficientnet_v2_s(weights=models.EfficientNet_V2_S_Weights.IMAGENET1K_V1)
model.classifier[1] = nn.Linear(model.classifier[1].in_features, len(full_dataset.classes))
model = model.to(DEVICE)

# Freeze base model
for param in model.features.parameters():
    param.requires_grad = False

# Loss, Optimizer, AMP
criterion = nn.CrossEntropyLoss()
optimizer = optim.Adam(model.parameters(), lr=1e-3)
scaler = GradScaler()

# Logging
os.makedirs(OUT_DIR, exist_ok=True)
log_dir = os.path.join(OUT_DIR, "logs", datetime.datetime.now().strftime("%Y%m%d-%H%M%S"))
writer = SummaryWriter(log_dir=log_dir)

def train_one_epoch(loader, model, optimizer, criterion, scaler, epoch, phase="train"):
    model.train() if phase == "train" else model.eval()
    running_loss = 0.0
    correct = 0

    for images, labels in loader:
        images, labels = images.to(DEVICE), labels.to(DEVICE)

        optimizer.zero_grad()
        with autocast():
            outputs = model(images)
            loss = criterion(outputs, labels)

        if phase == "train":
            scaler.scale(loss).backward()
            scaler.step(optimizer)
            scaler.update()

        running_loss += loss.item() * images.size(0)
        correct += (outputs.argmax(1) == labels).sum().item()

    epoch_loss = running_loss / len(loader.dataset)
    epoch_acc = correct / len(loader.dataset)
    print(f"{phase} Epoch {epoch}: Loss={epoch_loss:.4f}, Acc={epoch_acc:.4f}")
    writer.add_scalar(f"{phase}/loss", epoch_loss, epoch)
    writer.add_scalar(f"{phase}/accuracy", epoch_acc, epoch)
    return epoch_loss, epoch_acc

# Warm-up Training (frozen base)
for epoch in range(5):
    train_one_epoch(train_loader, model, optimizer, criterion, scaler, epoch, "train")
    train_one_epoch(val_loader, model, optimizer, criterion, scaler, epoch, "val")

# Unfreeze and fine-tune
for param in model.features.parameters():
    param.requires_grad = True

optimizer = optim.Adam(model.parameters(), lr=1e-4)

for epoch in range(5, 15):
    train_one_epoch(train_loader, model, optimizer, criterion, scaler, epoch, "train")
    train_one_epoch(val_loader, model, optimizer, criterion, scaler, epoch, "val")

# Save model
torch.save(model.state_dict(), os.path.join(OUT_DIR, "efficientnetv2s_produce.pth"))
