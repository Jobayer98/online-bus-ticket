import { extractTenantSlugFromHost } from "@repo/shared";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const MAIN_DOMAIN =
  process.env.NEXT_PUBLIC_MAIN_DOMAIN ?? "localhost";

const PLATFORM_ONLY_PATHS = ["/onboarding", "/platform"];

function mainDomainHost(): string {
  return MAIN_DOMAIN.split(":")[0];
}

export function middleware(request: NextRequest) {
  const host = request.headers.get("host") ?? "";
  const slug = extractTenantSlugFromHost(host, MAIN_DOMAIN);

  const { pathname } = request.nextUrl;

  if (slug && pathname.startsWith("/platform")) {
    const portPart = MAIN_DOMAIN.includes(":")
      ? `:${MAIN_DOMAIN.split(":")[1]}`
      : "";
    const redirectUrl = new URL(
      "/platform/login",
      `${request.nextUrl.protocol}//${mainDomainHost()}${portPart}`,
    );
    return NextResponse.redirect(redirectUrl);
  }

  const isPlatformOnlyPath = PLATFORM_ONLY_PATHS.some((p) =>
    pathname.startsWith(p),
  );
  if (!slug && !isPlatformOnlyPath) {
    const url = request.nextUrl.clone();
    url.pathname = "/onboarding";
    return NextResponse.rewrite(url);
  }

  const response = NextResponse.next();

  if (slug) {
    response.headers.set("x-tenant-slug", slug);
    response.cookies.set("tenant-slug", slug, {
      path: "/",
      sameSite: "lax",
      httpOnly: false,
    });
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/).*)",
  ],
};
