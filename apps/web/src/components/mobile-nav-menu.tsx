"use client";

import Link from "next/link";
import { useEffect, useId, useState } from "react";

export type MobileNavLink = {
  type: "link";
  href: string;
  label: string;
  active?: boolean;
};

export type MobileNavButton = {
  type: "button";
  label: string;
  active?: boolean;
  onClick: () => void;
};

export type MobileNavItem = MobileNavLink | MobileNavButton;

type MobileNavMenuProps = {
  items: MobileNavItem[];
  menuLabel?: string;
};

const listItemClass =
  "block w-full border-b border-[#f0f0f0] bg-transparent px-5 py-3 text-left text-base font-medium text-[#222] no-underline transition-colors hover:bg-[#f5f5f5] hover:text-[var(--primary)]";

const listItemActiveClass = `${listItemClass} border-l-[3px] border-l-[#c62828] bg-[#f0f7f0] pl-[calc(1.25rem-3px)] font-bold text-[var(--primary)]`;

function HamburgerIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className={open ? "is-open" : ""}
    >
      <path
        className={`origin-center transition-all duration-200 ${open ? "translate-y-[5px] rotate-45" : ""}`}
        d="M4 7h16"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        className={`transition-opacity duration-200 ${open ? "opacity-0" : ""}`}
        d="M4 12h16"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        className={`origin-center transition-all duration-200 ${open ? "-translate-y-[5px] -rotate-45" : ""}`}
        d="M4 17h16"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function MobileNavMenu({ items, menuLabel = "Menu" }: MobileNavMenuProps) {
  const panelId = useId();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function close() {
    setOpen(false);
  }

  return (
    <div className="hidden shrink-0 max-md:block">
      <button
        type="button"
        className="flex h-[42px] w-[42px] items-center justify-center rounded border border-[var(--border)] bg-white p-0 font-[inherit] text-[#333] hover:border-[var(--primary)] hover:text-[var(--primary)]"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={open ? "Close menu" : "Open menu"}
      >
        <HamburgerIcon open={open} />
      </button>

      {open && (
        <button
          type="button"
          className="fixed inset-0 z-[90] cursor-pointer border-0 bg-black/45 p-0"
          aria-label="Close menu"
          onClick={close}
        />
      )}

      <nav
        id={panelId}
        className={`fixed top-0 right-0 z-[100] m-0 h-dvh w-[min(280px,88vw)] overflow-y-auto border-l border-[var(--border)] bg-white py-4 shadow-[-4px_0_24px_rgba(0,0,0,0.12)] transition-transform duration-250 ease-out ${open ? "pointer-events-auto translate-x-0" : "pointer-events-none translate-x-full"}`}
        aria-label={menuLabel}
        aria-hidden={!open}
      >
        <ul className="m-0 list-none p-0">
          {items.map((item) => (
            <li key={`${item.type}-${item.label}`}>
              {item.type === "link" ? (
                <Link
                  href={item.href}
                  className={item.active ? listItemActiveClass : listItemClass}
                  onClick={close}
                >
                  {item.label}
                </Link>
              ) : (
                <button
                  type="button"
                  className={item.active ? listItemActiveClass : listItemClass}
                  onClick={() => {
                    item.onClick();
                    close();
                  }}
                >
                  {item.label}
                </button>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
