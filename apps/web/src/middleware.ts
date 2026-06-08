import { extractTenantSlugFromHost } from "@repo/shared";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const MAIN_DOMAIN =
  process.env.NEXT_PUBLIC_MAIN_DOMAIN ?? "lvh.me:3000";

const PLATFORM_PATHS = ["/onboarding", "/platform", "/platform-landing"];

function mainDomainHost(): string {
  return MAIN_DOMAIN.split(":")[0];
}

function isPlatformPath(pathname: string): boolean {
  return PLATFORM_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
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

  if (!slug) {
    if (pathname === "/") {
      const url = request.nextUrl.clone();
      url.pathname = "/platform-landing";
      const response = NextResponse.rewrite(url);
      response.cookies.delete("tenant-slug");
      return response;
    }

    if (!isPlatformPath(pathname)) {
      const url = request.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
  }

  const response = NextResponse.next();

  if (slug) {
    response.headers.set("x-tenant-slug", slug);
    response.cookies.set("tenant-slug", slug, {
      path: "/",
      sameSite: "lax",
      httpOnly: false,
    });
  } else {
    response.cookies.delete("tenant-slug");
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/).*)",
  ],
};
