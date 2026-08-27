import { useEffect } from "react";
import { useHistoryFilters } from "../hooks/useHistoryFilters";
import { useHistory } from "../hooks/useHistory";
import { HistoryHeader } from "../components/HistoryHeader";
import { ChronicleIndex } from "../components/ChronicleIndex";
import { HistoryLens } from "../components/HistoryLens";
import { HealthChronicle } from "../components/HealthChronicle";
import { StoryContext } from "../components/StoryContext";
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from "../../../shared/ui";

export default function HistoryPage() {
  const {
    filters,
    setTypes,
    setMonth,
    setDateRange,
    setViewMode,
    resetFilters,
    isFiltered,
  } = useHistoryFilters();

  const {
    events,
    chronicleMonths,
    indexMonths,
    eventCounts,
    total,
    totalPages,
    page,
    setPage,
    isLoading,
    isFetching,
    refetch,
  } = useHistory(filters);

  useEffect(() => {
    document.title = "Health Chronicle — MatriGluco";
  }, []);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-in fade-in-50 duration-200">
      {/* 1. Header */}
      <HistoryHeader totalEvents={total} />

      {/* 2. Chronicle Index (Month Navigator Carousel) */}
      <ChronicleIndex
        months={indexMonths}
        selectedMonth={filters.month}
        onSelectMonth={setMonth}
      />

      {/* 3. History Lens (Multi-Source Filters, Date Range, View Mode) */}
      <HistoryLens
        selectedTypes={filters.types}
        onTypesChange={setTypes}
        selectedMonth={filters.month}
        dateFrom={filters.dateFrom}
        dateTo={filters.dateTo}
        onDateRangeChange={setDateRange}
        viewMode={filters.viewMode}
        onViewModeChange={setViewMode}
        onReset={resetFilters}
        isFiltered={isFiltered}
        eventCounts={eventCounts}
      />

      {/* 4. Main Two-Column Chronicle Layout */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Left Column: The Health Chronicle Spine */}
        <main className="flex-1 w-full min-w-0">
          <HealthChronicle
            isLoading={isLoading}
            chronicleMonths={chronicleMonths}
            events={events}
            viewMode={filters.viewMode}
            isFiltered={isFiltered}
            onResetFilters={resetFilters}
          />

          {/* Pagination when totalPages > 1 */}
          {totalPages > 1 && (
            <div className="pt-6 flex justify-center">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setPage(Math.max(1, page - 1))}
                      aria-disabled={page <= 1}
                      className={page <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                  <span className="text-xs font-mono font-bold px-3 py-1 text-[var(--muted-foreground)]">
                    Page {page} of {totalPages}
                  </span>
                  <PaginationItem>
                    <PaginationNext
                      onClick={() => setPage(Math.min(totalPages, page + 1))}
                      aria-disabled={page >= totalPages}
                      className={page >= totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </main>

        {/* Right Column: Desktop Story Context Rail */}
        <div className="hidden lg:block">
          <StoryContext
            totalEvents={total}
            eventCounts={eventCounts}
            selectedTypes={filters.types}
            onSelectTypeOnly={(type) => setTypes([type])}
          />
        </div>
      </div>
    </div>
  );
}
