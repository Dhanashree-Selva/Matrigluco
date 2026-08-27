# MatriGluco Professional API Surface Specification (v1)

All production-style RESTful API endpoints are versioned and exposed under `/api/v1`.

---

## 1. Global Response Envelopes & Conventions

### 1.1 Success Response (`ApiResponse[T]`)
```json
{
  "data": { ... },
  "meta": {
    "request_id": "req-12345678-abcd"
  }
}
```

### 1.2 Paginated Response (`PaginatedResponse[T]`)
```json
{
  "items": [ ... ],
  "pagination": {
    "page": 1,
    "page_size": 20,
    "total": 100,
    "total_pages": 5,
    "has_next": true,
    "has_previous": false
  },
  "meta": {
    "request_id": "req-12345678-abcd"
  }
}
```

### 1.3 Standard Error Envelope (`ApiErrorResponse`)
```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "RiskAssessment '4fa66c1b-...' was not found or is inaccessible.",
    "details": null
  },
  "meta": {
    "request_id": "req-12345678-abcd"
  }
}
```

---

## 2. Complete REST Resource Inventory

| Resource | Method | Path | Status | Auth / Ownership | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Auth** | `POST` | `/api/v1/auth/register` | `201` | Public | Register patient account |
| | `POST` | `/api/v1/auth/login` | `200` | Public | Issue access & refresh tokens |
| | `POST` | `/api/v1/auth/refresh` | `200` | Public (Refresh Token) | Rotate refresh token |
| | `POST` | `/api/v1/auth/logout` | `200` | Bearer (User) | Revoke current session |
| | `POST` | `/api/v1/auth/logout-all` | `200` | Bearer (User) | Revoke all active sessions |
| | `POST` | `/api/v1/auth/change-password` | `200` | Bearer (User) | Update password with old verification |
| | `POST` | `/api/v1/auth/forgot-password` | `200` | Public | Generate password reset token |
| | `POST` | `/api/v1/auth/reset-password` | `200` | Public (Token) | Consume reset token |
| | `POST` | `/api/v1/auth/verify-email` | `200` | Public (Token) | Consume email verification token |
| **Users** | `GET` | `/api/v1/users/me` | `200` | Bearer (User) | Return current account details |
| **Profiles** | `GET` | `/api/v1/profiles/me` | `200` | Bearer (User) | Return authenticated patient profile |
| | `PATCH` | `/api/v1/profiles/me` | `200` | Bearer (User) | Update mutable profile fields |
| **Pregnancies**| `GET` | `/api/v1/pregnancies` | `200` | Bearer (User) | List patient pregnancy contexts |
| | `POST` | `/api/v1/pregnancies` | `201` | Bearer (User) | Create/set active pregnancy context |
| | `GET` | `/api/v1/pregnancies/{id}` | `200` | Bearer (User) | Read single owned pregnancy context |
| | `PATCH` | `/api/v1/pregnancies/{id}` | `200` | Bearer (User) | Update owned pregnancy context |
| | `DELETE`| `/api/v1/pregnancies/{id}` | `204` | Bearer (User) | Archive pregnancy context |
| **Predictions**| `POST` | `/api/v1/predictions` | `201` | Bearer (User) | Run deterministic ML risk inference |
| | `GET` | `/api/v1/predictions` | `200` | Bearer (User) | Paginated risk assessment history |
| | `GET` | `/api/v1/predictions/latest` | `200` | Bearer (User) | Most recent assessment |
| | `GET` | `/api/v1/predictions/{id}` | `200` | Bearer (User) | Read single assessment with provenance |
| | `DELETE`| `/api/v1/predictions/{id}` | `204` | Bearer (User) | Delete owned assessment record |
| **Measurements**| `POST` | `/api/v1/health-measurements` | `201` | Bearer (User) | Record clinical measurement |
| | `GET` | `/api/v1/health-measurements` | `200` | Bearer (User) | Paginated measurement history |
| | `GET` | `/api/v1/health-measurements/latest` | `200` | Bearer (User) | Latest metabolic indicators |
| | `GET` | `/api/v1/health-measurements/{id}` | `200` | Bearer (User) | Read single measurement |
| | `PATCH`| `/api/v1/health-measurements/{id}` | `200` | Bearer (User) | Update owned measurement |
| | `DELETE`| `/api/v1/health-measurements/{id}` | `204` | Bearer (User) | Delete owned measurement |
| **Dashboard** | `GET` | `/api/v1/dashboard/summary` | `200` | Bearer (User) | Aggregated clinical dashboard |
| **Reports** | `POST` | `/api/v1/reports` | `201` | Bearer (User) | Save parsed lab report |
| | `GET` | `/api/v1/reports` | `200` | Bearer (User) | List uploaded patient reports |
| | `GET` | `/api/v1/reports/{id}` | `200` | Bearer (User) | Read single report metadata |
| | `DELETE`| `/api/v1/reports/{id}` | `204` | Bearer (User) | Delete report metadata & file |
| **Files** | `POST` | `/api/v1/files/upload` | `200` | Bearer (User) | Upload file to private storage |
| | `GET` | `/api/v1/files/{id}/download` | `200` | Bearer (User) | Download authorized private file |
| **Tasks** | `GET` | `/api/v1/tasks/{job_id}` | `200` | Bearer (User) | Poll background job progress (0-100%)|
| | `GET` | `/api/v1/tasks` | `200` | Bearer (User) | Paginated background job history |
| **Notifications**| `GET` | `/api/v1/notifications` | `200` | Bearer (User) | Paginated inbox notifications |
| | `GET` | `/api/v1/notifications/{id}` | `200` | Bearer (User) | Read single notification |
| | `PATCH`| `/api/v1/notifications/{id}/read`| `200` | Bearer (User) | Mark notification as read |
| | `PATCH`| `/api/v1/notifications/read-all` | `200` | Bearer (User) | Mark all inbox notifications read |
| **Consultations**| `GET` | `/api/v1/consultations` | `200` | Bearer (User) | List scheduled consultations |
| | `POST` | `/api/v1/consultations` | `201` | Bearer (User) | Book doctor appointment |
| | `GET` | `/api/v1/consultations/{id}` | `200` | Bearer (User) | Read single consultation |
| | `PATCH`| `/api/v1/consultations/{id}` | `200` | Bearer (User) | Update appointment |
| | `DELETE`| `/api/v1/consultations/{id}` | `204` | Bearer (User) | Cancel appointment |
| **Chatbot** | `POST` | `/api/v1/chatbot/conversations` | `201` | Bearer (User) | Create AI consultation session |
| | `GET` | `/api/v1/chatbot/conversations` | `200` | Bearer (User) | List chat sessions |
| | `GET` | `/api/v1/chatbot/conversations/{id}` | `200` | Bearer (User) | Read single conversation |
| | `PATCH`| `/api/v1/chatbot/conversations/{id}` | `200` | Bearer (User) | Rename or archive conversation |
| | `DELETE`| `/api/v1/chatbot/conversations/{id}` | `204` | Bearer (User) | Delete conversation session |
| | `GET` | `/api/v1/chatbot/conversations/{id}/messages` | `200` | Bearer (User) | Get conversation message history |
| | `POST`| `/api/v1/chatbot/conversations/{id}/messages` | `200` | Bearer (User) | Generate offline AI guidance response|
| | `POST`| `/api/v1/chatbot/messages/{id}/feedback` | `200` | Bearer (User) | Submit response quality feedback |
| **Health** | `GET` | `/api/v1/health/live` | `200` | Public | Service liveness probe |
| | `GET` | `/api/v1/health/ready` | `200 / 503` | Public | Service readiness probe |
