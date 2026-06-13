"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useGlobalLoading } from "@/components/global-loading-provider";
import { getAuthRole, getAuthToken } from "@/lib/auth-session";
import { opsPage } from "./admin-tw";

export function AdminAuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  useGlobalLoading(!ready);

  useEffect(() => {
    const token = getAuthToken();
    const role = getAuthRole();
    if (!token || role !== "ADMIN") {
      router.replace("/login");
      return;
    }
    setReady(true);
  }, [router]);

  if (!ready) {
    return <div className={opsPage} aria-busy="true" />;
  }

  return children;
}
