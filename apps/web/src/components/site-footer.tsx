"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import "./site-footer.css";

function IconPin() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5z" />
    </svg>
  );
}

function IconHome() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
    </svg>
  );
}

function IconBuilding() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 7V3H2v18h20V7H12zm-2 12H4v-2h6v2zm0-4H4v-2h6v2zm0-4H4V9h6v2zm8 8h-6v-2h6v2zm0-4h-6v-2h6v2zm0-4h-6V9h6v2z" />
    </svg>
  );
}

function IconGlobe() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
    </svg>
  );
}

function IconMail() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z" />
    </svg>
  );
}

function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function updateVisibility() {
      setVisible(window.scrollY > window.innerHeight);
    }

    updateVisibility();
    window.addEventListener("scroll", updateVisibility, { passive: true });
    window.addEventListener("resize", updateVisibility);

    return () => {
      window.removeEventListener("scroll", updateVisibility);
      window.removeEventListener("resize", updateVisibility);
    };
  }, []);

  return (
    <button
      type="button"
      className={`site-footer-top${visible ? " is-visible" : ""}`}
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Back to top"
      aria-hidden={!visible}
      tabIndex={visible ? 0 : -1}
    >
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M12 6l6 6H6l6-6z" fill="currentColor" />
      </svg>
    </button>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <section className="site-footer-contact" id="contact">
        <h2>Contact Information</h2>
        <hr className="site-footer-rule" />
        <div className="site-footer-contact-body">
          <ul className="site-footer-address">
            <li>
              <IconPin />
              <span>Dawriapur Bazar</span>
            </li>
            <li>
              <IconHome />
              <span>Shahzadpur-6770</span>
            </li>
            <li>
              <IconBuilding />
              <span>Shahzadpur</span>
            </li>
            <li>
              <IconGlobe />
              <span>Sirajganj</span>
            </li>
          </ul>
          <p className="site-footer-email">
            <IconMail />
            <a href="mailto:shahzadpurtravels1980@gmail.com">
              shahzadpurtravels1980@gmail.com
            </a>
          </p>
        </div>
        <hr className="site-footer-rule" />
      </section>

      <section className="site-footer-payments" aria-label="Payment methods">
        <div className="site-footer-payments-frame">
          <Image
            src="/images/home/ssl-commerz-inline.png"
            alt="Pay with Visa, Mastercard, bKash, Nagad, and other methods. Verified by SSLCommerz"
            width={1100}
            height={120}
            className="site-footer-payments-img"
          />
        </div>
      </section>

      <div className="site-footer-bar">
        <div className="site-footer-bar-inner">
          <p className="site-footer-bar-left">
            <span>Powered By: Shahzadpur Travels</span>
            <span className="site-footer-bar-sep" aria-hidden>
              |
            </span>
            <Link href="/about">About Us</Link>
            <span className="site-footer-bar-sep" aria-hidden>
              |
            </span>
            <Link href="/return-policy">Return Policy</Link>
            <span className="site-footer-bar-sep" aria-hidden>
              |
            </span>
            <Link href="/terms-and-conditions">Terms &amp; Conditions</Link>
            <span className="site-footer-bar-sep" aria-hidden>
              |
            </span>
            <Link href="/privacy-policy">Privacy Policy</Link>
          </p>
          <p className="site-footer-bar-right">
            Trade License No: 08-032-01046
          </p>
        </div>
      </div>

      <BackToTop />
    </footer>
  );
}
