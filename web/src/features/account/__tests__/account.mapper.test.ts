import { describe, it, expect } from "vitest";
import {
  parseUserAgentMetadata,
  formatSessionLastActive,
  mapApiToAccountUser,
  mapApiToSessionRecord,
  mapApiToNotificationPreferences,
} from "../mappers/account.mapper";

describe("Account Mapper", () => {
  it("parses user agents into readable browser and operating system", () => {
    const chromeWindows =
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
    const parsed1 = parseUserAgentMetadata(chromeWindows);
    expect(parsed1.browser).toBe("Chrome");
    expect(parsed1.os).toBe("Windows");
    expect(parsed1.deviceType).toBe("desktop");

    const safariIos =
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1";
    const parsed2 = parseUserAgentMetadata(safariIos);
    expect(parsed2.browser).toBe("Safari");
    expect(parsed2.os).toBe("iOS");
    expect(parsed2.deviceType).toBe("mobile");
  });

  it("formats session relative last active timestamps accurately", () => {
    expect(formatSessionLastActive(new Date().toISOString(), true)).toBe("Active now");

    const tenMinsAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    expect(formatSessionLastActive(tenMinsAgo, false)).toBe("10 minutes ago");

    const threeHoursAgo = new Date(Date.now() - 3 * 3600 * 1000).toISOString();
    expect(formatSessionLastActive(threeHoursAgo, false)).toBe("3 hours ago");
  });

  it("maps raw API user to sanitized AccountUser", () => {
    const raw = {
      id: "u-123",
      public_id: "pub-123",
      email: "patient@matrigluco.org",
      full_name: "Ayesha Khan",
      role: "user",
      status: "active",
      expected_due_date: "2026-11-20",
      pregnancy_week: 24,
      previous_pregnancies: 1,
      blood_group: "B+",
      phone: "+91 9876543210",
      emergency_contact: "Husband (+91 9876500000)",
      email_verified_at: "2026-08-01T10:00:00Z",
    };

    const user = mapApiToAccountUser(raw);
    expect(user.id).toBe("u-123");
    expect(user.fullName).toBe("Ayesha Khan");
    expect(user.isEmailVerified).toBe(true);
    expect(user.pregnancyWeek).toBe(24);
    expect(user.bloodGroup).toBe("B+");
  });

  it("maps raw session API to SessionRecord with isCurrent precedence", () => {
    const raw = {
      id: "sess-1",
      user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0",
      created_at: "2026-08-10T10:00:00Z",
      last_used_at: new Date().toISOString(),
      expires_at: "2026-08-25T10:00:00Z",
      status: "active",
      is_current: true,
    };

    const session = mapApiToSessionRecord(raw);
    expect(session.isCurrent).toBe(true);
    expect(session.browser).toBe("Chrome");
    expect(session.os).toBe("Windows");
    expect(session.lastUsedFormatted).toBe("Active now");
  });

  it("maps notification preferences with safe defaults", () => {
    const raw = {
      consultation_reminders_enabled: true,
      risk_notifications_enabled: false,
    };

    const prefs = mapApiToNotificationPreferences(raw);
    expect(prefs.consultationRemindersEnabled).toBe(true);
    expect(prefs.riskNotificationsEnabled).toBe(false);
    expect(prefs.emailNotificationsEnabled).toBe(true); // Default true
  });
});
