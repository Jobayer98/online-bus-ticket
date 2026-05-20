const TOKEN_KEY = "bus_ticket_token";
const ROLE_KEY = "bus_ticket_role";

export type AuthUser = {
  id: string;
  phone: string;
  name?: string | null;
  role: string;
};

export function setAuthSession(token: string, user: AuthUser): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(TOKEN_KEY, token);
  sessionStorage.setItem(ROLE_KEY, user.role);
}

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(TOKEN_KEY);
}

export function getAuthRole(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(ROLE_KEY);
}

export function clearAuthSession(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(ROLE_KEY);
}
