"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  brandPaletteToCssVars,
  generateBrandPalette,
  type BrandPaletteDto,
  type SiteThemeDto,
} from "@repo/shared";
import { CounterToast } from "@/components/counter/counter-toast";
import { useGlobalLoading } from "@/components/global-loading-provider";
import { apiGet, apiPatch } from "@/lib/api-client";
import { CMS_FONT_OPTIONS } from "./cms-shared";

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
  const [toast, setToast] = useState<string | null>(null);
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
      setToast("Theme saved as draft");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  const displayPalette = theme?.palette ?? previewPalette;

  if (loading && !theme) {
    return (
      <div className="cp-section">
        <p className="adm-muted">Loading theme…</p>
      </div>
    );
  }

  return (
    <div className="cp-section">
      <CounterToast message={toast} onDismiss={() => setToast(null)} />
      <h3 className="adm-page-title">BRAND THEME</h3>
      {error ? (
        <p className="sp-panel-error" role="alert">
          {error}
        </p>
      ) : null}

      <form className="adm-form-card" onSubmit={submit}>
        <div className="adm-form-row">
          <div className="adm-form-field">
            <label htmlFor="cms-primary-color">Primary color</label>
            <div className="adm-cms-color-row">
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
                className="adm-cms-hex-input"
              />
            </div>
          </div>
          <div className="adm-form-field">
            <label htmlFor="cms-font-family">Font family</label>
            <select
              id="cms-font-family"
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

        <p className="adm-muted adm-cms-hint">
          Palette preview {theme ? `(saved: ${theme.status})` : "(unsaved)"}
        </p>
        <div className="adm-cms-palette-grid" role="list" aria-label="Brand palette">
          {PALETTE_KEYS.map((key) => (
            <div key={key} className="adm-cms-swatch" role="listitem">
              <span
                className="adm-cms-swatch__chip"
                style={{ background: displayPalette[key] }}
                title={displayPalette[key]}
              />
              <span className="adm-cms-swatch__label">{key}</span>
            </div>
          ))}
        </div>

        <div
          className="adm-cms-theme-preview"
          style={{
            ...previewVars,
            fontFamily: `"${fontFamily}", system-ui, sans-serif`,
          } as React.CSSProperties}
        >
          <div
            className="adm-cms-theme-preview__bar"
            style={{
              background: previewPalette.primary,
              color: previewPalette.textOnPrimary,
            }}
          >
            {companyPreviewLabel()}
          </div>
          <div className="adm-cms-theme-preview__body">
            <button
              type="button"
              className="adm-cms-theme-preview__btn"
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

        <div className="adm-form-actions adm-form-actions--with-label">
          <span className="adm-form-actions__label" aria-hidden="true">
            &nbsp;
          </span>
          <button type="submit" className="sp-filter-search" disabled={saving}>
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
