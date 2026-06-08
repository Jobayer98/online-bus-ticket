"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { clearAuthSession } from "@/lib/auth-session";
import { AdminSidebar } from "./admin-sidebar";
import { AdminTopbar } from "./admin-topbar";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [clock, setClock] = useState("");

  useEffect(() => {
    function tick() {
      setClock(
        new Date().toLocaleString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
          timeZone: "Asia/Dhaka",
        }),
      );
    }
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, []);

  function logout() {
    clearAuthSession();
    router.push("/login");
  }

  return (
    <div className="flex min-h-screen bg-[var(--bg)]">
      <AdminSidebar
        onLogout={logout}
        className="hidden w-64 shrink-0 flex-col border-r border-[var(--border)] bg-white lg:flex"
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <AdminTopbar clock={clock} onLogout={logout} />

        <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
