"use client";

import { useLayoutEffect, useState } from "react";

type Options = {
  width?: number;
  estimatedHeight?: number;
  gap?: number;
};

export function useFloatingPanelPosition(
  anchorRef: React.RefObject<HTMLElement | null>,
  open: boolean,
  options: Options = {},
) {
  const { width = 300, estimatedHeight = 380, gap = 6 } = options;
  const [style, setStyle] = useState<React.CSSProperties>({ visibility: "hidden" });

  useLayoutEffect(() => {
    if (!open) return;

    function update() {
      const anchor = anchorRef.current;
      if (!anchor) return;

      const rect = anchor.getBoundingClientRect();
      const panelWidth = Math.min(width, window.innerWidth - 16);
      const panelHeight = estimatedHeight;

      let top = rect.bottom + gap;
      let left = rect.left;

      if (top + panelHeight > window.innerHeight - 8) {
        top = rect.top - gap - panelHeight;
      }
      if (top < 8) {
        top = Math.min(rect.bottom + gap, window.innerHeight - panelHeight - 8);
      }

      if (left + panelWidth > window.innerWidth - 8) {
        left = window.innerWidth - panelWidth - 8;
      }
      if (left < 8) left = 8;

      setStyle({
        position: "fixed",
        top: Math.max(8, top),
        left,
        width: panelWidth,
        zIndex: 9999,
        visibility: "visible",
      });
    }

    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [anchorRef, open, width, estimatedHeight, gap]);

  return style;
}
