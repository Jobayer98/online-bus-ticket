"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { btnBusyClass } from "@/components/brand-loading-overlay";
import { useGlobalLoading } from "@/components/global-loading-provider";
import { platformApiPost } from "@/lib/platform-api-client";
import {
  setPlatformAuthSession,
  type PlatformAuthUser,
} from "@/lib/platform-auth-session";

type AuthResponse = {
  token: string;
  user: PlatformAuthUser;
};

export function PlatformLoginForm() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  useGlobalLoading(loading);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const trimmedPhone = phone.replace(/\D/g, "");
    if (trimmedPhone.length !== 11) {
      setError("Enter a valid 11-digit mobile number.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      const r = await platformApiPost<AuthResponse>("/platform/auth/login", {
        phone: trimmedPhone,
        password,
      });
      setPlatformAuthSession(r.data.token, r.data.user);
      router.push("/platform");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-[360px]">
      <form onSubmit={submit} noValidate>
        <p className="mb-4 text-left text-[0.88rem] leading-relaxed text-[#555]">
          Platform administrator sign-in. Accounts are created at bootstrap
          only.
        </p>

        <div className="mb-3.5 text-left">
          <label htmlFor="platform-auth-phone" className="mb-1 block text-[0.8rem] font-semibold text-[#444]">
            Mobile number
          </label>
          <input
            id="platform-auth-phone"
            type="tel"
            inputMode="numeric"
            autoComplete="tel"
            maxLength={11}
            value={phone}
            onChange={(e) =>
              setPhone(e.target.value.replace(/\D/g, "").slice(0, 11))
            }
            placeholder="01XXXXXXXXX"
            className="box-border h-[42px] w-full rounded border border-[#c5c5c5] px-3 text-base focus:border-[var(--primary)] focus:shadow-[0_0_0_2px_rgba(46,125,50,0.15)] focus:outline-none"
          />
        </div>

        <div className="mb-3.5 text-left">
          <label htmlFor="platform-auth-password" className="mb-1 block text-[0.8rem] font-semibold text-[#444]">
            Password
          </label>
          <input
            id="platform-auth-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="box-border h-[42px] w-full rounded border border-[#c5c5c5] px-3 text-base focus:border-[var(--primary)] focus:shadow-[0_0_0_2px_rgba(46,125,50,0.15)] focus:outline-none"
          />
        </div>

        {error && <p className="mb-3 text-[0.88rem] font-medium text-[#c62828]">{error}</p>}

        <button
          type="submit"
          className={`mt-1 h-11 w-full cursor-pointer rounded border-0 bg-[var(--primary-hover)] font-[inherit] text-[0.9rem] font-bold tracking-widest text-white hover:bg-[#145214] disabled:cursor-not-allowed disabled:opacity-65 ${loading ? btnBusyClass : ""}`}
          disabled={loading}
          aria-busy={loading}
        >
          {loading ? "Signing in…" : "SIGN IN"}
        </button>
      </form>

      <p className="mt-5 text-center text-[0.85rem]">
        <Link href="/onboarding" className="font-medium text-[var(--primary)] no-underline hover:underline">
          Company sign-up
        </Link>
      </p>

      <p className="mt-4 border-t border-dashed border-[#e0e0e0] pt-3.5 text-center text-[0.72rem] leading-snug text-[#888]" aria-label="Bootstrap account">
        Bootstrap super admin: 01700000000 · password123
      </p>
    </div>
  );
}
