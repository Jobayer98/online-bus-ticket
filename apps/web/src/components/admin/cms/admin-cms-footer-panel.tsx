"use client";

import { useCallback, useEffect, useState } from "react";
import type { ContactLineInput, FooterBarLinkInput, FooterSettingsDto } from "@repo/shared";
import { CmsImageUploadField } from "@/components/admin/cms/cms-image-upload-field";
import { toast } from "@/lib/toast";
import { useGlobalLoading } from "@/components/global-loading-provider";
import { apiGet, apiPatch } from "@/lib/api-client";
import { apiUploadCmsAsset, resolveCmsAssetUrl } from "@/lib/cms-admin-api";
import { CMS_CONTACT_ICONS } from "./cms-shared";
import {
  admCmsHint,
  admCmsInlineBtn,
  admCmsRepeatRow,
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
import {
  spBtnBack,
  spFilterSearch,
  spPanelError,
} from "@/components/search/search-tw";

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
      toast.message("Banner uploaded — save footer to keep changes");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const lines = contactLines.filter((l) => l.text.trim());
    const links = barLinks.filter((l) => l.label.trim() && l.href.trim());
    if (lines.length === 0) {
      toast.error("Add at least one contact line");
      return;
    }
    if (links.length === 0) {
      toast.error("Add at least one footer link");
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
      toast.success("Footer saved as draft");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  if (loading && !footer) {
    return (
      <div className={cpSection}>
        <p className={admMuted}>Loading footer…</p>
      </div>
    );
  }

  return (
    <div className={cpSection}>
      <h3 className={admPageTitle}>FOOTER</h3>
      {error ? (
        <p className={spPanelError} role="alert">
          {error}
        </p>
      ) : null}

      <form className={admFormCard} onSubmit={submit}>
        <h3>Contact lines</h3>
        {contactLines.map((line, i) => (
          <div key={i} className={`${admFormRow} ${admCmsRepeatRow}`}>
            <div className={admFormField}>
              <label htmlFor={`cms-contact-icon-${i}`} className={admFormFieldLabel}>Icon</label>
              <select
                id={`cms-contact-icon-${i}`}
                className={admFormFieldInput}
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
            <div className={`${admFormField} ${admFormFieldWide}`}>
              <label htmlFor={`cms-contact-text-${i}`} className={admFormFieldLabel}>Text</label>
              <input
                id={`cms-contact-text-${i}`}
                className={admFormFieldInput}
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
              className={spBtnBack}
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
          className={`${spBtnBack} ${admCmsInlineBtn}`}
          onClick={() => setContactLines((rows) => [...rows, emptyLine()])}
        >
          + Contact line
        </button>

        <div className={admFormRow} style={{ marginTop: "1rem" }}>
          <div className={`${admFormField} ${admFormFieldWide}`}>
            <label htmlFor="cms-footer-email" className={admFormFieldLabel}>Email</label>
            <input
              id="cms-footer-email"
              type="email"
              className={admFormFieldInput}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </div>

        <h3 style={{ marginTop: "1.25rem" }}>Footer bar links</h3>
        {barLinks.map((link, i) => (
          <div key={i} className={`${admFormRow} ${admCmsRepeatRow}`}>
            <div className={admFormField}>
              <label htmlFor={`cms-link-label-${i}`} className={admFormFieldLabel}>Label</label>
              <input
                id={`cms-link-label-${i}`}
                className={admFormFieldInput}
                value={link.label}
                onChange={(e) =>
                  setBarLinks((rows) =>
                    rows.map((r, j) => (j === i ? { ...r, label: e.target.value } : r)),
                  )
                }
                maxLength={80}
              />
            </div>
            <div className={`${admFormField} ${admFormFieldWide}`}>
              <label htmlFor={`cms-link-href-${i}`} className={admFormFieldLabel}>Href</label>
              <input
                id={`cms-link-href-${i}`}
                className={admFormFieldInput}
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
              className={spBtnBack}
              onClick={() => setBarLinks((rows) => rows.filter((_, j) => j !== i))}
              disabled={barLinks.length <= 1}
            >
              Remove
            </button>
          </div>
        ))}
        <button
          type="button"
          className={`${spBtnBack} ${admCmsInlineBtn}`}
          onClick={() => setBarLinks((rows) => [...rows, emptyLink()])}
        >
          + Link
        </button>

        <div className={`${admFormField} ${admFormFieldWide}`} style={{ marginTop: "1rem" }}>
          <label htmlFor="cms-powered-by" className={admFormFieldLabel}>Powered-by text</label>
          <input
            id="cms-powered-by"
            className={admFormFieldInput}
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

        <div className={admFormActionsWithLabel} style={{ marginTop: "1rem" }}>
          <span className={admFormActionsLabel} aria-hidden="true">
            &nbsp;
          </span>
          <button type="submit" className={spFilterSearch} disabled={saving}>
            {saving ? "Saving…" : "Save draft"}
          </button>
        </div>
        {footer ? (
          <p className={`${admMuted} ${admCmsHint}`}>Status: {footer.status}</p>
        ) : null}
      </form>
    </div>
  );
}
