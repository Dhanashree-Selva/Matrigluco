import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useProfile } from "./useProfile";
import { useUpdateProfile } from "./useProfile";
import { AiConsentState } from "../types/account.types";
import { ACCOUNT_QUERY_KEYS } from "./useProfile";

export function useAiConsent() {
  const { data: profile } = useProfile();
  const updateProfileMutation = useUpdateProfile();
  const queryClient = useQueryClient();

  const isGranted = Boolean(
    (profile?.userMetadata as any)?.ai_health_context_consent === true
  );
  const grantedAt = (profile?.userMetadata as any)?.ai_health_context_consent_at || null;

  const consentState: AiConsentState = {
    isGranted,
    grantedAt,
    version: "maternal-ai-v1",
  };

  const setConsent = (granted: boolean) => {
    const updatedMetadata = {
      ...(profile?.userMetadata || {}),
      ai_health_context_consent: granted,
      ai_health_context_consent_at: granted ? new Date().toISOString() : null,
    };

    updateProfileMutation.mutate(
      {
        ...((profile || {}) as any),
        user_metadata: updatedMetadata,
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ACCOUNT_QUERY_KEYS.profile() });
          toast.success(
            granted ? "AI Health Context Enabled" : "AI Health Context Disabled",
            {
              description: granted
                ? "The MatriGluco Assistant may now use authorized health context."
                : "The Assistant will operate strictly in zero-context mode.",
            }
          );
        },
        onError: () => {
          toast.error("Unable to update AI consent settings");
        },
      }
    );
  };

  return {
    consentState,
    isPending: updateProfileMutation.isPending,
    setConsent,
  };
}
