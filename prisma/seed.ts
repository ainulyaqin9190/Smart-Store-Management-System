import "dotenv/config";

import bcrypt from "bcryptjs";
import { PrismaClient, Role } from "@prisma/client";

// Bootstrap the first OWNER. Idempotent: re-running this does NOT overwrite
// an existing OWNER's password — it only fills in fields if the row is missing.
//
// Trigger: `npx prisma db seed` (wired via package.json -> "prisma.seed").
// Env required: OWNER_EMAIL, OWNER_PASSWORD, OWNER_NAME (see .env.example).

const prisma = new PrismaClient();

function isStrongPassword(password: string) {
  // Mirrors app/api/auth/register/route.ts validation.
  return /^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(password);
}

async function main() {
  const email = process.env.OWNER_EMAIL;
  const password = process.env.OWNER_PASSWORD;
  const name = process.env.OWNER_NAME ?? "Pemilik";

  if (!email || !password) {
    throw new Error(
      "OWNER_EMAIL and OWNER_PASSWORD must be set in .env (see .env.example).",
    );
  }
  if (!isStrongPassword(password)) {
    throw new Error(
      "OWNER_PASSWORD must be at least 8 chars and contain letters and digits.",
    );
  }

  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    // Don't silently overwrite credentials — just make sure the role is OWNER
    // in case someone demoted it manually.
    if (existing.role !== Role.OWNER) {
      await prisma.user.update({
        where: { email },
        data: { role: Role.OWNER },
      });
      console.log(`[seed] Promoted existing user ${email} to OWNER.`);
    } else {
      console.log(`[seed] OWNER ${email} already exists — no changes.`);
    }
    return;
  }

  const hashed = await bcrypt.hash(password, 10);
  await prisma.user.create({
    data: {
      email,
      name,
      password: hashed,
      role: Role.OWNER,
    },
  });
  console.log(`[seed] Created OWNER ${email}.`);
}

main()
  .catch((err) => {
    console.error("[seed] FAILED:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
