import { describe, it, expect } from "vitest";
import { queryKeys } from "../query-keys";

describe("queryKeys factory", () => {
  it("generates structured profile query keys", () => {
    expect(queryKeys.profile.all).toEqual(["profile"]);
    expect(queryKeys.profile.me()).toEqual(["profile", "me"]);
  });

  it("generates parameterized prediction query keys without raw secret values", () => {
    const filters = { limit: 10, page: 1 };
    expect(queryKeys.predictions.list(filters)).toEqual([
      "predictions",
      "list",
      filters,
    ]);
    expect(queryKeys.predictions.detail("pred-123")).toEqual([
      "predictions",
      "detail",
      "pred-123",
    ]);
  });

  it("generates structured health, reports, and consultations keys", () => {
    expect(queryKeys.health.list()).toEqual(["health", "list", {}]);
    expect(queryKeys.reports.list()).toEqual(["reports", "list", {}]);
    expect(queryKeys.consultations.list()).toEqual(["consultations", "list", {}]);
    expect(queryKeys.notifications.preferences()).toEqual([
      "notifications",
      "preferences",
    ]);
  });
});
