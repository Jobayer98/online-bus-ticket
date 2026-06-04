/** Hostname only (no port). */
export function mainDomainHostname(mainDomain: string): string {
  return mainDomain.split(":")[0];
}

/**
 * Extract tenant slug from a request Host header or window.location.hostname.
 * Supports MAIN_DOMAIN subdomains (e.g. demo.lvh.me) and dev *.localhost.
 */
export function extractTenantSlugFromHost(
  host: string,
  mainDomain: string,
): string | null {
  const hostWithoutPort = host.split(":")[0];
  const mainHost = mainDomainHostname(mainDomain);

  if (
    hostWithoutPort === mainHost ||
    hostWithoutPort === "localhost" ||
    hostWithoutPort === "127.0.0.1"
  ) {
    return null;
  }

  if (hostWithoutPort.endsWith(".localhost")) {
    const slug = hostWithoutPort.slice(0, -".localhost".length);
    return slug || null;
  }

  // Dev: *.lvh.me (README default) — avoids mis-parsing when env still says "localhost"
  if (hostWithoutPort.endsWith(".lvh.me")) {
    const slug = hostWithoutPort.slice(0, -".lvh.me".length);
    return slug || null;
  }

  const parts = hostWithoutPort.split(".");
  if (parts.length < 2) return null;

  const mainParts = mainHost.split(".");
  const subdomain = parts.slice(0, parts.length - mainParts.length).join(".");
  return subdomain || null;
}
