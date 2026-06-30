// src/app/api/auth/admin-logout/route.ts

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
    message: "Logout admin berhasil.",
    redirectTo: "/admin/login",
  });

  response.cookies.set("admin_token", "", COOKIE_OPTIONS);
  response.cookies.set("admin_auth_type", "", COOKIE_OPTIONS);

  response.cookies.set("admin_user_id", "", COOKIE_OPTIONS);
  response.cookies.set("admin_role", "", COOKIE_OPTIONS);
  response.cookies.set("admin_tenant_id", "", COOKIE_OPTIONS);

  return response;
}