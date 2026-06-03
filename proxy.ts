import NextAuth from "next-auth";

import authConfig from "./auth.config";

// Next.js 16 renamed `middleware.ts` to `proxy.ts`. The edge runtime cannot
// load Prisma or bcrypt, so we import the lightweight `auth.config` only.
// All routing/redirect logic lives in `authConfig.callbacks.authorized`.
//
// Next.js 16 specifically requires the proxy export to be recognized as a
// function — destructured assignments (`export const { auth: proxy } = ...`)
// trip the static analyzer with "must export a function". Wrap it instead.
//
// See: node_modules/next/dist/docs/01-app/01-getting-started/16-proxy.md
// See: https://github.com/nextauthjs/next-auth/discussions/13315

const { auth } = NextAuth(authConfig);

export default auth;

export const config = {
  // Run on every route except API routes, Next internals, and static assets.
  // Keeping API routes out avoids edge-runtime cost; they re-check via lib/dal.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
