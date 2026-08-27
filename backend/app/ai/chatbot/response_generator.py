from typing import Optional
from app.ai.runtime.llama_runtime import LLMRuntime, get_ai_runtime
from app.ai.runtime.generation import GenerationParams, GenerationResult


class ResponseGenerator:
    """Executes prompt generation through the local LLM runtime."""

    def __init__(self, runtime: Optional[LLMRuntime] = None):
        self.runtime = runtime or get_ai_runtime()

    def generate_response(self, prompt: str) -> GenerationResult:
        return self.runtime.generate(prompt)

    def stream_response(self, prompt: str):
        return self.runtime.stream_generate(prompt)
