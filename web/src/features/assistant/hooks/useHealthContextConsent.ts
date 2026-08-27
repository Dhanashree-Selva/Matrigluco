import { useState, useCallback } from "react";
import { ContextConsentState } from "../types/assistant.types";

export function useHealthContextConsent(initialResourceType?: "assessment" | "report" | "tracking", initialResourceId?: string) {
  const [consentState, setConsentState] = useState<ContextConsentState>({
    isConsented: true,
    resourceType: initialResourceType,
    resourceId: initialResourceId,
    resourceLabel: initialResourceType
      ? initialResourceType === "assessment"
        ? "Risk Assessment Context"
        : initialResourceType === "report"
        ? "Medical Report Context"
        : "Daily Health Log Context"
      : undefined,
    allowedCategories: [
      "Gestational week & trimester",
      "Model-calculated risk category",
      "Verified clinical lab biomarkers (if authorized)",
    ],
  });

  const grantConsent = useCallback(() => {
    setConsentState((prev) => ({ ...prev, isConsented: true }));
  }, []);

  const revokeConsent = useCallback(() => {
    setConsentState((prev) => ({ ...prev, isConsented: false }));
  }, []);

  const setResource = useCallback(
    (type: "assessment" | "report" | "tracking", id: string, label?: string) => {
      setConsentState((prev) => ({
        ...prev,
        resourceType: type,
        resourceId: id,
        resourceLabel:
          label ||
          (type === "assessment"
            ? "Risk Assessment Context"
            : type === "report"
            ? "Medical Report Context"
            : "Daily Health Log Context"),
      }));
    },
    []
  );

  const clearResource = useCallback(() => {
    setConsentState((prev) => ({
      ...prev,
      resourceType: undefined,
      resourceId: undefined,
      resourceLabel: undefined,
    }));
  }, []);

  return {
    consentState,
    isConsented: consentState.isConsented,
    resourceType: consentState.resourceType,
    resourceId: consentState.resourceId,
    resourceLabel: consentState.resourceLabel,
    grantConsent,
    revokeConsent,
    setResource,
    clearResource,
  };
}
