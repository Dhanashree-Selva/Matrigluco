from dataclasses import dataclass
from typing import Dict, Any


@dataclass
class AIMetrics:
    total_inferences: int = 0
    total_generation_time_ms: float = 0.0
    total_tokens_generated: int = 0
    failed_inferences: int = 0

    def record_inference(self, duration_ms: float, tokens: int = 0, is_error: bool = False):
        self.total_inferences += 1
        self.total_generation_time_ms += duration_ms
        self.total_tokens_generated += tokens
        if is_error:
            self.failed_inferences += 1

    def get_summary(self) -> Dict[str, Any]:
        avg_time = (
            round(self.total_generation_time_ms / self.total_inferences, 2)
            if self.total_inferences > 0
            else 0.0
        )
        return {
            "total_inferences": self.total_inferences,
            "failed_inferences": self.failed_inferences,
            "total_tokens_generated": self.total_tokens_generated,
            "avg_generation_time_ms": avg_time,
        }


ai_metrics = AIMetrics()
