# MatriGluco — Error Handling & Sanitization Policy

## 1. Normalized Error Envelope

All API errors return a standard JSON envelope containing a machine-readable code, human-safe message, optional details, and the request correlation ID:

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "RiskAssessment with identifier '123' was not found.",
    "details": {
      "resource": "RiskAssessment",
      "identifier": "123"
    }
  },
  "meta": {
    "request_id": "f47ac10b-58cc-4372-a567-0e02b2c3d479"
  }
}
```

---

## 2. Standard Public Error Codes

| HTTP Status | Error Code | Description |
| :---: | :--- | :--- |
| `400` | `INVALID_AUTH_TOKEN`, `BAD_REQUEST` | Malformed request parameters or invalid recovery token. |
| `401` | `AUTHENTICATION_FAILED`, `INVALID_CREDENTIALS`, `EXPIRED_ACCESS_TOKEN` | Missing or invalid Bearer JWT credentials. |
| `403` | `PERMISSION_DENIED`, `EMAIL_NOT_VERIFIED` | Authorization failure or unverified email access attempt. |
| `404` | `RESOURCE_NOT_FOUND`, `NOT_FOUND` | Resource does not exist or belongs to another user (IDOR protection). |
| `409` | `CONFLICT`, `REPORT_NOT_READY` | Resource state conflict or in-progress operation. |
| `422` | `REQUEST_VALIDATION_ERROR`, `ML_FEATURES_INCOMPLETE` | Schema validation error or missing clinical features. |
| `429` | `RATE_LIMIT_EXCEEDED` | Exceeded sliding-window rate limit threshold. |
| `500` | `INTERNAL_SERVER_ERROR`, `REPORT_PROCESSING_ERROR` | Unexpected internal exception (stack traces suppressed). |
| `503` | `DATABASE_UNAVAILABLE`, `ML_MODEL_NOT_FOUND` | Required infrastructure dependency is offline. |

---

## 3. Privacy & Sanitization Rules
1. **Zero Stack Traces**: Public API responses never contain Python tracebacks, file paths, or ORM internal messages.
2. **Zero SQL Strings**: Raw SQL queries, database hostnames, and credentials are completely suppressed from responses.
3. **IDOR Concealment**: Attempting to access another patient's resource returns `404 Not Found` rather than `403 Forbidden` to prevent resource existence disclosure.
