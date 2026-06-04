"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
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
    <div className="auth-card">
      <form className="auth-form" onSubmit={submit} noValidate>
        <p className="auth-form__lead">
          Platform administrator sign-in. Accounts are created at bootstrap
          only.
        </p>

        <div className="auth-field">
          <label htmlFor="platform-auth-phone">Mobile number</label>
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
          />
        </div>

        <div className="auth-field">
          <label htmlFor="platform-auth-password">Password</label>
          <input
            id="platform-auth-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </div>

        {error && <p className="auth-form__error">{error}</p>}

        <button
          type="submit"
          className={`auth-form__submit${loading ? " btn-is-busy" : ""}`}
          disabled={loading}
          aria-busy={loading}
        >
          {loading ? "Signing in…" : "SIGN IN"}
        </button>
      </form>

      <p className="auth-card__footer">
        <Link href="/onboarding">Company sign-up</Link>
      </p>

      <p className="auth-card__demo" aria-label="Bootstrap account">
        Bootstrap super admin: 01700000000 · password123
      </p>
    </div>
  );
}
