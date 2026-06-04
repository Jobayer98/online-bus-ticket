const TOKEN_KEY = "platform_token";
const ROLE_KEY = "platform_role";

export type PlatformAuthUser = {
  id: string;
  phone: string;
  name?: string | null;
  role: "SUPER_ADMIN";
};

export function setPlatformAuthSession(
  token: string,
  user: PlatformAuthUser,
): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(TOKEN_KEY, token);
  sessionStorage.setItem(ROLE_KEY, user.role);
}

export function getPlatformAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(TOKEN_KEY);
}

export function getPlatformAuthRole(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(ROLE_KEY);
}

export function clearPlatformAuthSession(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(ROLE_KEY);
}
