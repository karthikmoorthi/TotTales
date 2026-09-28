type JwtPayload = {
  sub?: unknown;
  role?: unknown;
  is_anonymous?: unknown;
};

function decodeBase64Url(value: string): string {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padding = "=".repeat((4 - (normalized.length % 4)) % 4);
  return atob(`${normalized}${padding}`);
}

/**
 * The Supabase gateway validates the JWT signature before the function runs.
 * This additional check rejects legacy anon-key JWTs, which are validly signed
 * but do not represent a signed-in user and must not be allowed to spend AI
 * credits.
 */
export function isAuthenticatedUserRequest(request: Request): boolean {
  const authorization = request.headers.get("Authorization");
  if (!authorization?.startsWith("Bearer ")) return false;

  const token = authorization.slice("Bearer ".length).trim();
  const parts = token.split(".");
  if (parts.length !== 3) return false;

  try {
    const payload = JSON.parse(decodeBase64Url(parts[1])) as JwtPayload;
    return (
      payload.role === "authenticated" &&
      typeof payload.sub === "string" &&
      payload.sub.length > 0 &&
      payload.is_anonymous !== true
    );
  } catch {
    return false;
  }
}
