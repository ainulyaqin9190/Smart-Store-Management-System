import clsx, { type ClassValue } from "clsx";

// Tiny wrapper around clsx so every `className=cn(...)` site looks the same.
// Add `tailwind-merge` later if duplicate-class conflicts become a problem.

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}
