import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const jwtToken = req.cookies.get("jwtToken");
  const pathname = req.nextUrl.pathname;

  // Redirect "/app" to "/app/items"
  if (pathname === "/app") {
    return NextResponse.redirect(new URL("/app/items", req.url));
  }

  // if (["/app/items", "/app/settings", "/app/stats"].includes(pathname)) {
  //   if (!jwtToken) {
  //     return NextResponse.redirect(new URL("/login", req.url));
  //   }
  // }

  if (pathname === "/login") {
    if (jwtToken) {
      return NextResponse.redirect(new URL("/app/items", req.url));
    }
  }

  return NextResponse.next();
}
