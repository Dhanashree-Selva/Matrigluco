export interface ApiErrorPayload {
  code: string;
  message: string;
  details?: Record<string, unknown> | Array<unknown> | null;
}

export interface ApiMeta {
  request_id?: string;
  timestamp?: string;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
}

export interface ApiResponseEnvelope<T> {
  data: T;
  meta?: ApiMeta;
}

export interface ApiErrorEnvelope {
  error: ApiErrorPayload;
  meta?: ApiMeta;
}

export class AppApiError extends Error {
  public readonly code: string;
  public readonly status: number;
  public readonly details?: unknown;
  public readonly requestId?: string;

  constructor(
    message: string,
    code = "API_ERROR",
    status = 500,
    details?: unknown,
    requestId?: string
  ) {
    super(message);
    this.name = "AppApiError";
    this.code = code;
    this.status = status;
    this.details = details;
    this.requestId = requestId;
  }
}
