from app.core.middleware import get_request_id


def current_trace_id() -> str:
    """Returns the current request/trace identifier for distributed correlation."""
    return get_request_id()
