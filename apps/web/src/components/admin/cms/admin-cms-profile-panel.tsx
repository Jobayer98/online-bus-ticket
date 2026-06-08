"use client";

import { useCallback, useEffect, useState } from "react";
import type { SiteProfileDto } from "@repo/shared";
import { CmsImageUploadField } from "@/components/admin/cms/cms-image-upload-field";
import { CounterToast } from "@/components/counter/counter-toast";
import { useGlobalLoading } from "@/components/global-loading-provider";
import { apiGet, apiPatch } from "@/lib/api-client";
import { apiUploadCmsAsset, resolveCmsAssetUrl } from "@/lib/cms-admin-api";
import {
  admFormActionsLabel,
  admFormActionsWithLabel,
  admFormCard,
  admFormField,
  admFormFieldInput,
  admFormFieldLabel,
  admFormFieldWide,
  admFormRow,
  admMuted,
  admPageTitle,
} from "../admin-tw";
import { cpSection } from "@/components/counter/counter-tw";
import { spFilterSearch, spPanelError } from "@/components/search/search-tw";

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
      <div className={cpSection}>
        <p className={admMuted}>Loading profile…</p>
      </div>
    );
  }

  return (
    <div className={cpSection}>
      <CounterToast message={toast} onDismiss={() => setToast(null)} />
      <h3 className={admPageTitle}>SITE PROFILE</h3>
      {error ? (
        <p className={spPanelError} role="alert">
          {error}
        </p>
      ) : null}

      <form className={admFormCard} onSubmit={submit}>
        <div className={admFormRow}>
          <div className={`${admFormField} ${admFormFieldWide}`}>
            <label htmlFor="cms-company-name" className={admFormFieldLabel}>Company name</label>
            <input
              id="cms-company-name"
              className={admFormFieldInput}
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              required
              maxLength={120}
            />
          </div>
          <div className={`${admFormField} ${admFormFieldWide}`}>
            <label htmlFor="cms-tagline" className={admFormFieldLabel}>Tagline</label>
            <input
              id="cms-tagline"
              className={admFormFieldInput}
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              maxLength={200}
              placeholder="TRAVELS"
            />
          </div>
          <div className={admFormField}>
            <label htmlFor="cms-trade-license" className={admFormFieldLabel}>Trade license no.</label>
            <input
              id="cms-trade-license"
              className={admFormFieldInput}
              value={tradeLicenseNo}
              onChange={(e) => setTradeLicenseNo(e.target.value)}
              maxLength={80}
            />
          </div>
        </div>

        <CmsImageUploadField
          label="Company logo"
          hint={`JPEG, PNG, WebP, or GIF — max 5 MB. Status: ${profile?.status ?? "—"}`}
          currentUrl={logoUrl}
          resolveUrl={resolveCmsAssetUrl}
          disabled={uploading}
          onFileSelected={(file) => onLogoSelected(file)}
        />

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
