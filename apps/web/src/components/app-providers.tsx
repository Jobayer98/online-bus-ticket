"use client";

import type { ReactNode } from "react";
import { ConfirmDialogProvider } from "@/components/confirm-dialog-provider";
import { Toaster } from "@/components/ui/sonner";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ConfirmDialogProvider>
      {children}
      <Toaster position="top-right" richColors closeButton />
    </ConfirmDialogProvider>
  );
}
