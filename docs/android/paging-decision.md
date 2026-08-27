# Paging Decision

Use Paging 3 for measurements, unified history, predictions, notifications and background jobs because server page/page_size contracts exist. Do not use Paging for sessions, pregnancy contexts, dashboard summary, Assistant conversation/message arrays, reports or consultations until cursor/page contracts replace bounded list/limit responses. Repository adapters must normalize the three current pagination envelope shapes without leaking DTOs to UI.
