import type { Metadata } from "next";
import { PlatformLoginForm } from "@/components/auth/platform-login-form";
import "../../login/login.css";

export const metadata: Metadata = {
  title: "Platform Admin Login",
  description: "Sign in to manage tenants on the bus ticketing platform.",
};

export default function PlatformLoginPage() {
  return (
    <main className="platform-page" style={{ padding: "2rem 1rem" }}>
      <div style={{ maxWidth: 420, margin: "0 auto" }}>
        <h1 style={{ marginBottom: "0.5rem", fontSize: "1.5rem" }}>
          Platform Admin
        </h1>
        <p style={{ marginBottom: "1.5rem", color: "#666" }}>
          Manage all tenants, plans, and platform settings.
        </p>
        <PlatformLoginForm />
      </div>
    </main>
  );
}
