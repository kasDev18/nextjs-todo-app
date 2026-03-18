import { getSessionCookie } from "better-auth/cookies";
import { NextResponse, type NextRequest } from "next/server";

const AUTH_ROUTES = new Set(["/signin", "/signup"]);
const DEFAULT_REDIRECT_PATH = "/";

export default async function middleware(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;

  // Never redirect API requests, especially Better Auth endpoints.
  if (pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  const sessionToken = await getSessionCookie(request);
  const isAuthenticated = Boolean(sessionToken);
  const isAuthRoute = AUTH_ROUTES.has(pathname);

  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL(DEFAULT_REDIRECT_PATH, request.url));
  }

  function redirectToSignIn() {
    const signInUrl = new URL("/signin", request.url);
    const redirectTo = `${pathname}${request.nextUrl.search}`;

    signInUrl.searchParams.set("redirectTo", redirectTo);

    return NextResponse.redirect(signInUrl);
  }

  if (pathname === DEFAULT_REDIRECT_PATH && !isAuthenticated) {
    return redirectToSignIn();
  }

  if (!isAuthenticated && !isAuthRoute) {
    return redirectToSignIn();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
    "/signin",
    "/signup",
  ],
};
