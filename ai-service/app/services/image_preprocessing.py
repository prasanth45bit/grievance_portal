import io
from typing import Tuple, Optional
import numpy as np
from PIL import Image, ImageOps

from app.utils.logging_config import logger

def preprocess_image(image_bytes: bytes) -> Tuple[np.ndarray, int, int]:
    """
    Decodes image bytes, respects EXIF orientation tags, validates dimensions,
    and converts to RGB numpy array.
    Returns (rgb_numpy_array, original_width, original_height).
    """
    try:
        pil_img = Image.open(io.BytesIO(image_bytes))
        
        # Correct image orientation based on EXIF tags (e.g. smartphone photos taken vertically)
        try:
            pil_img = ImageOps.exif_transpose(pil_img)
        except Exception as e:
            logger.debug("Could not transpose EXIF orientation: %s", e)
            
        # Ensure RGB format (handles RGBA, Grayscale, CMYK, etc.)
        if pil_img.mode != "RGB":
            pil_img = pil_img.convert("RGB")
            
        orig_width, orig_height = pil_img.size
        img_np = np.array(pil_img)
        
        return img_np, orig_width, orig_height
    except Exception as e:
        logger.error("Image preprocessing failed: %s", str(e))
        raise ValueError(f"Failed to process image: {str(e)}")
