"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";

import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

// Admin/Owner login. Only role=ADMIN or OWNER can sign in here. Customers
// (role=USER) are rejected with WRONG_PORTAL and pointed at /login.
// No register link — staff accounts are created from /dashboard/users by the
// OWNER, never self-served.

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        portal: "admin",
        redirect: false,
      });

      if (!result || result.error) {
        if (result?.code === "WRONG_PORTAL") {
          setError(
            "Akun pelanggan tidak bisa masuk di sini. Silakan gunakan halaman login utama.",
          );
        } else {
          setError("Email atau password salah");
        }
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      console.error(err);
      setError("Terjadi kesalahan, coba lagi");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4 py-8">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-slate-800 text-white flex items-center justify-center font-bold text-xl shadow-lg ring-1 ring-slate-700">
            S
          </div>
          <h1 className="mt-3 text-2xl font-bold text-white">Smart Store</h1>
          <p className="text-sm text-slate-400">Panel Admin</p>
        </div>

        <form
          onSubmit={handleLogin}
          className="bg-slate-800/80 backdrop-blur rounded-2xl p-6 md:p-8 border border-slate-700 shadow-2xl"
        >
          <h2 className="text-xl font-semibold text-white mb-1">
            Login Staf / Pemilik
          </h2>
          <p className="text-sm text-slate-400 mb-6">
            Hanya untuk akun ADMIN atau OWNER.
          </p>

          <div className="space-y-4">
            <Field
              label="Email"
              id="email"
              type="email"
              placeholder="admin@toko.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />

            <Field
              label="Password"
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />

            {error && (
              <div
                className="text-sm text-red-200 bg-red-900/50 border border-red-700 rounded-lg px-3 py-2"
                role="alert"
              >
                {error}
              </div>
            )}

            <Button
              type="submit"
              size="lg"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 focus-visible:ring-blue-400"
            >
              {loading ? "Loading..." : "Masuk Panel"}
            </Button>
          </div>
        </form>

        <p className="text-center text-xs text-slate-500 mt-6">
          Pelanggan?{" "}
          <Link href="/login" className="underline hover:text-slate-300">
            Masuk di halaman utama
          </Link>
        </p>
      </div>
    </div>
  );
}

interface FieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
}

function Field({ label, id, className, ...rest }: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-slate-300">
        {label}
      </label>
      <input
        id={id}
        className={cn(
          "h-11 px-3.5 rounded-lg border border-slate-600 bg-slate-900 text-white placeholder:text-slate-500",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-blue-500",
          "transition",
          className,
        )}
        {...rest}
      />
    </div>
  );
}
