import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = process.env.CLARA_AUTH_TOKEN;

  // 1. Intercept ?token= query parameter to set cookie
  const urlToken = request.nextUrl.searchParams.get("token");
  let responseToReturn: NextResponse | null = null;

  if (urlToken && urlToken === token) {
    const url = request.nextUrl.clone();
    url.searchParams.delete("token");
    responseToReturn = NextResponse.redirect(url);
    
    responseToReturn.cookies.set("auth_token", urlToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });
  }

  // 2. Check authentication via Cookie or Bearer header
  const cookieToken = request.cookies.get("auth_token")?.value;
  const authHeader = request.headers.get("authorization");
  
  const isAuthenticated = 
    (token && cookieToken === token) || 
    (token && authHeader === `Bearer ${token}`) ||
    (token && urlToken === token); // allow if we just verified via URL

  // 3. Deny if not authenticated
  if (!isAuthenticated) {
    if (request.nextUrl.pathname.startsWith("/api/")) {
       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return new NextResponse(
      "<html><body style=\"background:#000;color:#0f0;font-family:monospace;padding:2rem;\"><h1>401 UNAUTHORIZED</h1><p>Access denied.</p></body></html>",
      { status: 401, headers: { "Content-Type": "text/html" } }
    );
  }

  return responseToReturn || NextResponse.next();
}

export const config = {
  // Protect all specified routes
  matcher: [
    "/", 
    "/api/:path*", 
    "/dashboard/:path*", 
    "/crm/:path*", 
    "/tasks/:path*"
  ],
};