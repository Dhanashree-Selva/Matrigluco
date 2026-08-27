from dataclasses import dataclass, field
from typing import List, Dict, Any, Optional


@dataclass
class GenerationParams:
    max_tokens: int = 512
    temperature: float = 0.3
    top_p: float = 0.9
    top_k: int = 40
    repeat_penalty: float = 1.18
    stop_sequences: List[str] = field(
        default_factory=lambda: [
            "<|im_end|>",
            "<|im_start|>",
            "<|eot_id|>",
            "<|end_of_text|>",
            "<|start_header_id|>",
            "<|end_header_id|>",
            "User:",
            "user:",
            "\nUser:",
            "\nPatient:",
        ]
    )


@dataclass
class GenerationResult:
    text: str
    tokens_generated: int
    finish_reason: str
    latency_ms: float
    model_name: str
    metadata: Dict[str, Any] = field(default_factory=dict)
