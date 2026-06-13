"use client";

import { createPortal } from "react-dom";
import { useFloatingPanelPosition } from "@/lib/use-floating-panel-position";
import { cn } from "@/lib/utils";

type FloatingPickerPanelProps = {
  open: boolean;
  anchorRef: React.RefObject<HTMLElement | null>;
  panelRef?: React.RefObject<HTMLDivElement | null>;
  listboxId?: string;
  ariaLabel?: string;
  width?: number;
  estimatedHeight?: number;
  className?: string;
  children: React.ReactNode;
};

const panelBaseClass =
  "rounded-md border border-[#d5d5d5] bg-white p-3 shadow-[0_8px_28px_rgba(0,0,0,0.16)]";

export function FloatingPickerPanel({
  open,
  anchorRef,
  panelRef,
  listboxId,
  ariaLabel,
  width = 300,
  estimatedHeight = 380,
  className,
  children,
}: FloatingPickerPanelProps) {
  const style = useFloatingPanelPosition(anchorRef, open, { width, estimatedHeight });

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      ref={panelRef}
      id={listboxId}
      style={style}
      className={cn(panelBaseClass, className)}
      role="dialog"
      aria-label={ariaLabel}
    >
      {children}
    </div>,
    document.body,
  );
}
