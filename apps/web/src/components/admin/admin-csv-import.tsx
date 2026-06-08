"use client";

import { useRef, useState } from "react";
import { downloadCsv, parseCsv } from "@/lib/csv-parse";

type Props = {
  title: string;
  templateFilename: string;
  templateContent: string;
  previewHeaders: string[];
  onImport: (text: string) => Promise<void>;
  importing: boolean;
  importErrors: string[];
};

export function AdminCsvImport({
  title,
  templateFilename,
  templateContent,
  previewHeaders,
  onImport,
  importing,
  importErrors,
}: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string[][]>([]);
  const [fileError, setFileError] = useState("");

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFileError("");
    setPreview([]);
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const text = String(reader.result ?? "");
        const rows = parseCsv(text.trim()).filter((r) =>
          r.some((c) => c.length > 0),
        );
        if (rows.length < 2) {
          setFileError("CSV must have a header row and at least one data row");
          return;
        }
        setPreview(rows.slice(0, 6));
      } catch {
        setFileError("Could not read CSV file");
      }
    };
    reader.readAsText(file);
  }

  async function handleImport() {
    setFileError("");
    const file = fileRef.current?.files?.[0];
    if (!file) {
      setFileError("Choose a CSV file first");
      return;
    }
    const text = await file.text();
    await onImport(text);
    if (fileRef.current) fileRef.current.value = "";
    setPreview([]);
  }

  const headerRow = preview[0] ?? previewHeaders;
  const dataRows = preview.length > 1 ? preview.slice(1) : [];

  return (
    <div className="adm-form-card adm-csv-import">
      <h3>{title}</h3>
      <div className="adm-csv-import__actions">
        <button
          type="button"
          className="sp-btn-back"
          onClick={() => downloadCsv(templateFilename, templateContent)}
        >
          Download template
        </button>
        <input
          ref={fileRef}
          type="file"
          accept=".csv,text/csv"
          onChange={handleFileChange}
          className="adm-csv-import__file"
        />
        <button
          type="button"
          className="sp-filter-search"
          disabled={importing}
          onClick={() => void handleImport()}
        >
          {importing ? "Importing…" : "Import"}
        </button>
      </div>
      {fileError && <p className="sp-panel-error">{fileError}</p>}
      {importErrors.length > 0 && (
        <ul className="adm-csv-import__errors">
          {importErrors.map((msg) => (
            <li key={msg}>{msg}</li>
          ))}
        </ul>
      )}
      {preview.length > 0 && (
        <div className="cp-table-wrap adm-csv-import__preview">
          <table className="cp-table">
            <thead>
              <tr>
                {headerRow.map((h) => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dataRows.map((row, i) => (
                <tr key={i}>
                  {row.map((cell, j) => (
                    <td key={j}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {preview.length > 6 && (
            <p className="adm-csv-import__hint">Showing first 5 data rows</p>
          )}
        </div>
      )}
    </div>
  );
}
