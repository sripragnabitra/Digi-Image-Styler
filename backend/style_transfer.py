# backend/style_transfer.py
import io
import numpy as np
from PIL import Image
import tensorflow as tf
import tensorflow_hub as hub

# Load TF-Hub model once at startup
print("Loading TF-Hub model (first load may take a few seconds)…")
_hub_model = hub.load(
    "https://tfhub.dev/google/magenta/arbitrary-image-stylization-v1-256/2"
)
print("TF-Hub model loaded.")


def _pil_to_tensor(img: Image.Image, max_dim: int = 512) -> tf.Tensor:
    """Convert PIL image → float32 tensor [1, H, W, 3] in [0, 1]."""
    img = img.convert("RGB")
    w, h = img.size
    if max(w, h) > max_dim:
        scale = max_dim / float(max(w, h))
        img = img.resize((int(w * scale), int(h * scale)), Image.LANCZOS)
    arr = np.array(img, dtype=np.float32) / 255.0
    return tf.expand_dims(arr, axis=0)   # [1, H, W, 3]


def _tensor_to_pil(tensor: tf.Tensor) -> Image.Image:
    """Convert float32 tensor [1, H, W, 3] → PIL Image (uint8)."""
    t = tensor.numpy() if tf.is_tensor(tensor) else tensor
    if t.ndim == 4:
        t = t[0]
    arr = (np.clip(t, 0.0, 1.0) * 255).astype(np.uint8)
    return Image.fromarray(arr)


def stylize_bytes(
    content_bytes: bytes,
    style_bytes: bytes,
    content_max_dim: int = 512,
    style_max_dim: int = 256,
) -> Image.Image:
    """
    Accept raw image bytes for content + style images.
    Returns a PIL Image of the stylized result.
    Uses Google Magenta arbitrary-image-stylization (TF-Hub).
    """
    try:
        content_img = Image.open(io.BytesIO(content_bytes)).convert("RGB")
    except Exception as e:
        raise ValueError(f"Failed to read content image: {e}")

    try:
        style_img = Image.open(io.BytesIO(style_bytes)).convert("RGB")
    except Exception as e:
        raise ValueError(f"Failed to read style image: {e}")

    content_tensor = _pil_to_tensor(content_img, max_dim=content_max_dim)
    style_tensor   = _pil_to_tensor(style_img,   max_dim=style_max_dim)

    outputs = _hub_model(
        tf.constant(content_tensor),
        tf.constant(style_tensor),
    )
    return _tensor_to_pil(outputs[0])
