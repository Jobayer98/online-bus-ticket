"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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

  const fieldInputClass =
    "rounded border border-[#d1d5db] px-3 py-2 text-[0.9rem] outline-none transition-[border-color] focus:border-[var(--color-primary,#1a56db)] focus:shadow-[0_0_0_2px_rgba(26,86,219,0.15)]";

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f8f9fa] p-8">
      <div className="grid w-full max-w-[960px] overflow-hidden rounded-lg border border-[#e5e7eb] bg-white shadow-[0_4px_24px_rgba(0,0,0,0.08)] max-[640px]:grid-cols-1 md:grid-cols-2">
        <div className="flex flex-col gap-5 bg-[var(--color-primary,#1a56db)] p-10 text-white max-[640px]:p-6">
          <div className="text-5xl leading-none">🚌</div>
          <h1 className="m-0 text-2xl leading-snug font-bold">
            Start your bus ticketing platform
          </h1>
          <p className="m-0 text-[0.95rem] leading-relaxed opacity-85">
            Set up your company in minutes. No credit card required for the free plan.
          </p>
          <ul className="m-0 mt-2 flex list-none flex-col gap-2.5 p-0 text-[0.9rem] opacity-90">
            <li>✓ Up to 5 routes on free plan</li>
            <li>✓ Full booking & ticketing system</li>
            <li>✓ Counter POS included</li>
            <li>✓ Custom branding & CMS</li>
          </ul>
        </div>

        <div className="flex flex-col gap-4 p-10 max-[640px]:px-6 max-[640px]:pb-8 max-[640px]:pt-6">
          <h2 className="m-0 mb-2 text-xl font-bold text-[#111827]">
            Create your account
          </h2>

          {error && (
            <div className="rounded border border-[#fca5a5] bg-[#fef2f2] px-3.5 py-2.5 text-[0.875rem] text-[#b91c1c]">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
            <div className="mt-1 text-xs font-semibold tracking-widest text-[#6b7280] uppercase">
              Company
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="companyName" className="text-sm font-medium text-[#374151]">
                Company name
              </label>
              <input
                id="companyName"
                type="text"
                required
                placeholder="Dhaka Express"
                value={form.companyName}
                onChange={(e) => handleCompanyName(e.target.value)}
                className={fieldInputClass}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="slug" className="text-sm font-medium text-[#374151]">
                Subdomain slug
              </label>
              <div className="flex items-center">
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
                  className={`${fieldInputClass} flex-1 rounded-r-none border-r-0`}
                />
                <span className="whitespace-nowrap rounded-r border border-l-0 border-[#d1d5db] bg-[#f3f4f6] px-3 py-2 text-sm text-[#6b7280]">
                  .{MAIN_DOMAIN}
                </span>
              </div>
              <small className="text-xs text-[#9ca3af]">
                Lowercase letters, numbers, and hyphens only
              </small>
            </div>

            <div className="mt-1 text-xs font-semibold tracking-widest text-[#6b7280] uppercase">
              Account owner
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="ownerName" className="text-sm font-medium text-[#374151]">
                Your name
              </label>
              <input
                id="ownerName"
                type="text"
                required
                placeholder="Rahim Uddin"
                value={form.ownerName}
                onChange={(e) =>
                  setForm((f) => ({ ...f, ownerName: e.target.value }))
                }
                className={fieldInputClass}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="ownerPhone" className="text-sm font-medium text-[#374151]">
                Phone number
              </label>
              <input
                id="ownerPhone"
                type="tel"
                required
                placeholder="01700000000"
                value={form.ownerPhone}
                onChange={(e) =>
                  setForm((f) => ({ ...f, ownerPhone: e.target.value }))
                }
                className={fieldInputClass}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="ownerEmail" className="text-sm font-medium text-[#374151]">
                Email (optional)
              </label>
              <input
                id="ownerEmail"
                type="email"
                placeholder="rahim@example.com"
                value={form.ownerEmail}
                onChange={(e) =>
                  setForm((f) => ({ ...f, ownerEmail: e.target.value }))
                }
                className={fieldInputClass}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="ownerPassword" className="text-sm font-medium text-[#374151]">
                Password
              </label>
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
                className={fieldInputClass}
              />
            </div>

            <button
              type="submit"
              className="mt-2 cursor-pointer rounded border-0 bg-[var(--color-primary,#1a56db)] px-6 py-3 text-base font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
              disabled={loading}
            >
              {loading ? "Creating your platform…" : "Create platform →"}
            </button>

            <p className="m-0 text-center text-[0.85rem] text-[#6b7280]">
              Already have an account?{" "}
              <a href="/login" className="font-medium text-[var(--color-primary,#1a56db)] no-underline">
                Sign in
              </a>
            </p>
          </form>
        </div>
      </div>
    </main>
  );
}
