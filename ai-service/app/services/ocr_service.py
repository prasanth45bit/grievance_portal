import os
from typing import Optional
import numpy as np
from PIL import Image

from app.config import settings
from app.utils.logging_config import logger

class OCRService:
    def __init__(self):
        self._ocr_engine = None
        self._engine_type = "none"
        self._initialized = False

    def initialize(self):
        if not settings.enable_ocr or self._initialized:
            return

        # Attempt 1: Try PaddleOCR if available
        try:
            from paddleocr import PaddleOCR
            self._ocr_engine = PaddleOCR(use_angle_cls=True, lang='en', show_log=False)
            self._engine_type = "paddleocr"
            self._initialized = True
            logger.info("OCRService: Initialized with PaddleOCR.")
            return
        except ImportError:
            logger.debug("PaddleOCR not installed, trying pytesseract.")
        except Exception as e:
            logger.debug("PaddleOCR initialization failed: %s", e)

        # Attempt 2: Try PyTesseract
        try:
            import pytesseract
            self._ocr_engine = pytesseract
            self._engine_type = "pytesseract"
            self._initialized = True
            logger.info("OCRService: Initialized with PyTesseract.")
            return
        except ImportError:
            logger.debug("PyTesseract not installed.")
        except Exception as e:
            logger.debug("PyTesseract initialization failed: %s", e)

        logger.info("OCRService: Running in passive mode (No OCR binary installed; optional module bypassed).")
        self._engine_type = "none"
        self._initialized = True

    def extract_text(self, image_np: np.ndarray) -> str:
        """
        Extracts visible text from the image.
        Returns a clean single-line or multi-line string.
        Guaranteed not to raise an uncaught exception.
        """
        if not settings.enable_ocr:
            return ""

        if not self._initialized:
            self.initialize()

        if self._engine_type == "none" or self._ocr_engine is None:
            return ""

        try:
            if self._engine_type == "paddleocr":
                result = self._ocr_engine.ocr(image_np, cls=True)
                extracted_lines = []
                if result and result[0]:
                    for line in result[0]:
                        text, score = line[1]
                        if score > 0.4:
                            extracted_lines.append(text.strip())
                return " ".join(extracted_lines)

            elif self._engine_type == "pytesseract":
                pil_img = Image.fromarray(image_np)
                text = self._ocr_engine.image_to_string(pil_img)
                return " ".join(text.split())

        except Exception as e:
            logger.warning("OCR text extraction encountered non-fatal error: %s", str(e))
            return ""

        return ""

ocr_service = OCRService()
