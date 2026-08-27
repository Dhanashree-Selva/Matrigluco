import { describe, it, expect, beforeEach } from "vitest";
import { tokenStore } from "../token-store";

describe("tokenStore", () => {
  beforeEach(() => {
    tokenStore.clear();
  });

  it("stores and retrieves access and refresh tokens", () => {
    tokenStore.setAccessToken("test-access-token");
    tokenStore.setRefreshToken("test-refresh-token");

    expect(tokenStore.getAccessToken()).toBe("test-access-token");
    expect(tokenStore.getRefreshToken()).toBe("test-refresh-token");
  });

  it("stores and retrieves user profile objects safely", () => {
    const mockUser = {
      id: "u-123",
      email: "patient@matrigluco.org",
      full_name: "Dhanashree Selva",
      is_active: true,
    };

    tokenStore.setUser(mockUser);
    const retrieved = tokenStore.getUser();

    expect(retrieved?.id).toBe("u-123");
    expect(retrieved?.email).toBe("patient@matrigluco.org");
    expect(retrieved?.full_name).toBe("Dhanashree Selva");
  });

  it("clears all storage items upon logout", () => {
    tokenStore.setAccessToken("token");
    tokenStore.setRefreshToken("refresh");
    tokenStore.setUser({ id: "u-1", email: "a@b.com", is_active: true });

    tokenStore.clear();

    expect(tokenStore.getAccessToken()).toBeNull();
    expect(tokenStore.getRefreshToken()).toBeNull();
    expect(tokenStore.getUser()).toBeNull();
  });
});
