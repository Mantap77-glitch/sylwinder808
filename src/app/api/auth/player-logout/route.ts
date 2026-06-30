import { NextResponse } from "next/server";

const COOKIE_OPTIONS = {
  path: "/",
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  maxAge: 0,
};

export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: "Logout berhasil.",
    redirectTo: "/",
  });

  response.cookies.set("player_token", "", COOKIE_OPTIONS);
  response.cookies.set("player_session", "", COOKIE_OPTIONS);
  response.cookies.set("player_id", "", COOKIE_OPTIONS);
  response.cookies.set("player_username", "", COOKIE_OPTIONS);
  response.cookies.set("player_tenant_id", "", COOKIE_OPTIONS);
  response.cookies.set("player_tenant_code", "", COOKIE_OPTIONS);
  response.cookies.set("player_tenant_host", "", COOKIE_OPTIONS);

  return response;
}