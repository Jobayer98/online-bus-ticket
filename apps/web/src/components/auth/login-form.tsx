"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { btnBusyClass } from "@/components/brand-loading-overlay";
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
  if (role === "SUPER_ADMIN") {
    throw new Error("Use platform admin login at /platform/login");
  }
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
    <div className="w-full max-w-[360px]">
      <div className="mb-5 grid grid-cols-2 overflow-hidden rounded border border-[#d0d0d0]">
        <button
          type="button"
          className={`cursor-pointer border-0 px-3 py-2.5 font-[inherit] text-[0.9rem] font-semibold ${mode === "login" ? "bg-[var(--primary-hover)] text-white" : "bg-[#f8f8f8] text-[#555]"}`}
          onClick={() => {
            setMode("login");
            setError("");
          }}
        >
          Login
        </button>
        <button
          type="button"
          className={`cursor-pointer border-0 px-3 py-2.5 font-[inherit] text-[0.9rem] font-semibold ${mode === "register" ? "bg-[var(--primary-hover)] text-white" : "bg-[#f8f8f8] text-[#555]"}`}
          onClick={() => {
            setMode("register");
            setError("");
          }}
        >
          Register
        </button>
      </div>

      <form onSubmit={submit} noValidate>
        <p className="mb-4 text-left text-[0.88rem] leading-relaxed text-[#555]">
          {mode === "login"
            ? "Sign in to view your bookings and manage your account."
            : "Create an account to book tickets faster next time."}
        </p>

        {mode === "register" && (
          <div className="mb-3.5 text-left">
            <label htmlFor="auth-name" className="mb-1 block text-[0.8rem] font-semibold text-[#444]">
              Full name
            </label>
            <input
              id="auth-name"
              type="text"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="box-border h-[42px] w-full rounded border border-[#c5c5c5] px-3 text-base focus:border-[var(--primary)] focus:shadow-[0_0_0_2px_rgba(46,125,50,0.15)] focus:outline-none"
            />
          </div>
        )}

        <div className="mb-3.5 text-left">
          <label htmlFor="auth-phone" className="mb-1 block text-[0.8rem] font-semibold text-[#444]">
            Mobile number
          </label>
          <input
            id="auth-phone"
            type="tel"
            inputMode="numeric"
            autoComplete="tel"
            maxLength={11}
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 11))}
            placeholder="01XXXXXXXXX"
            className="box-border h-[42px] w-full rounded border border-[#c5c5c5] px-3 text-base focus:border-[var(--primary)] focus:shadow-[0_0_0_2px_rgba(46,125,50,0.15)] focus:outline-none"
          />
        </div>

        <div className="mb-3.5 text-left">
          <label htmlFor="auth-password" className="mb-1 block text-[0.8rem] font-semibold text-[#444]">
            Password
          </label>
          <input
            id="auth-password"
            type="password"
            autoComplete={mode === "login" ? "current-password" : "new-password"}
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
          {loading
            ? "Processing…"
            : mode === "login"
              ? "SIGN IN"
              : "CREATE ACCOUNT"}
        </button>
      </form>

      <p className="mt-5 text-center text-[0.85rem]">
        <Link href="/" className="font-medium text-[var(--primary)] no-underline hover:underline">
          ← Back to home
        </Link>
        <span className="mx-1.5 text-[#bbb]">·</span>
        <Link href="/ticket" className="font-medium text-[var(--primary)] no-underline hover:underline">
          Download ticket
        </Link>
      </p>

      <p className="mt-4 border-t border-dashed border-[#e0e0e0] pt-3.5 text-center text-[0.72rem] leading-snug text-[#888]" aria-label="Demo accounts">
        Staff: 01700000001 (admin) or 01700000002 (counter) · password123.
        Customers can register here.
      </p>
    </div>
  );
}
