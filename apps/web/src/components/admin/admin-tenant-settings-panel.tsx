"use client";

import { useEffect, useState } from "react";
import {
  Building2,
  Globe,
  Shield,
  Store,
  Trash2,
  UserPlus,
  Users,
} from "lucide-react";
import { useGlobalLoading } from "@/components/global-loading-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { api, apiDelete, apiPost } from "@/lib/api-client";

type Member = {
  id: string;
  tenantId: string;
  userId: string;
  role: "ADMIN" | "COUNTER_SELLER";
  user: {
    id: string;
    name: string | null;
    phone: string;
    email: string | null;
  };
};

type TenantInfo = {
  slug: string;
  planTier: string;
  planStatus: string;
};

const PLAN_TIER_LABELS: Record<string, string> = {
  FREE: "Free",
  PRO: "Pro",
  ENTERPRISE: "Enterprise",
};

const selectClass =
  "flex h-9 w-full rounded-md border border-[var(--border)] bg-white px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-1";

function planStatusVariant(
  status: string,
): "success" | "warning" | "destructive" | "secondary" {
  if (status === "ACTIVE") return "success";
  if (status === "TRIAL") return "warning";
  if (status === "SUSPENDED") return "destructive";
  return "secondary";
}

function memberInitials(name: string | null, phone: string) {
  if (name?.trim()) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
    }
    return name.trim().slice(0, 2).toUpperCase();
  }
  return phone.slice(-2);
}

function roleLabel(role: Member["role"]) {
  return role === "ADMIN" ? "Admin" : "Counter seller";
}

function SettingsSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-40 rounded-xl" />
      <Skeleton className="h-80 rounded-xl" />
    </div>
  );
}

