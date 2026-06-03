"use client";

import { useEffect, useRef } from "react";

import { Button } from "@/components/ui/Button";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

// Native <dialog> based modal. Browsers handle focus trap, backdrop, and Esc.
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Konfirmasi",
  cancelLabel = "Batal",
  destructive = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onCancel}
      // Backdrop click closes the dialog: the dialog itself fills its bounding
      // box, so any click whose target IS the dialog (not a child) is the
      // backdrop.
      onClick={(e) => {
        if (e.target === ref.current) onCancel();
      }}
      className="rounded-2xl p-0 backdrop:bg-slate-900/50 backdrop:backdrop-blur-sm w-full max-w-md"
    >
      <div className="p-6">
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
        {description && (
          <p className="mt-2 text-sm text-slate-600">{description}</p>
        )}

        <div className="mt-6 flex justify-end gap-2">
          <Button variant="secondary" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button
            variant={destructive ? "danger" : "primary"}
            onClick={onConfirm}
            autoFocus
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </dialog>
  );
}
