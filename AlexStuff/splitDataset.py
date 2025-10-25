import tensorflow as tf
from keras import layers, utils

IMG_SIZE = (256, 256)
BATCH_SIZE = 32

train_ds = utils.image_dataset_from_directory(
    "/home/agn/Downloads/Fruit And Vegetable Diseases Dataset",
    validation_split=0.2,   # 80% train, 20% val
    subset="training",
    seed=123,
    image_size=IMG_SIZE,
    batch_size=BATCH_SIZE
)

val_ds = utils.image_dataset_from_directory(
    "/home/agn/Downloads/Fruit And Vegetable Diseases Dataset",
    validation_split=0.2,
    subset="validation",
    seed=123,
    image_size=IMG_SIZE,
    batch_size=BATCH_SIZE
)

# Optional optimizations
AUTOTUNE = tf.data.AUTOTUNE
train_ds = train_ds.cache().shuffle(1000).prefetch(AUTOTUNE)
val_ds = val_ds.cache().prefetch(AUTOTUNE)

print("Number of classes:", len(train_ds.class_names))
print(train_ds.class_names)

