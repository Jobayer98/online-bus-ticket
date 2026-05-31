"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { CmsPageSlug, ContentPageDto } from "@repo/shared";
import { CounterToast } from "@/components/counter/counter-toast";
import { useGlobalLoading } from "@/components/global-loading-provider";
import { apiGet, apiPatch, apiPost } from "@/lib/api-client";
import { renderCmsMarkdown } from "@/lib/cms-markdown";
import { CMS_PAGE_OPTIONS } from "./cms-shared";
import "@/components/cms-markdown.css";

export function AdminCmsPagesPanel() {
  const [pages, setPages] = useState<ContentPageDto[]>([]);
  const [activeSlug, setActiveSlug] = useState<CmsPageSlug>(CMS_PAGE_OPTIONS[0].slug);
  const [title, setTitle] = useState("");
  const [bodyMarkdown, setBodyMarkdown] = useState("");
  const [hasDraft, setHasDraft] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  useGlobalLoading(loading || saving);

  const previewHtml = useMemo(() => {
    if (!bodyMarkdown.trim()) return "";
    try {
      return renderCmsMarkdown(bodyMarkdown);
    } catch {
      return "<p>Preview unavailable</p>";
    }
  }, [bodyMarkdown]);

  const loadList = useCallback(() => {
    return apiGet<ContentPageDto[]>("/admin/cms/pages").then((r) => {
      setPages(r.data);
      return r.data;
    });
  }, []);

  const loadPage = useCallback(async (slug: CmsPageSlug, list: ContentPageDto[]) => {
    const draft = list.find((p) => p.slug === slug);
    if (draft) {
      setTitle(draft.title);
      setBodyMarkdown(draft.bodyMarkdown);
      setHasDraft(true);
      return;
    }
    try {
      const res = await apiGet<ContentPageDto>(`/admin/cms/pages/${slug}`);
      setTitle(res.data.title);
      setBodyMarkdown(res.data.bodyMarkdown);
      setHasDraft(true);
    } catch {
      const meta = CMS_PAGE_OPTIONS.find((p) => p.slug === slug);
      setTitle(meta?.label ?? slug);
      setBodyMarkdown("");
      setHasDraft(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      setLoading(true);
      setError("");
      try {
        const list = await loadList();
        if (!cancelled) {
          await loadPage(activeSlug, list);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load pages");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [activeSlug, loadList, loadPage]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !bodyMarkdown.trim()) {
      setToast("Title and body are required");
      return;
    }
    setSaving(true);
    setError("");
    try {
      if (hasDraft) {
        await apiPatch(`/admin/cms/pages/${activeSlug}`, {
          title: title.trim(),
          bodyMarkdown,
        });
      } else {
        await apiPost("/admin/cms/pages", {
          slug: activeSlug,
          title: title.trim(),
          bodyMarkdown,
        });
        setHasDraft(true);
      }
      setToast("Page saved as draft");
      const list = await loadList();
      const updated = list.find((p) => p.slug === activeSlug);
      if (updated) {
        setTitle(updated.title);
        setBodyMarkdown(updated.bodyMarkdown);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  const activeMeta = CMS_PAGE_OPTIONS.find((p) => p.slug === activeSlug);

  if (loading && pages.length === 0 && !title) {
    return (
      <div className="cp-section">
        <p className="adm-muted">Loading pages…</p>
      </div>
    );
  }

  return (
    <div className="cp-section">
      <CounterToast message={toast} onDismiss={() => setToast(null)} />
      <h3 className="adm-page-title">CONTENT PAGES</h3>
      {error ? (
        <p className="sp-panel-error" role="alert">
          {error}
        </p>
      ) : null}

      <div className="adm-cms-slug-tabs" role="tablist" aria-label="Page slugs">
        {CMS_PAGE_OPTIONS.map(({ slug, label }) => (
          <button
            key={slug}
            type="button"
            role="tab"
            aria-selected={activeSlug === slug}
            className={activeSlug === slug ? "is-active" : undefined}
            onClick={() => setActiveSlug(slug)}
          >
            {label}
          </button>
        ))}
      </div>

      <form className="adm-form-card" onSubmit={save}>
        <p className="adm-muted adm-cms-hint">
          Public path: <strong>{activeMeta?.path}</strong>
          {hasDraft ? " · draft exists" : " · no draft yet (will create on save)"}
        </p>
        <div className="adm-form-field adm-form-field--wide" style={{ maxWidth: "100%" }}>
          <label htmlFor="cms-page-title">Title</label>
          <input
            id="cms-page-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            maxLength={200}
          />
        </div>

        <div className="adm-cms-editor-split">
          <div className="adm-cms-editor-pane">
            <label htmlFor="cms-page-body">Markdown body</label>
            <textarea
              id="cms-page-body"
              className="adm-cms-textarea"
              value={bodyMarkdown}
              onChange={(e) => setBodyMarkdown(e.target.value)}
              required
              rows={16}
            />
          </div>
          <div className="adm-cms-editor-pane">
            <span className="adm-cms-editor-pane__label">Preview</span>
            <article
              className="cms-markdown-body adm-cms-markdown-preview"
              dangerouslySetInnerHTML={{
                __html: previewHtml || "<p class=\"adm-muted\">Nothing to preview</p>",
              }}
            />
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
