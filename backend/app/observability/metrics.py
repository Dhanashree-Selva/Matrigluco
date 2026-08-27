import time
from dataclasses import dataclass
from typing import Dict, Any


@dataclass
class APIMetrics:
    total_requests: int = 0
    total_errors: int = 0
    start_time: float = time.time()

    def record_request(self, is_error: bool = False):
        self.total_requests += 1
        if is_error:
            self.total_errors += 1

    def get_summary(self) -> Dict[str, Any]:
        uptime_seconds = round(time.time() - self.start_time, 2)
        return {
            "total_requests": self.total_requests,
            "total_errors": self.total_errors,
            "uptime_seconds": uptime_seconds,
        }


api_metrics = APIMetrics()
