"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";

import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = (await response.json()) as { message?: string };

      if (!response.ok) {
        setError(data.message ?? "Registrasi gagal");
        return;
      }

      // Auto sign-in setelah berhasil register. Public registration always
      // creates role=USER (customer), so we sign in on the customer portal.
      const signInResult = await signIn("credentials", {
        email,
        password,
        portal: "customer",
        redirect: false,
      });

      if (!signInResult || signInResult.error) {
        router.push("/login");
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 via-emerald-50 to-slate-100 px-4 py-8">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xl shadow-lg shadow-emerald-600/20">
            S
          </div>
          <h1 className="mt-3 text-2xl font-bold text-slate-900">Smart Store</h1>
          <p className="text-sm text-slate-500">Buat akun pelanggan baru</p>
        </div>

        <form
          onSubmit={handleRegister}
          className="bg-white shadow-xl shadow-slate-200/60 rounded-2xl p-6 md:p-8 border border-slate-200"
        >
          <h2 className="text-xl font-semibold text-slate-900 mb-6">
            Register
          </h2>

          <div className="space-y-4">
            <Field
              label="Nama Lengkap"
              id="name"
              placeholder="Nama kamu"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoComplete="name"
            />

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
              placeholder="Min. 8 karakter, huruf + angka"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
            />

            {error && (
              <div
                className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2"
                role="alert"
              >
                {error}
              </div>
            )}

            <Button
              type="submit"
              size="lg"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 focus-visible:ring-emerald-500"
            >
              {loading ? "Loading..." : "Daftar"}
            </Button>

            <p className="text-sm text-center text-slate-600 pt-2">
              Sudah punya akun?{" "}
              <Link
                href="/login"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Login
              </Link>
            </p>
          </div>
        </form>
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
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:border-emerald-500",
          "transition",
          className,
        )}
        {...rest}
      />
    </div>
  );
}
