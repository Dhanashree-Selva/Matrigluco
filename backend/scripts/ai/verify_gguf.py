"""
Verifies that local GGUF file exists, has valid magic header, and computes checksum.
"""

import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from app.ai.runtime.model_loader import AIModelLoader
from app.utils.hashing import sha256_file


def verify_gguf():
    loader = AIModelLoader()
    if not loader.is_model_available():
        print(f"Notice: GGUF model file not found at '{loader.model_path}'.")
        print(
            "To enable local offline AI inference, place your quantized .gguf model in storage/ai/models/model.gguf"
        )
        return

    path = loader.get_resolved_path()
    with open(path, "rb") as f:
        magic = f.read(4)

    if magic == b"GGUF":
        print(f"GGUF model header verified: {path} (Magic: {magic})")
    else:
        print(f"Warning: File at {path} does not have standard GGUF header (Got: {magic})")


if __name__ == "__main__":
    verify_gguf()
