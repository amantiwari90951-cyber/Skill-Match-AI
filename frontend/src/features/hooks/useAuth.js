import { useAuthContext } from "../auth/auth.context.jsx";

export function useAuth() {
  return useAuthContext();
}
