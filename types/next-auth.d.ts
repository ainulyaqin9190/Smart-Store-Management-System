import type { DefaultSession, DefaultUser } from "next-auth";
import type { DefaultJWT } from "next-auth/jwt";
import type { Role } from "@prisma/client";

// Augment next-auth's built-in types so `session.user.id` and
// `session.user.role` are strongly typed everywhere `auth()` is called.

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: Role;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    role: Role;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id?: string;
    role?: Role;
  }
}
