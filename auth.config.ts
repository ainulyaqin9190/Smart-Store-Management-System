import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import type { Role } from "@prisma/client";

// Edge-safe Auth.js config. Imported by proxy.ts (which runs on the Edge
// runtime), so we MUST NOT import Prisma, bcrypt, or any Node-only module
// here. The full credentials check (with bcrypt + Prisma) lives in auth.ts.
//
// See: https://authjs.dev/getting-started/installation
// See: node_modules/next/dist/docs/01-app/01-getting-started/16-proxy.md

// Customer portal is the default sign-in page; staff use /admin/login.
export default {
  pages: {
    signIn: "/login",
  },
  providers: [
    // Provider is declared here so proxy.auth knows it exists; the actual
    // password verification is wired up in auth.ts.
    Credentials({ credentials: { email: {}, password: {}, portal: {} } }),
  ],
  callbacks: {
    // Runs inside proxy.ts on every matched request. Returning false redirects
    // to `pages.signIn`. This is OPTIMISTIC — re-check in routes via lib/dal.
    authorized({ auth, request: { nextUrl } }) {
      const user = auth?.user;
      const isLoggedIn = !!user;
      const role = (user?.role ?? null) as Role | null;
      const path = nextUrl.pathname;

      const isOnDashboard = path.startsWith("/dashboard");
      const isOnAccount = path.startsWith("/account");
      const isOnCustomerAuth = path === "/login" || path === "/register";
      const isOnAdminAuth = path === "/admin/login";

      // Dashboard is staff-only.
      if (isOnDashboard) {
        if (!isLoggedIn) {
          return Response.redirect(new URL("/admin/login", nextUrl));
        }
        if (role === "USER") {
          // A customer can never see /dashboard.
          return Response.redirect(new URL("/", nextUrl));
        }
        return true;
      }

      // /account is customer-only (riwayat order, profile, etc).
      if (isOnAccount) {
        if (!isLoggedIn) {
          return Response.redirect(new URL("/login", nextUrl));
        }
        return true;
      }

      // Already-logged-in users bouncing off auth pages.
      if (isOnCustomerAuth && isLoggedIn) {
        if (role === "ADMIN" || role === "OWNER") {
          return Response.redirect(new URL("/dashboard", nextUrl));
        }
        return Response.redirect(new URL("/", nextUrl));
      }
      if (isOnAdminAuth && isLoggedIn) {
        if (role === "ADMIN" || role === "OWNER") {
          return Response.redirect(new URL("/dashboard", nextUrl));
        }
        // A customer wandered into the admin login page while signed in.
        return Response.redirect(new URL("/", nextUrl));
      }

      return true;
    },

    // Persist id + role on the token (initial sign-in only).
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },

    // Expose id + role on the client/server session object.
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
