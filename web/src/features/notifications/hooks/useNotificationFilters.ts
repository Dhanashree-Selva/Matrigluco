import { useSearchParams } from "react-router-dom";
import { useCallback, useMemo } from "react";
import {
  NotificationCategory,
  NotificationFilterState,
  SignalLensView,
} from "../types/notification.types";

export function useNotificationFilters() {
  const [searchParams, setSearchParams] = useSearchParams();

  const view = (searchParams.get("view") as SignalLensView) || "all";
  const category = (searchParams.get("category") as NotificationCategory) || "all";

  const filters = useMemo<NotificationFilterState>(() => {
    return {
      view: ["all", "unread", "actionable"].includes(view) ? view : "all",
      category: [
        "all",
        "reports",
        "consultations",
        "assessments",
        "tracking",
        "account",
        "system",
      ].includes(category)
        ? category
        : "all",
    };
  }, [view, category]);

  const setView = useCallback(
    (newView: SignalLensView) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (newView === "all") {
            next.delete("view");
          } else {
            next.set("view", newView);
          }
          return next;
        },
        { replace: true }
      );
    },
    [setSearchParams]
  );

  const setCategory = useCallback(
    (newCategory: NotificationCategory) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (newCategory === "all") {
            next.delete("category");
          } else {
            next.set("category", newCategory);
          }
          return next;
        },
        { replace: true }
      );
    },
    [setSearchParams]
  );

  const resetFilters = useCallback(() => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.delete("view");
        next.delete("category");
        return next;
      },
      { replace: true }
    );
  }, [setSearchParams]);

  return {
    filters,
    setView,
    setCategory,
    resetFilters,
    isFiltered: filters.view !== "all" || filters.category !== "all",
  };
}
