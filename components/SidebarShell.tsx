"use client";

import { createContext, useContext, useEffect, useState } from "react";

import { cn } from "@/lib/cn";

// Client-side state for the mobile sidebar drawer. The provider MUST wrap
// both the sidebar panel AND the header (where the burger lives) — otherwise
// the burger sits outside the context and useSidebar() throws.
//
// Layout shape:
//   <SidebarProvider>
//     <SidebarShell>{<Sidebar/>}</SidebarShell>   // panel (consumer)
//     <header>...<SidebarBurger/>...</header>     // burger (consumer)
//   </SidebarProvider>

interface SidebarContextValue {
  open: boolean;
  setOpen: (v: boolean) => void;
  toggle: () => void;
}

const SidebarContext = createContext<SidebarContextValue | null>(null);

export function useSidebar() {
  const ctx = useContext(SidebarContext);
  if (!ctx) throw new Error("useSidebar must be used inside <SidebarProvider>");
  return ctx;
}

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  // Close on Escape, and lock body scroll while open on mobile.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <SidebarContext.Provider
      value={{ open, setOpen, toggle: () => setOpen((v) => !v) }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

// The sidebar panel + backdrop. Consumes context for open/close state so the
// server-rendered <Sidebar> markup can be passed in as children.
export function SidebarShell({ children }: { children: React.ReactNode }) {
  const { open, setOpen } = useSidebar();

  return (
    <>
      {/* Backdrop (mobile only) */}
      <button
        type="button"
        aria-label="Close menu"
        onClick={() => setOpen(false)}
        className={cn(
          "md:hidden fixed inset-0 z-30 bg-slate-900/50 backdrop-blur-sm transition-opacity",
          open ? "opacity-100" : "opacity-0 pointer-events-none",
        )}
      />

      {/* Sidebar panel */}
      <div
        className={cn(
          "fixed md:static top-0 left-0 z-40 h-full md:h-auto w-64 shrink-0",
          "transform transition-transform md:transform-none",
          open ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        )}
        onClick={(e) => {
          // Close drawer when a nav link inside is clicked (mobile UX).
          const target = e.target as HTMLElement;
          if (target.closest("a")) setOpen(false);
        }}
      >
        {children}
      </div>
    </>
  );
}

// Burger button used in the header. Sibling of <SidebarShell> under the same
// <SidebarProvider>, NOT a child of it.
export function SidebarBurger({ className }: { className?: string }) {
  const { toggle, open } = useSidebar();
  return (
    <button
      type="button"
      aria-label={open ? "Close menu" : "Open menu"}
      aria-expanded={open}
      onClick={toggle}
      className={cn(
        "md:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg " +
          "text-slate-700 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 " +
          "focus-visible:ring-blue-500",
        className,
      )}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-5 h-5"
        aria-hidden
      >
        {open ? (
          <>
            <path d="M18 6L6 18" />
            <path d="M6 6l12 12" />
          </>
        ) : (
          <>
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </>
        )}
      </svg>
    </button>
  );
}
