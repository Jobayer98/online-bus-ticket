"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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

export default function LoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("01700000001");
  const [password, setPassword] = useState("password123");
  const [mode, setMode] = useState<"login" | "register">("login");
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      const path = mode === "login" ? "/auth/login" : "/auth/register";
      const r = await apiPost<AuthResponse>(path, {
        phone,
        password,
        name: "User",
      });
      setAuthSession(r.data.token, r.data.user);
      router.push(homeForRole(r.data.user.role));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    }
  }

  return (
    <section className="container">
      <h1>{mode === "login" ? "Login" : "Register"}</h1>
      <p style={{ color: "#666", fontSize: "0.9rem" }}>
        Admin: 01700000001 · Counter: 01700000002 · password123
      </p>
      <form className="card" onSubmit={submit}>
        <label>Phone</label>
        <input value={phone} onChange={(e) => setPhone(e.target.value)} />
        <label>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p className="error">{error}</p>}
        <button type="submit" className="btn">
          {mode === "login" ? "Login" : "Register"}
        </button>
        <button
          type="button"
          className="btn btn-outline"
          style={{ marginLeft: "0.5rem" }}
          onClick={() => setMode(mode === "login" ? "register" : "login")}
        >
          Switch to {mode === "login" ? "register" : "login"}
        </button>
      </form>
    </section>
  );
}
