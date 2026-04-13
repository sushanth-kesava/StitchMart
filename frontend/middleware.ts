import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

type AppRole = "customer" | "admin" | "superadmin";

function normalizeRole(role: string | null | undefined): AppRole {
  const normalized = String(role || "customer").trim().toLowerCase();

  if (normalized === "admin" || normalized === "superadmin") {
    return normalized;
  }

  return "customer";
}

function getPortalPathForRole(role: AppRole): string {
  if (role === "superadmin") {
    return "/portal/superadmin";
  }

  if (role === "admin") {
    return "/portal/admin";
  }

  return "/portal/customer";
}

function sanitizeNextPath(path: string | null): string {
  const candidate = String(path || "").trim();

  if (!candidate.startsWith("/") || candidate.startsWith("//")) {
    return "";
  }

  return candidate;
}

function canAccessPath(role: AppRole, path: string): boolean {
  if (path.startsWith("/portal/superadmin")) {
    return role === "superadmin";
  }

  if (path.startsWith("/portal/admin")) {
    return role === "admin";
  }

  if (path.startsWith("/portal/customer")) {
    return role === "customer";
  }

  return true;
}

function hasAuthToken(request: NextRequest): boolean {
  const token = request.cookies.get("app_auth_token")?.value;
  return Boolean(token && token.trim().length > 0);
}

function getSessionRole(request: NextRequest): AppRole {
  return normalizeRole(request.cookies.get("user_role")?.value);
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isLoggedIn = hasAuthToken(request);
  const sessionRole = getSessionRole(request);

  if (isLoggedIn && pathname.startsWith("/portal/") && !canAccessPath(sessionRole, pathname)) {
    return NextResponse.redirect(new URL(getPortalPathForRole(sessionRole), request.url));
  }

  if (pathname.startsWith("/portal/customer") && !isLoggedIn) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    loginUrl.searchParams.set("role", "customer");
    return NextResponse.redirect(loginUrl);
  }

  if ((pathname.startsWith("/portal/admin") || pathname.startsWith("/portal/superadmin")) && !isLoggedIn) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    loginUrl.searchParams.set("role", pathname.startsWith("/portal/superadmin") ? "superadmin" : "admin");
    return NextResponse.redirect(loginUrl);
  }

  if ((pathname === "/login" || pathname === "/signup") && isLoggedIn) {
    const requestedNext = sanitizeNextPath(request.nextUrl.searchParams.get("next"));
    const redirectTarget = requestedNext && canAccessPath(sessionRole, requestedNext)
      ? requestedNext
      : getPortalPathForRole(sessionRole);
    return NextResponse.redirect(new URL(redirectTarget, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/portal/:path*", "/login", "/signup"],
};
