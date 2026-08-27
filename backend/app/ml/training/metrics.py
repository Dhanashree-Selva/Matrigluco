from typing import Dict, Any


def format_metrics_summary(metrics: Dict[str, Any]) -> str:
    """Formats metrics dictionary into readable evaluation report."""
    return "\n".join(
        [
            f"  {k.capitalize()}: {v * 100:.2f}%" if "accuracy" in k or "f1" in k else f"  {k}: {v}"
            for k, v in metrics.items()
        ]
    )
