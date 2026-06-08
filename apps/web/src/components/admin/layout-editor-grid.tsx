"use client";

import { buildSeatLabel } from "@repo/shared";
import { aisleSplitIndex } from "@/lib/seat-layout";
import {
  admLayoutAisle,
  admLayoutCabin,
  admLayoutCabinLabels,
  admLayoutCellBase,
  admLayoutCellBusiness,
  admLayoutCellDemo,
  admLayoutCellEmpty,
  admLayoutCellPremium,
  admLayoutCellStandard,
  admLayoutCellWrap,
  admLayoutEditor,
  admLayoutHint,
  admLayoutLegend,
  admLayoutRow,
  admLayoutRowCells,
  admLayoutRowNum,
} from "./admin-tw";

export type LayoutCellClass = "EMPTY" | "STANDARD" | "PREMIUM" | "BUSINESS";

const CYCLE: LayoutCellClass[] = ["EMPTY", "STANDARD", "PREMIUM", "BUSINESS"];

type Props = {
  rows: number;
  cols: number;
  grid: LayoutCellClass[][];
  onChange: (grid: LayoutCellClass[][]) => void;
};

function cellClassName(cls: LayoutCellClass): string {
  const base = admLayoutCellBase;
  if (cls === "EMPTY") return `${base} ${admLayoutCellEmpty}`;
  if (cls === "STANDARD") return `${base} ${admLayoutCellStandard}`;
  if (cls === "PREMIUM") return `${base} ${admLayoutCellPremium}`;
  return `${base} ${admLayoutCellBusiness}`;
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

export function LayoutEditorGrid({ rows: _rows, cols, grid, onChange }: Props) {
  const split = aisleSplitIndex(cols);

  function cycle(r: number, c: number) {
    const next = grid.map((row) => [...row]);
    const current = next[r][c];
    const idx = CYCLE.indexOf(current);
    next[r][c] = CYCLE[(idx + 1) % CYCLE.length]!;
    onChange(next);
  }

  const demoCell = `${admLayoutCellBase} ${admLayoutCellDemo}`;

  return (
    <div className={admLayoutEditor}>
      <div className={admLayoutLegend}>
        <span>
          <span className={`${demoCell} ${admLayoutCellEmpty}`} /> Aisle
        </span>
        <span>
          <span className={`${demoCell} ${admLayoutCellStandard}`} /> Standard
        </span>
        <span>
          <span className={`${demoCell} ${admLayoutCellPremium}`} /> Premium
        </span>
        <span>
          <span className={`${demoCell} ${admLayoutCellBusiness}`} /> Business
        </span>
        <span className={admLayoutHint}>Click a cell to cycle type</span>
      </div>

      <div className={admLayoutCabin}>
        <div className={admLayoutCabinLabels}>
          <span>Front (entry)</span>
          <span>Driver</span>
        </div>
        {grid.map((row, ri) => (
          <div key={ri} className={admLayoutRow}>
            <span className={admLayoutRowNum}>{ri + 1}</span>
            <div className={admLayoutRowCells}>
              {row.map((cell, ci) => (
                <span key={ci} className={admLayoutCellWrap}>
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
                    <span className={admLayoutAisle} aria-hidden />
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
