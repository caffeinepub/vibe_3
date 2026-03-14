import { useInternetIdentity } from "./useInternetIdentity";

export function useAuth() {
  const { identity, login, clear, isInitializing, isLoggingIn } =
    useInternetIdentity();

  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();

  return {
    isAuthenticated,
    isInitializing,
    isLoggingIn,
    principal: isAuthenticated ? identity?.getPrincipal() : undefined,
    login,
    logout: clear,
  };
}
