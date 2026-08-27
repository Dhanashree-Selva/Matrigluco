# MatriGluco — Medical Report OCR & Value Extraction Pipeline

## 1. Asynchronous Upload & Processing Pipeline

1. **Client Upload**: Patient submits medical lab report via `POST /api/v1/reports`.
2. **Private Storage**: File is validated and saved to `storage/private/medical-reports/`.
3. **Durable Transaction**: Creates `Report` and `BackgroundJob` records in MySQL, then commits.
4. **Celery Enqueue**: Enqueues `process_medical_report_task` passing only `(report_id, job_id)` to Redis `/1`.
5. **Immediate Response**: API responds immediately with `202 Accepted` and tracking IDs.

```text
POST /reports ──> Save File ──> Commit DB ──> Enqueue ID ──> 202 Accepted
                                                   │
                                                   ▼
                                         Reports Worker
                                                   │
                                     ┌─────────────┴─────────────┐
                                     ▼                           ▼
                             Verify Consent                  Fetch File
                                     │                           │
                                     └─────────────┬─────────────┘
                                                   ▼
                                           OCR & Extraction
                                                   │
                                                   ▼
                                       Commit Extracted Values
```

---

## 2. Consent & Privacy Enforcement

- **Third-Party OCR Verification**: External OCR transmission requires active consent (`third_party_ocr_processing`, version `ocr-third-party-v1`).
- **No File Bytes in Broker**: Celery task messages contain only identifiers; the worker resolves files securely via `StorageService`.
- **Sanitized Failures**: Failure messages stored in MySQL and returned via API are sanitized to prevent exposing internal file paths or raw lab text.

---

## 3. Idempotency & Concurrency

- **Distributed Lock**: Acquires `matrigluco:lock:report-processing:{report_id}` to prevent simultaneous duplicate OCR requests.
- **Durable State Re-check**: If the report is already `completed`, the worker exits idempotently without re-running OCR.
