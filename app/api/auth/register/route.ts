import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";

import { prisma } from "@/lib/prisma";

// Self-service signup. Auth.js Credentials doesn't handle user creation,
// so this route handles registration only — login goes through Auth.js's
// signIn() once the user exists.

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isStrongPassword(password: string) {
  // Min 8 chars, at least one letter and one number.
  return /^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(password);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password } = body as {
      name?: string;
      email?: string;
      password?: string;
    };

    if (!name || !email || !password) {
      return NextResponse.json(
        { message: "Nama, email, dan password wajib diisi" },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { message: "Format email tidak valid" },
        { status: 400 }
      );
    }

    if (!isStrongPassword(password)) {
      return NextResponse.json(
        {
          message:
            "Password minimal 8 karakter dan mengandung huruf serta angka",
        },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { message: "Email sudah digunakan" },
        { status: 409 }
      );
    }

    const hashed = await bcrypt.hash(password, 10);

    // Role is server-controlled. Public signup ALWAYS creates a customer
    // (USER). Promotion to ADMIN/OWNER happens via /dashboard/users by the
    // OWNER — never from client input.
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashed,
        role: Role.USER,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      { message: "Registrasi berhasil", user },
      { status: 201 }
    );
  } catch (error) {
    console.error("REGISTER ERROR:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
