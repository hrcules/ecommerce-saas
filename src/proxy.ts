import { NextRequest, NextResponse } from "next/server";

export const config = {
  matcher: ["/((?!api/stripe|_next/|_static/|[\\w-]+\\.\\w+).*)"],
};

export default async function proxy(req: NextRequest) {
  const url = req.nextUrl;
  const path = url.pathname;

  const origin = req.headers.get("origin") || "";

  if (path.startsWith("/api/auth")) {
    if (req.method === "OPTIONS") {
      return new NextResponse(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": origin,
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
          "Access-Control-Allow-Credentials": "true",
        },
      });
    }
  }

  const hostname = req.headers.get("host") || "";
  const rootDomains = [
    "localhost:3000",
    "bewear.com.br",
    "usebewear.vercel.app",
  ];
  const subdomain = rootDomains.includes(hostname)
    ? ""
    : hostname.split(".")[0];

  const isAppRoute =
    path.startsWith("/authentication") ||
    path.startsWith("/admin") ||
    path.startsWith("/super-admin") ||
    path.startsWith("/api");

  let response;

  if (isAppRoute || path.startsWith("/store")) {
    response = NextResponse.next();
  } else if (subdomain && subdomain !== "www") {
    const searchParams = url.searchParams.toString();
    const fullPath = `${path}${searchParams.length > 0 ? `?${searchParams}` : ""}`;
    response = NextResponse.rewrite(
      new URL(`/store/${subdomain}${fullPath}`, req.url),
    );
  } else {
    response = NextResponse.next();
  }

  if (path.startsWith("/api/auth")) {
    response.headers.set("Access-Control-Allow-Origin", origin);
    response.headers.set("Access-Control-Allow-Credentials", "true");
  }

  return response;
}
