// Auth.js v5 catch-all route — exposes /api/auth/signin, /signout,
// /callback/*, /session, /csrf, etc. Handled entirely by the framework.
//
// See: https://authjs.dev/getting-started/installation

import { handlers } from "@/auth";

export const { GET, POST } = handlers;
