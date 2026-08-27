# MatriGluco Privacy Architecture & Clinical Data Governance

---

## 1. Clinical Data Categories & Boundaries

| Category | Storage Engine | Authoritative Status | Access Policy |
| :--- | :--- | :--- | :--- |
| **Patient Identity & Profiles** | MySQL (`users`) | Authoritative | Encrypted credentials, strictly owner-accessible (`GET /users/me`, `GET /profiles/me`). |
| **Uploaded Medical Reports** | Private Storage (`PRIVATE_STORAGE_ROOT`) | Authoritative Binary | Non-public filesystem, random UUID keys, authenticated stream downloads only. |
| **Parsed Clinical Biomarkers** | MySQL (`medical_reports`) | Authoritative Metadata | Owner-scoped SQL records. Never printed in general access logs. |
| **Metabolic Risk Assessments** | MySQL (`risk_assessments`, `risk_assessment_features`) | Authoritative Snapshot | Immutable pre-preprocessor normalized snapshot. Full lineage and provenance recorded. |
| **AI Chatbot Consultations** | MySQL (`chat_conversations`, `chat_messages`) | Authoritative History | Private user sessions. Local llama.cpp inference avoids external network leakage. |
| **Transient Application Cache** | Redis DB `/0` | Non-Authoritative | Ephemeral cache (60-300s TTL). Flushes cause zero durable data loss. |

---

## 2. Third-Party OCR Disclosure & Consent Lifecycle
- **External Processing**: When `OCR_PROVIDER=ocr_space`, medical reports are transmitted externally for text extraction.
- **Explicit Consent**: Prior to transmission, `ConsentService` verifies active acceptance of `consent_type="third_party_ocr_processing"`, `consent_version="ocr-third-party-v1"`.
- **Data Minimization**: Only raw report bytes required for OCR are transmitted. User identities, profiles, emails, and past assessments are never attached.
- **Withdrawal**: Patients can withdraw consent at any time, halting future transmissions without fabricating retroactive third-party deletions.

---

## 3. Local AI Privacy & Context Minimization
- **Offline Inference**: `llama.cpp` executes locally on the backend host; prompts are never forwarded to third-party cloud LLM APIs.
- **Bounded Context**: Context builders supply only minimal necessary gestational data (`pregnancy_week`, `risk_level`, `due_date`), avoiding complete dump of past medical records.