export function AdminTenantSettingsPanel() {
  const [members, setMembers] = useState<Member[]>([]);
  const [tenant, setTenant] = useState<TenantInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [invitePhone, setInvitePhone] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [inviteRole, setInviteRole] = useState<"COUNTER_SELLER" | "ADMIN">(
    "COUNTER_SELLER",
  );
  const [inviting, setInviting] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);

  useGlobalLoading(loading);

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const membersRes = await api<Member[]>("/admin/members");
      setMembers(membersRes.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load team members");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
    const slug =
      typeof window !== "undefined"
        ? document.cookie.match(/tenant-slug=([^;]+)/)?.[1] ?? null
        : null;
    if (slug) {
      setTenant({ slug, planTier: "", planStatus: "" });
    }
  }, []);

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setInviting(true);
    setInviteError(null);
    try {
      const res = await apiPost<Member>("/admin/members", {
        phone: invitePhone,
        role: inviteRole,
        name: inviteName || undefined,
      });
      setMembers((prev) => [...prev, res.data]);
      setInvitePhone("");
      setInviteName("");
    } catch (err) {
      setInviteError(err instanceof Error ? err.message : "Failed to invite member");
    } finally {
      setInviting(false);
    }
  }

  async function handleRemove(membershipId: string) {
    if (!confirm("Remove this member from the tenant?")) return;
    try {
      await apiDelete(`/admin/members/${membershipId}`);
      setMembers((prev) => prev.filter((m) => m.id !== membershipId));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to remove member");
    }
  }

  if (loading) return <SettingsSkeleton />;

  return (
    <div className="space-y-6">
      {error ? (
        <div
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          role="alert"
        >
          {error}
        </div>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="size-4 text-slate-500" aria-hidden />
            Organization
          </CardTitle>
          <CardDescription>
            Your tenant workspace and subscription details.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-0">
          {tenant?.slug ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-lg border border-slate-100 bg-slate-50/60 px-4 py-3">
                <p className="text-xs font-medium tracking-wide text-slate-500 uppercase">
                  Subdomain
                </p>
                <p className="mt-1 flex items-center gap-1.5 font-mono text-sm font-medium text-slate-900">
                  <Globe className="size-3.5 shrink-0 text-slate-400" aria-hidden />
                  {tenant.slug}
                </p>
              </div>

              {tenant.planTier ? (
                <div className="rounded-lg border border-slate-100 bg-slate-50/60 px-4 py-3">
                  <p className="text-xs font-medium tracking-wide text-slate-500 uppercase">
                    Plan
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">
                    {PLAN_TIER_LABELS[tenant.planTier] ?? tenant.planTier}
                  </p>
                </div>
              ) : null}

              {tenant.planStatus ? (
                <div className="rounded-lg border border-slate-100 bg-slate-50/60 px-4 py-3">
                  <p className="text-xs font-medium tracking-wide text-slate-500 uppercase">
                    Status
                  </p>
                  <div className="mt-1.5">
                    <Badge variant={planStatusVariant(tenant.planStatus)}>
                      {tenant.planStatus}
                    </Badge>
                  </div>
                </div>
              ) : null}
            </div>
          ) : (
            <p className="text-sm text-slate-500">
              Organization details are unavailable in this environment.
            </p>
          )}

          {!tenant?.planTier ? (
            <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-600">
              Contact platform support to upgrade your plan or change billing.
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="size-4 text-slate-500" aria-hidden />
            Team members
          </CardTitle>
          <CardDescription>
            Invite admins and counter sellers who can access your tenant workspace.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-0">
          {members.length === 0 ? (
            <p className="py-4 text-center text-sm text-slate-500">
              No team members yet. Invite someone below to get started.
            </p>
          ) : (
            <ul className="m-0 flex list-none flex-col gap-2 p-0">
              {members.map((m) => (
                <li
                  key={m.id}
                  className="flex flex-wrap items-center gap-3 rounded-lg border border-slate-100 bg-slate-50/60 px-4 py-3"
                >
                  <div
                    className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white text-xs font-semibold text-slate-600 shadow-sm"
                    aria-hidden
                  >
                    {memberInitials(m.user.name, m.user.phone)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-slate-900">
                      {m.user.name ?? "Unnamed user"}
                    </p>
                    <p className="text-sm text-slate-500">{m.user.phone}</p>
                  </div>
                  <Badge
                    variant={m.role === "ADMIN" ? "default" : "secondary"}
                    className="gap-1"
                  >
                    {m.role === "ADMIN" ? (
                      <Shield className="size-3" aria-hidden />
                    ) : (
                      <Store className="size-3" aria-hidden />
                    )}
                    {roleLabel(m.role)}
                  </Badge>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:bg-red-50 hover:text-red-700"
                    onClick={() => void handleRemove(m.id)}
                    aria-label={`Remove ${m.user.name ?? m.user.phone}`}
                  >
                    <Trash2 className="size-3.5" />
                    Remove
                  </Button>
                </li>
              ))}
            </ul>
          )}

          <Separator />

          <div>
            <h3 className="mb-1 flex items-center gap-2 text-sm font-semibold text-slate-900">
              <UserPlus className="size-4 text-slate-500" aria-hidden />
              Invite team member
            </h3>
            <p className="mb-4 text-sm text-slate-500">
              New users receive access immediately. Phone number must be unique.
            </p>

            {inviteError ? (
              <div
                className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                role="alert"
              >
                {inviteError}
              </div>
            ) : null}

            <form onSubmit={handleInvite}>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-2">
                  <Label htmlFor="invite-name">Name</Label>
                  <Input
                    id="invite-name"
                    placeholder="Optional"
                    value={inviteName}
                    onChange={(e) => setInviteName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="invite-phone">Phone number</Label>
                  <Input
                    id="invite-phone"
                    type="tel"
                    placeholder="01XXXXXXXXX"
                    value={invitePhone}
                    onChange={(e) => setInvitePhone(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="invite-role">Role</Label>
                  <select
                    id="invite-role"
                    className={selectClass}
                    value={inviteRole}
                    onChange={(e) =>
                      setInviteRole(e.target.value as typeof inviteRole)
                    }
                  >
                    <option value="COUNTER_SELLER">Counter seller</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <Button type="submit" className="w-full sm:w-auto" disabled={inviting}>
                    <UserPlus className="size-4" />
                    {inviting ? "Inviting…" : "Send invite"}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
