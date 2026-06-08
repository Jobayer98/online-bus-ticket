"use client";

import { useEffect, useId, useRef, useState } from "react";
import {
  admCmsFileInput,
  admCmsHint,
  admCmsMediaThumb,
  admCmsMediaThumbWide,
  admCmsUploadField,
  admCmsUploadFieldEmpty,
  admCmsUploadFieldLabel,
  admCmsUploadFieldPending,
  admMuted,
} from "../admin-tw";

type Props = {
  label: string;
  hint?: string;
  accept?: string;
  currentUrl?: string | null;
  resolveUrl: (url: string | null | undefined) => string | null;
  disabled?: boolean;
  onFileSelected: (file: File) => void | Promise<void>;
  wide?: boolean;
};

export function CmsImageUploadField({
  label,
  hint,
  accept = "image/jpeg,image/png,image/webp,image/gif",
  currentUrl,
  resolveUrl,
  disabled = false,
  onFileSelected,
  wide = false,
}: Props) {
  const inputId = useId();
  const [pendingPreview, setPendingPreview] = useState<string | null>(null);
  const [pendingName, setPendingName] = useState<string | null>(null);
  const objectUrlRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
    };
  }, []);

  function clearPendingPreview() {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
    setPendingPreview(null);
    setPendingName(null);
  }

  async function handleChange(file: File | undefined) {
    if (!file) return;
    clearPendingPreview();
    const url = URL.createObjectURL(file);
    objectUrlRef.current = url;
    setPendingPreview(url);
    setPendingName(`${file.name} (${(file.size / 1024).toFixed(1)} KB)`);
    try {
      await onFileSelected(file);
    } finally {
      clearPendingPreview();
    }
  }

  const savedSrc = resolveUrl(currentUrl);
  const previewSrc = pendingPreview ?? savedSrc;

  return (
    <div className={admCmsUploadField}>
      <label htmlFor={inputId} className={admCmsUploadFieldLabel}>
        {label}
      </label>
      {hint ? <p className={`${admMuted} ${admCmsHint}`}>{hint}</p> : null}
      <div
        className={
          wide ? `${admCmsMediaThumb} ${admCmsMediaThumbWide}` : admCmsMediaThumb
        }
      >
        {previewSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={previewSrc} alt="" />
        ) : (
          <span className={`${admMuted} ${admCmsUploadFieldEmpty}`}>No image selected</span>
        )}
      </div>
      {pendingName ? (
        <p className={`${admMuted} ${admCmsUploadFieldPending}`}>{pendingName}</p>
      ) : null}
      <input
        id={inputId}
        type="file"
        accept={accept}
        className={admCmsFileInput}
        disabled={disabled}
        onChange={(e) => {
          void handleChange(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
    </div>
  );
}
