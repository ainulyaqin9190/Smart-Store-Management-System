import Link from "next/link";

import { Button } from "@/components/ui/Button";
import { getSession } from "@/lib/dal";

// Public homepage. Anyone (logged in or not) can land here. The header CTA
// adapts to the viewer's role: staff get a "Dashboard" button, customers
// get "My Account", guests get "Login / Daftar".

export default async function HomePage() {
  const session = await getSession();
  const role = session?.user?.role ?? null;
  const isStaff = role === "ADMIN" || role === "OWNER";

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 to-white">
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
              S
            </div>
            <span className="text-lg font-bold text-slate-900">Smart Store</span>
          </Link>

          <nav className="flex items-center gap-2">
            <Link
              href="/shop"
              className="hidden sm:inline-flex items-center h-10 px-3 text-sm font-medium text-slate-700 hover:text-blue-600"
            >
              Belanja
            </Link>

            {isStaff ? (
              <Link href="/dashboard">
                <Button size="sm">Dashboard</Button>
              </Link>
            ) : session?.user ? (
              <Link href="/account">
                <Button size="sm" variant="secondary">
                  Akun Saya
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/login">
                  <Button size="sm" variant="ghost">
                    Login
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm">Daftar</Button>
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto px-4 md:px-6 py-12 md:py-20">
        <section className="grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 leading-tight">
              Belanja kebutuhan harian{" "}
              <span className="text-blue-600">jadi gampang.</span>
            </h1>
            <p className="mt-5 text-lg text-slate-600 leading-relaxed">
              Smart Store adalah toko serba ada dengan stok yang terjaga dan
              transaksi cepat. Daftar gratis dan mulai belanja sekarang.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/shop">
                <Button size="lg">Lihat Produk</Button>
              </Link>
              {!session?.user && (
                <Link href="/register">
                  <Button size="lg" variant="secondary">
                    Daftar Gratis
                  </Button>
                </Link>
              )}
            </div>
          </div>

          <div className="relative">
            <div className="aspect-square rounded-3xl bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 shadow-2xl shadow-blue-600/30 flex items-center justify-center">
              <div className="text-white text-center px-6">
                <p className="text-6xl font-bold">🛒</p>
                <p className="mt-4 text-lg font-medium opacity-90">
                  Cek katalog terbaru
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-20 grid sm:grid-cols-3 gap-6">
          <Feature
            title="Stok Real-time"
            body="Cek ketersediaan barang sebelum datang ke toko."
          />
          <Feature
            title="Harga Transparan"
            body="Tidak ada biaya tersembunyi. Apa yang kamu lihat itu yang kamu bayar."
          />
          <Feature
            title="Pelayanan Cepat"
            body="Tim kami siap bantu kapanpun kamu butuh."
          />
        </section>
      </main>

      <footer className="border-t border-slate-200 py-6 mt-12">
        <div className="max-w-6xl mx-auto px-4 md:px-6 flex flex-wrap justify-between items-center gap-3 text-sm text-slate-500">
          <span>© Smart Store — Sistem Manajemen Toko</span>
          <Link href="/admin/login" className="hover:text-slate-700 underline">
            Panel Staf
          </Link>
        </div>
      </footer>
    </div>
  );
}

function Feature({ title, body }: { title: string; body: string }) {
  return (
    <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
      <h3 className="text-base font-semibold text-slate-900">{title}</h3>
      <p className="mt-2 text-sm text-slate-600 leading-relaxed">{body}</p>
    </div>
  );
}
