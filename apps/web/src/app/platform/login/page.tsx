import type { Metadata } from "next";
import { PlatformLoginForm } from "@/components/auth/platform-login-form";
import { platformShellClass } from "@/components/platform/platform-styles";

export const metadata: Metadata = {
  title: "Platform Admin Login",
  description: "Sign in to manage tenants on the bus ticketing platform.",
};

export default function PlatformLoginPage() {
  return (
    <main className={`${platformShellClass} px-4 py-8`}>
      <div className="mx-auto max-w-[420px]">
        <h1 className="mb-2 text-2xl font-bold">Platform Admin</h1>
        <p className="mb-6 text-[#666]">
          Manage all tenants, plans, and platform settings.
        </p>
        <PlatformLoginForm />
      </div>
    </main>
  );
}
