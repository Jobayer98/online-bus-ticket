"use client";

import { useEffect, useId, useRef, useState } from "react";

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
    <div className="adm-cms-upload-field">
      <label htmlFor={inputId} className="adm-cms-upload-field__label">
        {label}
      </label>
      {hint ? <p className="adm-muted adm-cms-hint">{hint}</p> : null}
      <div
        className={
          wide
            ? "adm-cms-media-thumb adm-cms-media-thumb--wide adm-cms-upload-field__thumb"
            : "adm-cms-media-thumb adm-cms-upload-field__thumb"
        }
      >
        {previewSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={previewSrc} alt="" />
        ) : (
          <span className="adm-muted adm-cms-upload-field__empty">No image selected</span>
        )}
      </div>
      {pendingName ? (
        <p className="adm-muted adm-cms-upload-field__pending">{pendingName}</p>
      ) : null}
      <input
        id={inputId}
        type="file"
        accept={accept}
        className="adm-cms-file-input"
        disabled={disabled}
        onChange={(e) => {
          void handleChange(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
    </div>
  );
}
