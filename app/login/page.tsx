"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";

import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

// Customer login. Only role=USER can sign in here — staff (ADMIN/OWNER) get
// rejected with a WRONG_PORTAL error and are pointed at /admin/login.

export default function LoginPage() {
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
        portal: "customer",
        redirect: false,
      });

      if (!result || result.error) {
        if (result?.code === "WRONG_PORTAL") {
          setError(
            "Akun staf tidak bisa masuk di sini. Silakan gunakan halaman login admin.",
          );
        } else {
          setError("Email atau password salah");
        }
        return;
      }

      router.push("/");
      router.refresh();
    } catch (err) {
      console.error(err);
      setError("Terjadi kesalahan, coba lagi");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 via-blue-50 to-slate-100 px-4 py-8">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-xl shadow-lg shadow-blue-600/20">
            S
          </div>
          <h1 className="mt-3 text-2xl font-bold text-slate-900">Smart Store</h1>
          <p className="text-sm text-slate-500">Masuk untuk lanjut belanja</p>
        </div>

        <form
          onSubmit={handleLogin}
          className="bg-white shadow-xl shadow-slate-200/60 rounded-2xl p-6 md:p-8 border border-slate-200"
        >
          <h2 className="text-xl font-semibold text-slate-900 mb-6">
            Login Pelanggan
          </h2>

          <div className="space-y-4">
            <Field
              label="Email"
              id="email"
              type="email"
              placeholder="kamu@email.com"
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
                className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2"
                role="alert"
              >
                {error}
              </div>
            )}

            <Button type="submit" size="lg" disabled={loading} className="w-full">
              {loading ? "Loading..." : "Login"}
            </Button>

            <p className="text-sm text-center text-slate-600 pt-2">
              Belum punya akun?{" "}
              <Link
                href="/register"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Daftar di sini
              </Link>
            </p>
          </div>
        </form>

        <p className="text-center text-xs text-slate-400 mt-6">
          Karyawan/Pemilik?{" "}
          <Link href="/admin/login" className="underline hover:text-slate-600">
            Masuk ke panel admin
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
      <label htmlFor={id} className="text-sm font-medium text-slate-700">
        {label}
      </label>
      <input
        id={id}
        className={cn(
          "h-11 px-3.5 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-blue-500",
          "transition",
          className,
        )}
        {...rest}
      />
    </div>
  );
}
