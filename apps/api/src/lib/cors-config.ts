import type { CorsOptions } from "cors";

function parseDomainHost(domain: string): { hostname: string; port: string | null } {
  const withoutProtocol = domain.replace(/^https?:\/\//, "");
  const [hostname, port] = withoutProtocol.split(":");
  return { hostname, port: port ?? null };
}

function isLocalhostSubdomainOrigin(origin: string): boolean {
  try {
    const url = new URL(origin);
    return (
      url.hostname !== "localhost" &&
      url.hostname.endsWith(".localhost")
    );
  } catch {
    return false;
  }
}

function originMatchesMainDomain(origin: string, mainDomain: string): boolean {
  try {
    const url = new URL(origin);
    const main = parseDomainHost(mainDomain);

    if (main.port && url.port !== main.port) {
      return false;
    }

    const { hostname } = url;
    if (hostname === main.hostname) {
      return true;
    }

    return hostname.endsWith(`.${main.hostname}`);
  } catch {
    return false;
  }
}

export function createCorsOptions(): CorsOptions {
  const staticOrigins = new Set<string>([
    process.env.WEB_URL ?? "http://localhost:3000",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
  ]);

  const mainDomain = process.env.MAIN_DOMAIN;
  const extraOrigins = process.env.CORS_ALLOWED_ORIGINS?.split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  if (extraOrigins) {
    for (const origin of extraOrigins) {
      staticOrigins.add(origin);
    }
  }

  return {
    origin(origin, callback) {
      if (!origin) {
        callback(null, true);
        return;
      }

      if (staticOrigins.has(origin)) {
        callback(null, true);
        return;
      }

      if (mainDomain && originMatchesMainDomain(origin, mainDomain)) {
        callback(null, true);
        return;
      }

      if (
        process.env.NODE_ENV !== "production" &&
        isLocalhostSubdomainOrigin(origin)
      ) {
        callback(null, true);
        return;
      }

      callback(new Error(`CORS blocked origin: ${origin}`));
    },
    credentials: true,
  };
}
