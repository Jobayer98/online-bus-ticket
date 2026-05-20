"use client";

import { buildSeatLabel } from "@repo/shared";
import { aisleSplitIndex } from "@/lib/seat-layout";

export type LayoutCellClass = "EMPTY" | "STANDARD" | "PREMIUM" | "BUSINESS";

const CYCLE: LayoutCellClass[] = ["EMPTY", "STANDARD", "PREMIUM", "BUSINESS"];

type Props = {
  rows: number;
  cols: number;
  grid: LayoutCellClass[][];
  onChange: (grid: LayoutCellClass[][]) => void;
};

function cellClassName(cls: LayoutCellClass): string {
  if (cls === "EMPTY") return "adm-layout-cell adm-layout-cell--empty";
  if (cls === "STANDARD") return "adm-layout-cell adm-layout-cell--standard";
  if (cls === "PREMIUM") return "adm-layout-cell adm-layout-cell--premium";
  return "adm-layout-cell adm-layout-cell--business";
}

export function createEmptyGrid(rows: number, cols: number): LayoutCellClass[][] {
  return Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => "EMPTY" as LayoutCellClass),
  );
}

export function fillGrid(
  grid: LayoutCellClass[][],
  seatClass: LayoutCellClass,
): LayoutCellClass[][] {
  if (seatClass === "EMPTY") return grid;
  return grid.map((row) => row.map(() => seatClass));
}

export function gridToTemplates(
  grid: LayoutCellClass[][],
): { label: string; row: number; col: number; seatClass: "STANDARD" | "PREMIUM" | "BUSINESS" }[] {
  const templates: {
    label: string;
    row: number;
    col: number;
    seatClass: "STANDARD" | "PREMIUM" | "BUSINESS";
  }[] = [];
  grid.forEach((row, ri) => {
    row.forEach((cell, ci) => {
      if (cell === "EMPTY") return;
      const rowNum = ri + 1;
      const colNum = ci + 1;
      templates.push({
        label: buildSeatLabel(rowNum, colNum),
        row: rowNum,
        col: colNum,
        seatClass: cell,
      });
    });
  });
  return templates;
}

export function LayoutEditorGrid({ rows, cols, grid, onChange }: Props) {
  const split = aisleSplitIndex(cols);

  function cycle(r: number, c: number) {
    const next = grid.map((row) => [...row]);
    const current = next[r][c];
    const idx = CYCLE.indexOf(current);
    next[r][c] = CYCLE[(idx + 1) % CYCLE.length]!;
    onChange(next);
  }

  return (
    <div className="adm-layout-editor">
      <div className="adm-layout-legend">
        <span>
          <span className="adm-layout-cell adm-layout-cell--empty adm-layout-cell--demo" /> Aisle
        </span>
        <span>
          <span className="adm-layout-cell adm-layout-cell--standard adm-layout-cell--demo" />{" "}
          Standard
        </span>
        <span>
          <span className="adm-layout-cell adm-layout-cell--premium adm-layout-cell--demo" /> Premium
        </span>
        <span>
          <span className="adm-layout-cell adm-layout-cell--business adm-layout-cell--demo" />{" "}
          Business
        </span>
        <span className="adm-layout-hint">Click a cell to cycle type</span>
      </div>

      <div className="adm-layout-cabin">
        <div className="adm-layout-cabin-labels">
          <span>Front (entry)</span>
          <span>Driver</span>
        </div>
        {grid.map((row, ri) => (
          <div key={ri} className="adm-layout-row">
            <span className="adm-layout-row-num">{ri + 1}</span>
            <div className="adm-layout-row-cells">
              {row.map((cell, ci) => (
                <span key={ci} className="adm-layout-cell-wrap">
                  <button
                    type="button"
                    className={cellClassName(cell)}
                    onClick={() => cycle(ri, ci)}
                    title={
                      cell === "EMPTY"
                        ? `Row ${ri + 1} col ${ci + 1} — aisle`
                        : buildSeatLabel(ri + 1, ci + 1)
                    }
                  >
                    {cell === "EMPTY" ? "·" : buildSeatLabel(ri + 1, ci + 1)}
                  </button>
                  {ci === split - 1 && cols > 2 && (
                    <span className="adm-layout-aisle" aria-hidden />
                  )}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
