import Link from "next/link";
import type { Role } from "@prisma/client";
import type { ReactNode } from "react";

import { signOut } from "@/auth";

// Server Component. Renders the role-aware menu + logout form. State for
// the mobile drawer lives in SidebarShell (client) — this just supplies
// the markup that lives inside it.

interface SidebarProps {
  role: Role;
  name: string;
}

interface MenuItem {
  href: string;
  label: string;
  icon: ReactNode;
}

// Inline SVG keeps the bundle lean — no icon library needed.
const icons = {
  dashboard: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" aria-hidden>
      <rect x="3" y="3" width="7" height="9" />
      <rect x="14" y="3" width="7" height="5" />
      <rect x="14" y="12" width="7" height="9" />
      <rect x="3" y="16" width="7" height="5" />
    </svg>
  ),
  product: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" aria-hidden>
      <path d="M21 8V21H3V8" />
      <rect x="1" y="3" width="22" height="5" />
      <line x1="10" y1="12" x2="14" y2="12" />
    </svg>
  ),
  transaction: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" aria-hidden>
      <path d="M17 1l4 4-4 4" />
      <path d="M3 11V9a4 4 0 0 1 4-4h14" />
      <path d="M7 23l-4-4 4-4" />
      <path d="M21 13v2a4 4 0 0 1-4 4H3" />
    </svg>
  ),
  user: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" aria-hidden>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  salary: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" aria-hidden>
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  ),
  logout: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" aria-hidden>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  ),
};

const baseLinks: MenuItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: icons.dashboard },
  { href: "/dashboard/products", label: "Products", icon: icons.product },
  { href: "/dashboard/transactions", label: "Transactions", icon: icons.transaction },
];

const adminLinks: MenuItem[] = [
  { href: "/dashboard/users", label: "Users", icon: icons.user },
  { href: "/dashboard/salary", label: "Salary", icon: icons.salary },
];

export default function Sidebar({ role, name }: SidebarProps) {
  const isAdmin = role === "ADMIN";
  const links = isAdmin ? [...baseLinks, ...adminLinks] : baseLinks;
  const initial = name.trim().charAt(0).toUpperCase() || "?";

  return (
    <aside className="w-64 h-full bg-slate-900 text-slate-100 flex flex-col">
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
            S
          </div>
          <span className="text-lg font-bold tracking-tight">Smart Store</span>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <p className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
          Menu
        </p>
        <ul className="space-y-1">
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition"
              >
                <span className="text-slate-400">{link.icon}</span>
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full bg-slate-700 text-white flex items-center justify-center font-semibold">
            {initial}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-white truncate" title={name}>
              {name}
            </p>
            <p className="text-[11px] uppercase tracking-wide text-slate-400">
              {role}
            </p>
          </div>
        </div>

        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/login" });
          }}
        >
          <button
            type="submit"
            className="w-full inline-flex items-center justify-center gap-2 h-10 px-4 rounded-lg text-sm font-medium text-red-300 hover:text-white hover:bg-red-600/90 transition"
          >
            {icons.logout}
            Logout
          </button>
        </form>
      </div>
    </aside>
  );
}
