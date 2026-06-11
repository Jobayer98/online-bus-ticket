"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  brandPaletteToCssVars,
  generateBrandPalette,
  type BrandPaletteDto,
  type SiteThemeDto,
} from "@repo/shared";
import { toast } from "@/lib/toast";
import { useGlobalLoading } from "@/components/global-loading-provider";
import { apiGet, apiPatch } from "@/lib/api-client";
import { CMS_FONT_OPTIONS } from "./cms-shared";
import {
  admCmsColorRow,
  admCmsHexInput,
  admCmsHint,
  admCmsPaletteGrid,
  admCmsSwatch,
  admCmsSwatchChip,
  admCmsSwatchLabel,
  admCmsThemePreview,
  admCmsThemePreviewBar,
  admCmsThemePreviewBody,
  admCmsThemePreviewBtn,
  admFormActionsLabel,
  admFormActionsWithLabel,
  admFormCard,
  admFormField,
  admFormFieldInput,
  admFormFieldLabel,
  admFormRow,
  admMuted,
  admPageTitle,
} from "../admin-tw";
import { cpSection } from "@/components/counter/counter-tw";
import { spFilterSearch, spPanelError } from "@/components/search/search-tw";

const PALETTE_KEYS: (keyof BrandPaletteDto)[] = [
  "primary",
  "primaryHover",
  "primaryLight",
  "primaryMuted",
  "accent",
  "surface",
  "text",
  "textMuted",
  "textOnPrimary",
  "border",
  "success",
  "danger",
  "warning",
];

export function AdminCmsThemePanel() {
  const [theme, setTheme] = useState<SiteThemeDto | null>(null);
  const [primaryColor, setPrimaryColor] = useState("#2e7d32");
  const [fontFamily, setFontFamily] = useState<string>("Inter");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  useGlobalLoading(loading || saving);

  const previewPalette = useMemo(() => {
    try {
      return generateBrandPalette(primaryColor);
    } catch {
      return generateBrandPalette("#2e7d32");
    }
  }, [primaryColor]);

  const previewVars = useMemo(
    () => brandPaletteToCssVars(previewPalette),
    [previewPalette],
  );

  const load = useCallback(() => {
    setLoading(true);
    apiGet<SiteThemeDto>("/admin/cms/theme")
      .then((r) => {
        setTheme(r.data);
        setPrimaryColor(r.data.primaryColor);
        setFontFamily(r.data.fontFamily);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load theme"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await apiPatch<SiteThemeDto>("/admin/cms/theme", {
        primaryColor,
        fontFamily,
      });
      setTheme(res.data);
      setPrimaryColor(res.data.primaryColor);
      setFontFamily(res.data.fontFamily);
      toast.success("Theme saved as draft");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  const displayPalette = theme?.palette ?? previewPalette;

  if (loading && !theme) {
    return (
      <div className={cpSection}>
        <p className={admMuted}>Loading theme…</p>
      </div>
    );
  }

  return (
    <div className={cpSection}>
      <h3 className={admPageTitle}>BRAND THEME</h3>
      {error ? (
        <p className={spPanelError} role="alert">
          {error}
        </p>
      ) : null}

      <form className={admFormCard} onSubmit={submit}>
        <div className={admFormRow}>
          <div className={admFormField}>
            <label htmlFor="cms-primary-color" className={admFormFieldLabel}>Primary color</label>
            <div className={admCmsColorRow}>
              <input
                id="cms-primary-color"
                type="color"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                aria-label="Primary color picker"
              />
              <input
                type="text"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                pattern="^#[0-9a-fA-F]{6}$"
                maxLength={7}
                className={`${admFormFieldInput} ${admCmsHexInput}`}
              />
            </div>
          </div>
          <div className={admFormField}>
            <label htmlFor="cms-font-family" className={admFormFieldLabel}>Font family</label>
            <select
              id="cms-font-family"
              className={admFormFieldInput}
              value={fontFamily}
              onChange={(e) => setFontFamily(e.target.value)}
            >
              {CMS_FONT_OPTIONS.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>
        </div>

        <p className={`${admMuted} ${admCmsHint}`}>
          Palette preview {theme ? `(saved: ${theme.status})` : "(unsaved)"}
        </p>
        <div className={admCmsPaletteGrid} role="list" aria-label="Brand palette">
          {PALETTE_KEYS.map((key) => (
            <div key={key} className={admCmsSwatch} role="listitem">
              <span
                className={admCmsSwatchChip}
                style={{ background: displayPalette[key] }}
                title={displayPalette[key]}
              />
              <span className={admCmsSwatchLabel}>{key}</span>
            </div>
          ))}
        </div>

        <div
          className={admCmsThemePreview}
          style={{
            ...previewVars,
            fontFamily: `"${fontFamily}", system-ui, sans-serif`,
          } as React.CSSProperties}
        >
          <div
            className={admCmsThemePreviewBar}
            style={{
              background: previewPalette.primary,
              color: previewPalette.textOnPrimary,
            }}
          >
            {companyPreviewLabel()}
          </div>
          <div className={admCmsThemePreviewBody}>
            <button
              type="button"
              className={admCmsThemePreviewBtn}
              style={{
                background: previewPalette.primary,
                color: previewPalette.textOnPrimary,
              }}
            >
              Search buses
            </button>
            <p style={{ color: previewPalette.textMuted, margin: 0 }}>
              Sample muted text on surface background.
            </p>
          </div>
        </div>

        <div className={admFormActionsWithLabel}>
          <span className={admFormActionsLabel} aria-hidden="true">
            &nbsp;
          </span>
          <button type="submit" className={spFilterSearch} disabled={saving}>
            {saving ? "Saving…" : "Save draft"}
          </button>
        </div>
      </form>
    </div>
  );
}

function companyPreviewLabel() {
  return "Brand header preview";
}
