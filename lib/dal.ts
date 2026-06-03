import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import type { Role } from "@prisma/client";

import { auth } from "@/auth";

// Data Access Layer (DAL). Centralizes session + role checks so each Route
// Handler and Server Component re-verifies rather than relying solely on the
// edge proxy. This is the recommended defense-in-depth pattern from the
// Next.js 16 authentication guide and mitigates CVE-2025-29927.
//
// See: node_modules/next/dist/docs/01-app/02-guides/authentication.md
//
// Role model (see prisma/schema.prisma):
//   USER  = customer  (logs in at /login,        lives at /, /shop, /account)
//   ADMIN = staff     (logs in at /admin/login,  lives at /dashboard/*)
//   OWNER = super     (logs in at /admin/login,  also gets /dashboard/users)

/**
 * Returns the current session. Wrapped in React `cache` so multiple callers
 * within a single render pass share one `auth()` call.
 */
export const getSession = cache(async () => {
  return await auth();
});

/**
 * Ensures a session exists. Redirects to /login otherwise. Use this in any
 * customer-facing Server Component or Route Handler.
 */
export const verifySession = cache(async () => {
  const session = await getSession();
  if (!session?.user?.id) {
    redirect("/login");
  }
  return {
    userId: session.user.id,
    role: session.user.role,
    name: session.user.name ?? "",
    email: session.user.email ?? "",
  };
});

/**
 * Ensures the caller is staff (ADMIN or OWNER). Redirects to /admin/login if
 * not logged in, or to / (storefront) if logged in but role is USER.
 * Use this in /dashboard pages and staff-only API routes.
 */
export const requireStaff = cache(async () => {
  const session = await getSession();
  if (!session?.user?.id) {
    redirect("/admin/login");
  }
  const role = session.user.role;
  if (role !== "ADMIN" && role !== "OWNER") {
    redirect("/");
  }
  return {
    userId: session.user.id,
    role,
    name: session.user.name ?? "",
    email: session.user.email ?? "",
  };
});

/**
 * Ensures the caller is the OWNER. Redirects to /admin/login if not logged in,
 * to / if a customer, or to /dashboard if a non-OWNER staff member.
 * Use this in /dashboard/users (and anywhere that mutates other accounts).
 */
export const requireOwner = cache(async () => {
  const session = await getSession();
  if (!session?.user?.id) {
    redirect("/admin/login");
  }
  const role = session.user.role;
  if (role === "USER") {
    redirect("/");
  }
  if (role !== "OWNER") {
    redirect("/dashboard");
  }
  return {
    userId: session.user.id,
    role,
    name: session.user.name ?? "",
    email: session.user.email ?? "",
  };
});

/**
 * Lighter helper for Route Handlers: returns the session or null without
 * redirecting. Caller is responsible for returning 401/403.
 */
export async function getAuthOr401(): Promise<
  { userId: string; role: Role; email: string } | null
> {
  const session = await getSession();
  if (!session?.user?.id) return null;
  return {
    userId: session.user.id,
    role: session.user.role,
    email: session.user.email ?? "",
  };
}
