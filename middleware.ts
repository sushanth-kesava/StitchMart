import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function hasAuthToken(request: NextRequest): boolean {
  const token = request.cookies.get("app_auth_token")?.value;
  return Boolean(token && token.trim().length > 0);
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isLoggedIn = hasAuthToken(request);

  if (pathname.startsWith("/portal/customer") && !isLoggedIn) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if ((pathname.startsWith("/portal/admin") || pathname.startsWith("/portal/superadmin")) && !isLoggedIn) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if ((pathname === "/login" || pathname === "/signup") && isLoggedIn) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/portal/:path*", "/login", "/signup"],
};
