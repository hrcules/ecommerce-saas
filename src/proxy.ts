import { NextRequest, NextResponse } from "next/server";

export const config = {
  matcher: ["/((?!api/stripe|_next/|_static/|[\\w-]+\\.\\w+).*)"],
};

export default async function proxy(req: NextRequest) {
  const url = req.nextUrl;
  const path = url.pathname;

  // Pegamos a origem REAL de onde o clique veio (ex: https://bewear.bewearshop.com.br)
  const origin = req.headers.get("origin") || "";

  // === 1. CORS Preflight ===
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

  if (hostname.startsWith("www.") && hostname !== "www.bewearshop.com.br") {
    const cleanHostname = hostname.replace("www.", "");
    const cleanUrl = new URL(req.url);
    cleanUrl.host = cleanHostname;

    return NextResponse.redirect(cleanUrl);
  }

  const rootDomains = [
    "localhost:3000",
    "lvh.me:3000",
    "bewearshop.com.br",
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

  // 👇 A MÁGICA ENTRA AQUI 👇
  // Clonamos os headers da requisição para podermos manipulá-los antes de chegar no backend
  const requestHeaders = new Headers(req.headers);

  // Se for uma rota do Better Auth, nós forçamos a matriz como origem para burlar o bug do "*"
  if (path.startsWith("/api/auth") && origin) {
    if (origin.endsWith(".bewearshop.com.br")) {
      requestHeaders.set("origin", "https://bewearshop.com.br");
    } else if (origin.endsWith(".lvh.me:3000")) {
      requestHeaders.set("origin", "http://lvh.me:3000"); // Garante que o ambiente de dev não quebre
    }
  }

  let response;

  // Repassamos os "requestHeaders" modificados para as funções do Next.js
  if (isAppRoute || path.startsWith("/store")) {
    response = NextResponse.next({
      request: { headers: requestHeaders },
    });
  } else if (subdomain && subdomain !== "www") {
    const searchParams = url.searchParams.toString();
    const fullPath = `${path}${searchParams.length > 0 ? `?${searchParams}` : ""}`;
    response = NextResponse.rewrite(
      new URL(`/store/${subdomain}${fullPath}`, req.url),
      { request: { headers: requestHeaders } },
    );
  } else {
    response = NextResponse.next({
      request: { headers: requestHeaders },
    });
  }

  // === CORS Response Final ===
  // Devolvemos a origem REAL para o navegador do cliente ficar feliz
  if (path.startsWith("/api/auth")) {
    response.headers.set("Access-Control-Allow-Origin", origin);
    response.headers.set("Access-Control-Allow-Credentials", "true");
  }

  return response;
}
