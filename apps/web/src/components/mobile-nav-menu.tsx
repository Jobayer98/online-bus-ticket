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

function HamburgerIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className={`nav-hamburger__icon${open ? " is-open" : ""}`}
    >
      <path
        className="nav-hamburger__line nav-hamburger__line--top"
        d="M4 7h16"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        className="nav-hamburger__line nav-hamburger__line--mid"
        d="M4 12h16"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        className="nav-hamburger__line nav-hamburger__line--bot"
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
    <div className="mobile-nav">
      <button
        type="button"
        className={`nav-hamburger${open ? " is-open" : ""}`}
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
          className="mobile-nav__backdrop"
          aria-label="Close menu"
          onClick={close}
        />
      )}

      <nav
        id={panelId}
        className={`mobile-nav__panel${open ? " is-open" : ""}`}
        aria-label={menuLabel}
        aria-hidden={!open}
      >
        <ul className="mobile-nav__list">
          {items.map((item) => (
            <li key={`${item.type}-${item.label}`}>
              {item.type === "link" ? (
                <Link
                  href={item.href}
                  className={item.active ? "is-active" : undefined}
                  onClick={close}
                >
                  {item.label}
                </Link>
              ) : (
                <button
                  type="button"
                  className={item.active ? "is-active" : undefined}
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
