import { auth } from "@/auth";
import { NextResponse } from "next/server";

// Protect the admin UI. Mutating API routes additionally re-check the session
// server-side (see requireAdmin in src/lib/guard.ts).
export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isAdminArea = pathname.startsWith("/admin");
  if (isAdminArea && !req.auth) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }
  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*"],
};
