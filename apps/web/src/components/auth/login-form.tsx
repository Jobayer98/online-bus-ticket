"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useGlobalLoading } from "@/components/global-loading-provider";
import { apiPost } from "@/lib/api-client";
import { setAuthSession, type AuthUser } from "@/lib/auth-session";

type AuthResponse = {
  token: string;
  user: AuthUser;
};

function homeForRole(role: string): string {
  if (role === "ADMIN") return "/admin";
  if (role === "COUNTER_SELLER") return "/counter";
  return "/dashboard";
}

export function LoginForm() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
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
    if (mode === "register" && !name.trim()) {
      setError("Enter your name to register.");
      return;
    }

    setLoading(true);
    try {
      const path = mode === "login" ? "/auth/login" : "/auth/register";
      const r = await apiPost<AuthResponse>(path, {
        phone: trimmedPhone,
        password,
        name: mode === "register" ? name.trim() : "User",
      });
      setAuthSession(r.data.token, r.data.user);
      router.push(homeForRole(r.data.user.role));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-card">
      <div className="auth-card__tabs">
        <button
          type="button"
          className={mode === "login" ? "is-active" : undefined}
          onClick={() => {
            setMode("login");
            setError("");
          }}
        >
          Login
        </button>
        <button
          type="button"
          className={mode === "register" ? "is-active" : undefined}
          onClick={() => {
            setMode("register");
            setError("");
          }}
        >
          Register
        </button>
      </div>

      <form className="auth-form" onSubmit={submit} noValidate>
        <p className="auth-form__lead">
          {mode === "login"
            ? "Sign in to view your bookings and manage your account."
            : "Create an account to book tickets faster next time."}
        </p>

        {mode === "register" && (
          <div className="auth-field">
            <label htmlFor="auth-name">Full name</label>
            <input
              id="auth-name"
              type="text"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
            />
          </div>
        )}

        <div className="auth-field">
          <label htmlFor="auth-phone">Mobile number</label>
          <input
            id="auth-phone"
            type="tel"
            inputMode="numeric"
            autoComplete="tel"
            maxLength={11}
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 11))}
            placeholder="01XXXXXXXXX"
          />
        </div>

        <div className="auth-field">
          <label htmlFor="auth-password">Password</label>
          <input
            id="auth-password"
            type="password"
            autoComplete={mode === "login" ? "current-password" : "new-password"}
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
          {loading
            ? "Processing…"
            : mode === "login"
              ? "SIGN IN"
              : "CREATE ACCOUNT"}
        </button>
      </form>

      <p className="auth-card__footer">
        <Link href="/">← Back to home</Link>
        <span className="auth-card__sep">·</span>
        <Link href="/ticket">Download ticket</Link>
      </p>

      <p className="auth-card__demo" aria-label="Demo accounts">
        Demo: customer any phone + register · staff 01700000001 (admin) or
        01700000002 (counter) · password123
      </p>
    </div>
  );
}
