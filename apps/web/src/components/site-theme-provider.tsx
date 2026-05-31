"use client";

import { createContext, useContext } from "react";
import type { CmsSiteBundleDto } from "@repo/shared";

const SiteThemeContext = createContext<CmsSiteBundleDto | null>(null);

export function SiteThemeProvider({
  bundle,
  children,
}: {
  bundle: CmsSiteBundleDto;
  children: React.ReactNode;
}) {
  return (
    <SiteThemeContext.Provider value={bundle}>{children}</SiteThemeContext.Provider>
  );
}

export function useSiteTheme(): CmsSiteBundleDto {
  const ctx = useContext(SiteThemeContext);
  if (!ctx) {
    throw new Error("useSiteTheme must be used within SiteThemeProvider");
  }
  return ctx;
}
