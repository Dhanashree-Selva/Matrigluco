import { useEffect, useState } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  Button,
} from "../../../shared/ui";
import { ChronicleIndexMonth } from "../types/history.types";
import {
  Calendar03Icon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
} from "@hugeicons/core-free-icons";
import { AppIcon } from "../../../components/common/AppIcon";

interface ChronicleIndexProps {
  months: ChronicleIndexMonth[];
  selectedMonth?: string;
  onSelectMonth: (month?: string) => void;
}

export function ChronicleIndex({
  months,
  selectedMonth,
  onSelectMonth,
}: ChronicleIndexProps) {
  const [api, setApi] = useState<any>(null);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  useEffect(() => {
    if (!api) return;
    const updateScrollState = () => {
      setCanScrollPrev(api.canScrollPrev());
      setCanScrollNext(api.canScrollNext());
    };
    updateScrollState();
    api.on("select", updateScrollState);
    api.on("reInit", updateScrollState);
    return () => {
      api.off("select", updateScrollState);
      api.off("reInit", updateScrollState);
    };
  }, [api]);

  // Build full list of options with "All History" prepended
  const allMonthsItem: ChronicleIndexMonth = {
    key: "ALL",
    label: "ALL",
    year: "",
    fullLabel: "All Timeline",
    hasData: true,
  };

  const displayList = [allMonthsItem, ...months];

  return (
    <div className="w-full bg-[var(--surface-soft)]/60 border border-[var(--border-subtle)] rounded-lg p-1.5 sm:p-2 flex items-center gap-2 select-none shadow-2xs">
      <div className="hidden sm:flex items-center gap-1.5 px-2 text-[11px] font-bold text-[var(--muted-foreground)] uppercase tracking-wider shrink-0">
        <AppIcon icon={Calendar03Icon} size="xs" className="text-[var(--primary)]" />
        <span>Chronicle Index</span>
      </div>

      <div className="flex-1 min-w-0 flex items-center gap-1.5">
        {canScrollPrev && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => api?.scrollPrev()}
            className="h-7 w-7 shrink-0 rounded-full border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--surface-soft)] shadow-2xs"
            aria-label="Previous months"
          >
            <AppIcon icon={ArrowLeft01Icon} size="xs" />
          </Button>
        )}

        <Carousel
          setApi={setApi}
          opts={{
            align: "start",
            dragFree: true,
            containScroll: "trimSnaps",
          }}
          className="flex-1 min-w-0 overflow-hidden"
        >
          <CarouselContent className="-ml-1.5">
            {displayList.map((item) => {
              const isAll = item.key === "ALL";
              const isActive = isAll
                ? !selectedMonth
                : selectedMonth === item.key;

              return (
                <CarouselItem
                  key={item.key}
                  className="pl-1.5 basis-auto"
                >
                  <button
                    type="button"
                    onClick={() => onSelectMonth(isAll ? undefined : item.key)}
                    className={`group relative flex flex-col items-center justify-center min-w-[54px] h-9 px-3 py-1 rounded-md text-xs font-bold transition-all ${
                      isActive
                        ? "bg-[var(--primary)] text-white shadow-sm"
                        : "bg-[var(--card)] text-[var(--foreground)] border border-[var(--border-subtle)] hover:border-[var(--primary)]/40 hover:bg-[var(--surface-soft)]"
                    }`}
                    aria-label={`View history for ${item.fullLabel}`}
                    aria-current={isActive ? "true" : undefined}
                  >
                    <span className="text-[11px] tracking-wider leading-tight">
                      {item.label}
                    </span>
                    {item.year ? (
                      <span
                        className={`text-[9px] font-mono leading-none mt-0.5 ${
                          isActive
                            ? "text-white/80"
                            : "text-[var(--muted-foreground)]"
                        }`}
                      >
                        {item.year}
                      </span>
                    ) : null}
                  </button>
                </CarouselItem>
              );
            })}
          </CarouselContent>
        </Carousel>

        {canScrollNext && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => api?.scrollNext()}
            className="h-7 w-7 shrink-0 rounded-full border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--surface-soft)] shadow-2xs"
            aria-label="Next months"
          >
            <AppIcon icon={ArrowRight01Icon} size="xs" />
          </Button>
        )}
      </div>
    </div>
  );
}
