import { useMutation } from "@tanstack/react-query";
import { useAuth } from "../../../auth/useAuth";
import { LoginPayload, TokenPair } from "../types/auth.types";

export function useLogin() {
  const { login } = useAuth();

  return useMutation<TokenPair, Error, LoginPayload>({
    mutationFn: async (payload: LoginPayload) => {
      const result = await login(payload.email, payload.password);
      return result;
    },
  });
}
