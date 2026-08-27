"""
Registers a local GGUF model in the AI Model Registry database.
"""

import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from app.core.config import get_settings
from app.ai.runtime.model_registry import ai_model_registry

settings = get_settings()


def register_llm():
    active = ai_model_registry.get_active_model()
    print("Local AI Model Metadata:")
    print(f"  Model Name: {active.model_name}")
    print(f"  Version: {active.version}")
    print(f"  Target Path: {active.path}")
    print(f"  Context Length: {active.context_length}")
    print(f"  Quantization: {active.quantization}")


if __name__ == "__main__":
    register_llm()
