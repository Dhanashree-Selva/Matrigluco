import { describe, it, expect } from "vitest";
import {
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema,
} from "../schemas/auth.schema";

describe("auth.schema", () => {
  describe("loginSchema", () => {
    it("validates correct email and password", () => {
      const valid = {
        email: "test@example.com",
        password: "SecurePassword123",
      };
      const result = loginSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it("rejects invalid email formats", () => {
      const invalid = {
        email: "not-an-email",
        password: "Password123",
      };
      const result = loginSchema.safeParse(invalid);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("valid email address");
      }
    });

    it("rejects empty password", () => {
      const invalid = {
        email: "test@example.com",
        password: "",
      };
      const result = loginSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });

  describe("registerSchema", () => {
    it("validates valid registration data", () => {
      const valid = {
        full_name: "Sarah Johnson",
        email: "sarah@example.com",
        password: "Password123",
        confirmPassword: "Password123",
      };
      const result = registerSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it("rejects mismatched passwords", () => {
      const invalid = {
        full_name: "Sarah Johnson",
        email: "sarah@example.com",
        password: "Password123",
        confirmPassword: "DifferentPassword456",
      };
      const result = registerSchema.safeParse(invalid);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Passwords do not match.");
      }
    });

    it("rejects passwords under 8 characters", () => {
      const invalid = {
        full_name: "Sarah Johnson",
        email: "sarah@example.com",
        password: "short",
        confirmPassword: "short",
      };
      const result = registerSchema.safeParse(invalid);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("at least 8 characters");
      }
    });
  });

  describe("forgotPasswordSchema", () => {
    it("validates valid email", () => {
      const result = forgotPasswordSchema.safeParse({ email: "user@example.com" });
      expect(result.success).toBe(true);
    });

    it("rejects empty email", () => {
      const result = forgotPasswordSchema.safeParse({ email: "" });
      expect(result.success).toBe(false);
    });
  });

  describe("resetPasswordSchema", () => {
    it("validates matching valid passwords", () => {
      const valid = {
        password: "NewPassword123",
        confirmPassword: "NewPassword123",
      };
      const result = resetPasswordSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it("rejects password mismatch", () => {
      const invalid = {
        password: "NewPassword123",
        confirmPassword: "MismatchPassword456",
      };
      const result = resetPasswordSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });

  describe("verifyEmailSchema", () => {
    it("validates non-empty token", () => {
      const result = verifyEmailSchema.safeParse({ token: "sample-token-123" });
      expect(result.success).toBe(true);
    });

    it("rejects empty token", () => {
      const result = verifyEmailSchema.safeParse({ token: "" });
      expect(result.success).toBe(false);
    });
  });
});
