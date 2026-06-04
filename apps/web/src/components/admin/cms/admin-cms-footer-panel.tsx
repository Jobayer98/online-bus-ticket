"use client";

import { useCallback, useEffect, useState } from "react";
import type { ContactLineInput, FooterBarLinkInput, FooterSettingsDto } from "@repo/shared";
import { CmsImageUploadField } from "@/components/admin/cms/cms-image-upload-field";
import { CounterToast } from "@/components/counter/counter-toast";
import { useGlobalLoading } from "@/components/global-loading-provider";
import { apiGet, apiPatch } from "@/lib/api-client";
import { apiUploadCmsAsset, resolveCmsAssetUrl } from "@/lib/cms-admin-api";
import { CMS_CONTACT_ICONS } from "./cms-shared";

const emptyLine = (): ContactLineInput => ({ icon: "pin", text: "" });
const emptyLink = (): FooterBarLinkInput => ({ label: "", href: "" });

export function AdminCmsFooterPanel() {
  const [footer, setFooter] = useState<FooterSettingsDto | null>(null);
  const [contactLines, setContactLines] = useState<ContactLineInput[]>([emptyLine()]);
  const [email, setEmail] = useState("");
  const [paymentBannerUrl, setPaymentBannerUrl] = useState<string | null>(null);
  const [barLinks, setBarLinks] = useState<FooterBarLinkInput[]>([emptyLink()]);
  const [poweredByText, setPoweredByText] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  useGlobalLoading(loading || saving || uploading);

  const load = useCallback(() => {
    setLoading(true);
    apiGet<FooterSettingsDto>("/admin/cms/footer")
      .then((r) => {
        setFooter(r.data);
        setContactLines(
          r.data.contactLines.length ? r.data.contactLines : [emptyLine()],
        );
        setEmail(r.data.email);
        setPaymentBannerUrl(r.data.paymentBannerUrl);
        setBarLinks(r.data.barLinks.length ? r.data.barLinks : [emptyLink()]);
        setPoweredByText(r.data.poweredByText ?? "");
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load footer"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function onBannerSelected(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    try {
      const uploaded = await apiUploadCmsAsset(file);
      setPaymentBannerUrl(uploaded.url);
      setToast("Banner uploaded — save footer to keep changes");
    } catch (err) {
      setToast(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const lines = contactLines.filter((l) => l.text.trim());
    const links = barLinks.filter((l) => l.label.trim() && l.href.trim());
    if (lines.length === 0) {
      setToast("Add at least one contact line");
      return;
    }
    if (links.length === 0) {
      setToast("Add at least one footer link");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const res = await apiPatch<FooterSettingsDto>("/admin/cms/footer", {
        contactLines: lines.map((l) => ({ icon: l.icon, text: l.text.trim() })),
        email: email.trim(),
        paymentBannerUrl,
        barLinks: links.map((l) => ({
          label: l.label.trim(),
          href: l.href.trim(),
        })),
        poweredByText: poweredByText.trim() || null,
      });
      setFooter(res.data);
      setToast("Footer saved as draft");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  if (loading && !footer) {
    return (
      <div className="cp-section">
        <p className="adm-muted">Loading footer…</p>
      </div>
    );
  }

  return (
    <div className="cp-section">
      <CounterToast message={toast} onDismiss={() => setToast(null)} />
      <h3 className="adm-page-title">FOOTER</h3>
      {error ? (
        <p className="sp-panel-error" role="alert">
          {error}
        </p>
      ) : null}

      <form className="adm-form-card" onSubmit={submit}>
        <h3>Contact lines</h3>
        {contactLines.map((line, i) => (
          <div key={i} className="adm-form-row adm-cms-repeat-row">
            <div className="adm-form-field">
              <label htmlFor={`cms-contact-icon-${i}`}>Icon</label>
              <select
                id={`cms-contact-icon-${i}`}
                value={line.icon}
                onChange={(e) =>
                  setContactLines((rows) =>
                    rows.map((r, j) =>
                      j === i
                        ? { ...r, icon: e.target.value as ContactLineInput["icon"] }
                        : r,
                    ),
                  )
                }
              >
                {CMS_CONTACT_ICONS.map((icon) => (
                  <option key={icon} value={icon}>
                    {icon}
                  </option>
                ))}
              </select>
            </div>
            <div className="adm-form-field adm-form-field--wide">
              <label htmlFor={`cms-contact-text-${i}`}>Text</label>
              <input
                id={`cms-contact-text-${i}`}
                value={line.text}
                onChange={(e) =>
                  setContactLines((rows) =>
                    rows.map((r, j) => (j === i ? { ...r, text: e.target.value } : r)),
                  )
                }
                maxLength={200}
              />
            </div>
            <button
              type="button"
              className="sp-btn-back"
              onClick={() =>
                setContactLines((rows) => rows.filter((_, j) => j !== i))
              }
              disabled={contactLines.length <= 1}
            >
              Remove
            </button>
          </div>
        ))}
        <button
          type="button"
          className="sp-btn-back adm-cms-inline-btn"
          onClick={() => setContactLines((rows) => [...rows, emptyLine()])}
        >
          + Contact line
        </button>

        <div className="adm-form-row" style={{ marginTop: "1rem" }}>
          <div className="adm-form-field adm-form-field--wide">
            <label htmlFor="cms-footer-email">Email</label>
            <input
              id="cms-footer-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </div>

        <h3 style={{ marginTop: "1.25rem" }}>Footer bar links</h3>
        {barLinks.map((link, i) => (
          <div key={i} className="adm-form-row adm-cms-repeat-row">
            <div className="adm-form-field">
              <label htmlFor={`cms-link-label-${i}`}>Label</label>
              <input
                id={`cms-link-label-${i}`}
                value={link.label}
                onChange={(e) =>
                  setBarLinks((rows) =>
                    rows.map((r, j) => (j === i ? { ...r, label: e.target.value } : r)),
                  )
                }
                maxLength={80}
              />
            </div>
            <div className="adm-form-field adm-form-field--wide">
              <label htmlFor={`cms-link-href-${i}`}>Href</label>
              <input
                id={`cms-link-href-${i}`}
                value={link.href}
                onChange={(e) =>
                  setBarLinks((rows) =>
                    rows.map((r, j) => (j === i ? { ...r, href: e.target.value } : r)),
                  )
                }
                maxLength={300}
                placeholder="/about"
              />
            </div>
            <button
              type="button"
              className="sp-btn-back"
              onClick={() => setBarLinks((rows) => rows.filter((_, j) => j !== i))}
              disabled={barLinks.length <= 1}
            >
              Remove
            </button>
          </div>
        ))}
        <button
          type="button"
          className="sp-btn-back adm-cms-inline-btn"
          onClick={() => setBarLinks((rows) => [...rows, emptyLink()])}
        >
          + Link
        </button>

        <div className="adm-form-field adm-form-field--wide" style={{ marginTop: "1rem" }}>
          <label htmlFor="cms-powered-by">Powered-by text</label>
          <input
            id="cms-powered-by"
            value={poweredByText}
            onChange={(e) => setPoweredByText(e.target.value)}
            maxLength={120}
          />
        </div>

        <CmsImageUploadField
          label="Payment banner"
          wide
          currentUrl={paymentBannerUrl}
          resolveUrl={resolveCmsAssetUrl}
          disabled={uploading}
          onFileSelected={(file) => onBannerSelected(file)}
        />

        <div className="adm-form-actions adm-form-actions--with-label" style={{ marginTop: "1rem" }}>
          <span className="adm-form-actions__label" aria-hidden="true">
            &nbsp;
          </span>
          <button type="submit" className="sp-filter-search" disabled={saving}>
            {saving ? "Saving…" : "Save draft"}
          </button>
        </div>
        {footer ? (
          <p className="adm-muted adm-cms-hint">Status: {footer.status}</p>
        ) : null}
      </form>
    </div>
  );
}
