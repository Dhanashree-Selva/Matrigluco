import { describe, it, expect } from "vitest";
import { mapNotificationDtoToViewModel } from "../mappers/notification.mapper";
import { RawNotificationDto } from "../types/notification.types";

describe("mapNotificationDtoToViewModel", () => {
  it("maps report_ready notification with safe route and actionable state", () => {
    const dto: RawNotificationDto = {
      id: "notif-1",
      user_id: "usr-1",
      title: "Lab Report Extracted",
      message: "Your fasting glucose report is ready for clinical review.",
      notification_type: "report_ready",
      resource_type: "report",
      resource_id: "rep-123",
      is_read: false,
      created_at: "2026-08-18T10:30:00Z",
    };

    const vm = mapNotificationDtoToViewModel(dto);

    expect(vm.id).toBe("notif-1");
    expect(vm.type).toBe("report_ready");
    expect(vm.category).toBe("reports");
    expect(vm.sourceLabel).toBe("Lab Report");
    expect(vm.targetRoute).toBe("/app/reports/rep-123");
    expect(vm.actionLabel).toBe("Review report");
    expect(vm.isActionable).toBe(true);
    expect(vm.isRead).toBe(false);
  });

  it("maps consultation_reminder notification with safe route", () => {
    const dto: RawNotificationDto = {
      id: "notif-2",
      user_id: "usr-1",
      title: "Upcoming Consultation",
      message: "Dr. Evelyn Vance is waiting for your prenatal visit at 11:30 AM.",
      notification_type: "consultation_reminder",
      resource_type: "consultation",
      resource_id: "c-456",
      is_read: true,
      read_at: "2026-08-18T10:35:00Z",
      created_at: "2026-08-18T10:00:00Z",
    };

    const vm = mapNotificationDtoToViewModel(dto);

    expect(vm.type).toBe("consultation_reminder");
    expect(vm.category).toBe("consultations");
    expect(vm.targetRoute).toBe("/app/consultations/c-456");
    expect(vm.isActionable).toBe(true);
    expect(vm.isRead).toBe(true);
  });

  it("safely handles unknown notification types with system fallback", () => {
    const dto: RawNotificationDto = {
      id: "notif-99",
      user_id: "usr-1",
      title: "System Update",
      message: "Care network maintenance complete.",
      notification_type: "custom_unknown_type",
      is_read: true,
      created_at: "2026-08-18T08:00:00Z",
    };

    const vm = mapNotificationDtoToViewModel(dto);

    expect(vm.category).toBe("system");
    expect(vm.sourceLabel).toBe("Care Notice");
    expect(vm.targetRoute).toBeUndefined();
    expect(vm.isActionable).toBe(false);
  });
});
