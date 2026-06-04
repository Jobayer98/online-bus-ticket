"use client";

import { useCallback, useEffect, useState } from "react";
import type { SiteMediaDto, SiteMediaKind } from "@repo/shared";
import { CounterToast } from "@/components/counter/counter-toast";
import { useGlobalLoading } from "@/components/global-loading-provider";
import { apiDelete, apiGet, apiPatch, apiPost } from "@/lib/api-client";
import { apiUploadCmsAsset, resolveCmsAssetUrl } from "@/lib/cms-admin-api";

export function AdminCmsMediaPanel() {
  const [items, setItems] = useState<SiteMediaDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  useGlobalLoading(loading || busy);

  const hero = items.find((m) => m.kind === "HERO");
  const featured = items
    .filter((m) => m.kind === "FEATURED")
    .sort((a, b) => a.sortOrder - b.sortOrder);
  const footerPayment = items.find((m) => m.kind === "FOOTER_PAYMENT");

  const load = useCallback(() => {
    setLoading(true);
    apiGet<SiteMediaDto[]>("/admin/cms/media")
      .then((r) => setItems(r.data))
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load media"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function uploadForKind(
    file: File | undefined,
    kind: SiteMediaKind,
    existing?: SiteMediaDto,
  ) {
    if (!file) return;
    setBusy(true);
    try {
      const uploaded = await apiUploadCmsAsset(file);
      if (existing) {
        await apiPatch(`/admin/cms/media/${existing.id}`, { url: uploaded.url });
        setToast("Image updated");
      } else {
        const sortOrder =
          kind === "FEATURED"
            ? featured.length
            : 0;
        await apiPost("/admin/cms/media", {
          kind,
          url: uploaded.url,
          alt: file.name.replace(/\.[^.]+$/, ""),
          sortOrder,
        });
        setToast("Image added");
      }
      load();
    } catch (err) {
      setToast(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  async function moveFeatured(index: number, direction: -1 | 1) {
    const next = index + direction;
    if (next < 0 || next >= featured.length) return;
    const reordered = [...featured];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(next, 0, moved);
    setBusy(true);
    try {
      await apiPost("/admin/cms/media/reorder", {
        items: reordered.map((m, i) => ({ id: m.id, sortOrder: i })),
      });
      setToast("Gallery order updated");
      load();
    } catch (err) {
      setToast(err instanceof Error ? err.message : "Reorder failed");
    } finally {
      setBusy(false);
    }
  }

  async function removeMedia(id: string) {
    if (!window.confirm("Remove this image from draft media?")) return;
    setBusy(true);
    try {
      await apiDelete(`/admin/cms/media/${id}`);
      setToast("Media removed");
      load();
    } catch (err) {
      setToast(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setBusy(false);
    }
  }

  if (loading && items.length === 0) {
    return (
      <div className="cp-section">
        <p className="adm-muted">Loading media…</p>
      </div>
    );
  }

  return (
    <div className="cp-section">
      <CounterToast message={toast} onDismiss={() => setToast(null)} />
      <h3 className="adm-page-title">SITE MEDIA</h3>
      {error ? (
        <p className="sp-panel-error" role="alert">
          {error}
        </p>
      ) : null}

      <section className="adm-form-card">
        <h3>Hero image</h3>
        <MediaThumb url={hero?.url} alt={hero?.alt ?? "Hero"} />
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="adm-cms-file-input"
          onChange={(e) => {
            uploadForKind(e.target.files?.[0], "HERO", hero);
            e.target.value = "";
          }}
        />
        {hero ? (
          <button
            type="button"
            className="sp-btn-back adm-cms-inline-btn"
            onClick={() => removeMedia(hero.id)}
          >
            Remove hero
          </button>
        ) : null}
      </section>

      <section className="adm-form-card">
        <h3>Featured gallery</h3>
        <p className="adm-muted adm-cms-hint">Use arrows to reorder. Upload adds to the end.</p>
        <ul className="adm-cms-gallery-list">
          {featured.map((m, index) => (
            <li key={m.id} className="adm-cms-gallery-item">
              <MediaThumb url={m.url} alt={m.alt} />
              <div className="adm-cms-gallery-item__actions">
                <button
                  type="button"
                  className="sp-btn-back"
                  disabled={index === 0}
                  onClick={() => moveFeatured(index, -1)}
                  aria-label="Move up"
                >
                  ↑
                </button>
                <button
                  type="button"
                  className="sp-btn-back"
                  disabled={index === featured.length - 1}
                  onClick={() => moveFeatured(index, 1)}
                  aria-label="Move down"
                >
                  ↓
                </button>
                <button
                  type="button"
                  className="sp-btn-back"
                  onClick={() => removeMedia(m.id)}
                >
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="adm-cms-file-input"
          onChange={(e) => {
            uploadForKind(e.target.files?.[0], "FEATURED");
            e.target.value = "";
          }}
        />
      </section>

      <section className="adm-form-card">
        <h3>Footer payment banner</h3>
        <MediaThumb
          url={footerPayment?.url}
          alt={footerPayment?.alt ?? "Payment methods"}
          wide
        />
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="adm-cms-file-input"
          onChange={(e) => {
            uploadForKind(e.target.files?.[0], "FOOTER_PAYMENT", footerPayment);
            e.target.value = "";
          }}
        />
        {footerPayment ? (
          <button
            type="button"
            className="sp-btn-back adm-cms-inline-btn"
            onClick={() => removeMedia(footerPayment.id)}
          >
            Remove banner
          </button>
        ) : null}
      </section>
    </div>
  );
}

function MediaThumb({
  url,
  alt,
  wide,
}: {
  url?: string;
  alt: string;
  wide?: boolean;
}) {
  if (!url) {
    return <p className="adm-muted">No image set</p>;
  }
  return (
    <div className={wide ? "adm-cms-media-thumb adm-cms-media-thumb--wide" : "adm-cms-media-thumb"}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={resolveCmsAssetUrl(url)} alt={alt} />
    </div>
  );
}
