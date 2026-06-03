import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";
import authConfig from "./auth.config";

// Full Auth.js setup. This file pulls in Prisma + bcrypt and therefore must
// only be imported from Node-runtime contexts (Route Handlers, Server
// Components, Server Actions). NEVER import this from proxy.ts.

// Distinct error codes so the customer/admin login UIs can show the right
// message. NextAuth strips error details by default; subclassing
// CredentialsSignin lets `error.code` survive on the client.
class WrongPortalError extends CredentialsSignin {
  code = "WRONG_PORTAL";
}
class InvalidCredentialsError extends CredentialsSignin {
  code = "INVALID_CREDENTIALS";
}

export const { auth, handlers, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  // JWT strategy is required when mixing the Credentials provider with an
  // adapter — the adapter contract still requires its tables to exist, but
  // Session rows aren't actually written.
  session: { strategy: "jwt" },
  ...authConfig,
  providers: [
    // Replace the edge-safe stub from authConfig with the real implementation.
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        // "customer" (default) or "admin" — set by each login form.
        portal: { label: "Portal", type: "text" },
      },
      async authorize(credentials) {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;
        const portal = (credentials?.portal as string | undefined) ?? "customer";
        if (!email || !password) throw new InvalidCredentialsError();

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) throw new InvalidCredentialsError();

        const ok = await bcrypt.compare(password, user.password);
        if (!ok) throw new InvalidCredentialsError();

        // Gate by which portal the form came from. Customers can ONLY sign in
        // at /login; staff (ADMIN/OWNER) can ONLY sign in at /admin/login.
        const isStaff = user.role === "ADMIN" || user.role === "OWNER";
        if (portal === "admin" && !isStaff) throw new WrongPortalError();
        if (portal === "customer" && isStaff) throw new WrongPortalError();

        // Returned shape is what flows into the `jwt` callback as `user`.
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
});
