import { Toaster } from "sonner";

import Sidebar from "@/components/Sidebar";
import {
  SidebarBurger,
  SidebarProvider,
  SidebarShell,
} from "@/components/SidebarShell";
import { verifySession } from "@/lib/dal";

// Server Component. verifySession() redirects if there's no session, so the
// rest of the tree can assume an authenticated user without re-checking.

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await verifySession();

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-slate-50 flex">
        <SidebarShell>
          <Sidebar role={session.role} name={session.name} />
        </SidebarShell>

        <div className="flex-1 flex flex-col min-w-0">
          <header className="sticky top-0 z-20 bg-white/95 backdrop-blur border-b border-slate-200">
            <div className="px-4 md:px-6 h-16 flex items-center gap-3">
              <SidebarBurger />
              <h1 className="text-base md:text-lg font-semibold text-slate-900 truncate">
                Smart Store Management
              </h1>
              <div className="ml-auto hidden sm:flex items-center gap-3">
                <span className="text-sm text-slate-600 truncate max-w-[160px]">
                  {session.name}
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 text-[11px] font-semibold uppercase tracking-wide text-slate-700">
                  {session.role}
                </span>
              </div>
            </div>
          </header>

          <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>
        </div>

        <Toaster
          position="top-right"
          richColors
          closeButton
          toastOptions={{
            className: "rounded-lg",
          }}
        />
      </div>
    </SidebarProvider>
  );
}
