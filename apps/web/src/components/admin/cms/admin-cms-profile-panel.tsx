"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { SiteProfileDto } from "@repo/shared";
import { CounterToast } from "@/components/counter/counter-toast";
import { useGlobalLoading } from "@/components/global-loading-provider";
import { apiGet, apiPatch } from "@/lib/api-client";
import { apiUploadCmsAsset, resolveCmsAssetUrl } from "@/lib/cms-admin-api";

export function AdminCmsProfilePanel() {
  const [profile, setProfile] = useState<SiteProfileDto | null>(null);
  const [companyName, setCompanyName] = useState("");
  const [tagline, setTagline] = useState("");
  const [tradeLicenseNo, setTradeLicenseNo] = useState("");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  useGlobalLoading(loading || saving || uploading);

  const load = useCallback(() => {
    setLoading(true);
    apiGet<SiteProfileDto>("/admin/cms/profile")
      .then((r) => {
        setProfile(r.data);
        setCompanyName(r.data.companyName);
        setTagline(r.data.tagline ?? "");
        setTradeLicenseNo(r.data.tradeLicenseNo ?? "");
        setLogoUrl(r.data.logoUrl);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load profile"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function onLogoSelected(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const uploaded = await apiUploadCmsAsset(file);
      setLogoUrl(uploaded.url);
      setToast("Logo uploaded — save profile to keep changes");
    } catch (err) {
      setToast(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await apiPatch<SiteProfileDto>("/admin/cms/profile", {
        companyName: companyName.trim(),
        tagline: tagline.trim() || null,
        tradeLicenseNo: tradeLicenseNo.trim() || null,
        logoUrl,
      });
      setProfile(res.data);
      setToast("Profile saved as draft");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  if (loading && !profile) {
    return (
      <div className="cp-section">
        <p className="adm-muted">Loading profile…</p>
      </div>
    );
  }

  return (
    <div className="cp-section">
      <CounterToast message={toast} onDismiss={() => setToast(null)} />
      <h3 className="adm-page-title">SITE PROFILE</h3>
      {error ? (
        <p className="sp-panel-error" role="alert">
          {error}
        </p>
      ) : null}

      <form className="adm-form-card" onSubmit={submit}>
        <div className="adm-form-row">
          <div className="adm-form-field adm-form-field--wide">
            <label htmlFor="cms-company-name">Company name</label>
            <input
              id="cms-company-name"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              required
              maxLength={120}
            />
          </div>
          <div className="adm-form-field adm-form-field--wide">
            <label htmlFor="cms-tagline">Tagline</label>
            <input
              id="cms-tagline"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              maxLength={200}
              placeholder="TRAVELS"
            />
          </div>
          <div className="adm-form-field">
            <label htmlFor="cms-trade-license">Trade license no.</label>
            <input
              id="cms-trade-license"
              value={tradeLicenseNo}
              onChange={(e) => setTradeLicenseNo(e.target.value)}
              maxLength={80}
            />
          </div>
        </div>

        <div className="adm-cms-logo-block">
          <div className="adm-cms-logo-preview">
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={resolveCmsAssetUrl(logoUrl)} alt="Logo preview" />
            ) : (
              <span className="adm-muted">No logo</span>
            )}
          </div>
          <div>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="adm-cms-file-input"
              onChange={(e) => onLogoSelected(e.target.files?.[0])}
            />
            <p className="adm-muted adm-cms-hint">
              JPEG, PNG, WebP, or GIF — max 5 MB. Status:{" "}
              <strong>{profile?.status ?? "—"}</strong>
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
