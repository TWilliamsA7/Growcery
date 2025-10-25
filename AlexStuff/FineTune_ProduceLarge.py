import tensorflow as tf
from keras import layers, models, mixed_precision, utils, applications, Sequential, backend, Input, optimizers
from keras.callbacks import EarlyStopping, ModelCheckpoint, TensorBoard
import datetime, os

# --------------------------------
# SPLIT DATASET INTO TRAIN AND VALIDATION
# --------------------------------

DATA_DIR = "/home/agn/Downloads/plantvillage dataset/color"
OUT_DIR = "/home/agn/ProgramSpace/TensorFlow/Growcery"
IMG_SIZE = (256, 256)
BATCH_SIZE = 32

train_ds = utils.image_dataset_from_directory(
    DATA_DIR,
    validation_split=0.2,   # 80% train, 20% val
    subset="training",
    seed=123,
    image_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    color_mode="rgb"
)

val_ds = utils.image_dataset_from_directory(
    DATA_DIR,
    validation_split=0.2,
    subset="validation",
    seed=123,
    image_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    color_mode="rgb"
)

# Optimizations

CLASS_NAMES = train_ds.class_names
NUM_CLASSES = len(CLASS_NAMES)
print(f"Detected {NUM_CLASSES} classes:")
print(CLASS_NAMES)

# cache + prefetch
AUTOTUNE = tf.data.AUTOTUNE
train_ds = train_ds.shuffle(256).prefetch(AUTOTUNE)
val_ds = val_ds.prefetch(AUTOTUNE)




# --------------------------------
# IMPORT MODEL
# --------------------------------

mixed_precision.set_global_policy("mixed_float16")

backend.clear_session()

base_model = applications.EfficientNetV2S(
    include_top=False,
    input_shape=(256,256,3),
    weights="imagenet"
)
base_model.trainable=False # freeze base for fine tune and transfer

# data augmentation

def random_jpeg_batch(x):
    # Apply JPEG quality randomization per image in the batch
    def _apply(img):
        img_uint8 = tf.cast(img * 255.0, tf.uint8)
        img_jpeg = tf.image.random_jpeg_quality(img_uint8, 70, 100)
        return tf.cast(img_jpeg, tf.float32) / 255.0

    return tf.map_fn(_apply, x)

data_augmentation = tf.keras.Sequential([
    layers.RandomFlip("horizontal"),
    layers.RandomRotation(0.2),
    layers.RandomZoom(0.2),
    layers.RandomTranslation(0.1, 0.1),

    layers.RandomBrightness(factor=0.2),
    layers.RandomContrast(0.3),
    layers.RandomSaturation(0.3),
    layers.RandomHue(0.08),
    layers.GaussianNoise(0.05),

    
    #layers.Lambda(random_jpeg_batch, output_shape=(256, 256, 3))
])



# Model head
inputs = Input(shape=IMG_SIZE + (3,))
x = data_augmentation(inputs)
x = applications.efficientnet_v2.preprocess_input(x)
x = base_model(x, training=False)
x = layers.GlobalAveragePooling2D()(x)
x = layers.Dropout(0.3)(x)
outputs = layers.Dense(NUM_CLASSES, activation="softmax", dtype="float32")(x)
model = models.Model(inputs, outputs)

model.compile(
    optimizer=optimizers.Adam(1e-3),
    loss="sparse_categorical_crossentropy",
    metrics=["accuracy"]
)

model.summary()


# --------------------------------
# IMPORT MODEL
# --------------------------------

os.makedirs(OUT_DIR, exist_ok=True)
log_dir = os.path.join(OUT_DIR, "logs", datetime.datetime.now().strftime("%Y%m%d-%H%M%S"))

callbacks = [
    TensorBoard(log_dir=log_dir),
    EarlyStopping(patience=3, restore_best_weights=True),
    ModelCheckpoint(os.path.join(OUT_DIR, "checkpoint.keras"), save_best_only=True)
]


# --------------------------------
# WARMUP
# --------------------------------

history = model.fit(
    train_ds,
    validation_data=val_ds,
    epochs=5,
    callbacks=callbacks
)

# --------------------------------
# UNFREEZE
# --------------------------------

base_model.trainable=True
model.compile(
    optimizer=optimizers.Adam(1e-4),
    loss="sparse_categorical_crossentropy",
    metrics=["accuracy"]
)
history_ft = model.fit(
    train_ds,
    validation_data=val_ds,
    epochs=10,
    callbacks=callbacks
)

model.save(os.path.join(OUT_DIR, "efficientnetv3_produce.keras"))