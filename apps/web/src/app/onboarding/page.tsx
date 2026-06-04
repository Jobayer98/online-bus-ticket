"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import "./onboarding.css";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
const MAIN_DOMAIN = process.env.NEXT_PUBLIC_MAIN_DOMAIN ?? "localhost:3000";

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function OnboardingPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    companyName: "",
    slug: "",
    ownerName: "",
    ownerPhone: "",
    ownerEmail: "",
    ownerPassword: "",
  });
  const [slugTouched, setSlugTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleCompanyName(value: string) {
    setForm((f) => ({
      ...f,
      companyName: value,
      slug: slugTouched ? f.slug : slugify(value),
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/api/v1/platform/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName: form.companyName,
          slug: form.slug,
          ownerName: form.ownerName,
          ownerPhone: form.ownerPhone,
          ownerEmail: form.ownerEmail || undefined,
          ownerPassword: form.ownerPassword,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json?.error?.message ?? "Registration failed");
      }
      const { token, tenant } = json.data;
      document.cookie = `token=${encodeURIComponent(token)};path=/;samesite=lax`;
      const adminUrl = `http://${tenant.slug}.${MAIN_DOMAIN}/admin`;
      router.push(adminUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="onboarding-page">
      <div className="onboarding-container">
        <div className="onboarding-brand">
          <div className="onboarding-logo">🚌</div>
          <h1 className="onboarding-brand-title">Start your bus ticketing platform</h1>
          <p className="onboarding-brand-sub">
            Set up your company in minutes. No credit card required for the free plan.
          </p>
          <ul className="onboarding-features">
            <li>✓ Up to 5 routes on free plan</li>
            <li>✓ Full booking & ticketing system</li>
            <li>✓ Counter POS included</li>
            <li>✓ Custom branding & CMS</li>
          </ul>
        </div>

        <div className="onboarding-form-panel">
          <h2 className="onboarding-form-title">Create your account</h2>

          {error && <div className="onboarding-error">{error}</div>}

          <form onSubmit={handleSubmit} className="onboarding-form">
            <div className="onboarding-section-label">Company</div>

            <div className="onboarding-field">
              <label htmlFor="companyName">Company name</label>
              <input
                id="companyName"
                type="text"
                required
                placeholder="Dhaka Express"
                value={form.companyName}
                onChange={(e) => handleCompanyName(e.target.value)}
              />
            </div>

            <div className="onboarding-field">
              <label htmlFor="slug">Subdomain slug</label>
              <div className="onboarding-slug-row">
                <input
                  id="slug"
                  type="text"
                  required
                  pattern="[a-z0-9-]+"
                  placeholder="dhaka-express"
                  value={form.slug}
                  onChange={(e) => {
                    setSlugTouched(true);
                    setForm((f) => ({ ...f, slug: slugify(e.target.value) }));
                  }}
                />
                <span className="onboarding-slug-suffix">.{MAIN_DOMAIN}</span>
              </div>
              <small>Lowercase letters, numbers, and hyphens only</small>
            </div>

            <div className="onboarding-section-label">Account owner</div>

            <div className="onboarding-field">
              <label htmlFor="ownerName">Your name</label>
              <input
                id="ownerName"
                type="text"
                required
                placeholder="Rahim Uddin"
                value={form.ownerName}
                onChange={(e) =>
                  setForm((f) => ({ ...f, ownerName: e.target.value }))
                }
              />
            </div>

            <div className="onboarding-field">
              <label htmlFor="ownerPhone">Phone number</label>
              <input
                id="ownerPhone"
                type="tel"
                required
                placeholder="01700000000"
                value={form.ownerPhone}
                onChange={(e) =>
                  setForm((f) => ({ ...f, ownerPhone: e.target.value }))
                }
              />
            </div>

            <div className="onboarding-field">
              <label htmlFor="ownerEmail">Email (optional)</label>
              <input
                id="ownerEmail"
                type="email"
                placeholder="rahim@example.com"
                value={form.ownerEmail}
                onChange={(e) =>
                  setForm((f) => ({ ...f, ownerEmail: e.target.value }))
                }
              />
            </div>

            <div className="onboarding-field">
              <label htmlFor="ownerPassword">Password</label>
              <input
                id="ownerPassword"
                type="password"
                required
                minLength={8}
                placeholder="Min. 8 characters"
                value={form.ownerPassword}
                onChange={(e) =>
                  setForm((f) => ({ ...f, ownerPassword: e.target.value }))
                }
              />
            </div>

            <button
              type="submit"
              className="onboarding-submit"
              disabled={loading}
            >
              {loading ? "Creating your platform…" : "Create platform →"}
            </button>

            <p className="onboarding-login-link">
              Already have an account?{" "}
              <a href="/login">Sign in</a>
            </p>
          </form>
        </div>
      </div>
    </main>
  );
}
