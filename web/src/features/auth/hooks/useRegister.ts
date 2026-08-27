import { useMutation } from "@tanstack/react-query";
import { useAuth } from "../../../auth/useAuth";
import { RegisterPayload, TokenPair } from "../types/auth.types";

export function useRegister() {
  const { register } = useAuth();

  return useMutation<TokenPair, Error, RegisterPayload>({
    mutationFn: async (payload: RegisterPayload) => {
      const result = await register(payload);
      return result;
    },
  });
}
