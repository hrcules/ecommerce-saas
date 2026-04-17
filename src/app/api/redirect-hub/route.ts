import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const store = url.searchParams.get("store");

  const isDev = process.env.NODE_ENV === "development";
  const baseHost = isDev ? "localhost:3000" : "bewear.com.br";
  const protocol = isDev ? "http://" : "https://";

  if (store && store !== "www" && store !== "localhost") {
    return NextResponse.redirect(`${protocol}${store}.${baseHost}/`);
  }

  return NextResponse.redirect(`${protocol}${baseHost}`);
}
