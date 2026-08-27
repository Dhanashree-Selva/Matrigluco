export type HistoryEventType = "assessment" | "measurement" | "report" | "consultation";

export type HistoryViewMode = "story" | "events";

export interface HistoryFilterState {
  types: HistoryEventType[];
  month?: string; // "YYYY-MM"
  dateFrom?: string; // ISO
  dateTo?: string; // ISO
  viewMode: HistoryViewMode;
  searchQuery?: string;
}

export interface HistoryEventDto {
  id: string;
  type: HistoryEventType;
  occurred_at: string;
  resource_id: string;
  title: string;
  summary?: string | null;
  status?: string | null;
  episode_id?: string | null;
  episode_type?: string | null;
  details: Record<string, unknown>;
}

export interface HistoryListDto {
  items: HistoryEventDto[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  available_months: string[];
  event_counts: Record<string, number>;
}

// Normalized UI View Model
export interface HistoryEventVM {
  id: string;
  type: HistoryEventType;
  occurredAt: string;
  resourceId: string;
  title: string;
  summary?: string;
  status?: string;
  episodeId?: string;
  episodeType?: string;
  timeLabel: string;
  dateLabel: string;
  monthYearKey: string; // "2026-08"
  dateKey: string; // "2026-08-18"
  deepLink: string;
  details: Record<string, unknown>;
}

// Grouped by local date
export interface ChronicleDateGroupVM {
  dateKey: string; // "2026-08-18"
  dateHeading: string; // "Today · Tuesday, 18 Aug" or "18 Aug 2026"
  isToday: boolean;
  isYesterday: boolean;
  events: HistoryEventVM[];
  eventCount: number;
}

// Grouped by month
export interface ChronicleMonthVM {
  monthKey: string; // "2026-08"
  monthTitle: string; // "August 2026"
  dateGroups: ChronicleDateGroupVM[];
  totalEvents: number;
}

// Chronicle Index Month item for Carousel
export interface ChronicleIndexMonth {
  key: string; // "2026-08"
  label: string; // "AUG"
  year: string; // "2026"
  fullLabel: string; // "August 2026"
  hasData: boolean;
}
