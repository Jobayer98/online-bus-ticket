"use client";

import { useEffect, useState } from "react";
import { api, apiPost, apiDelete } from "@/lib/api-client";

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
  id: string;
  name: string;
  slug: string;
  planTier: string;
  planStatus: string;
};

const PLAN_TIER_LABELS: Record<string, string> = {
  FREE: "Free",
  PRO: "Pro",
  ENTERPRISE: "Enterprise",
};

const PLAN_STATUS_COLORS: Record<string, string> = {
  TRIAL: "#92400e",
  ACTIVE: "#065f46",
  SUSPENDED: "#991b1b",
  CANCELLED: "#6b7280",
};

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

  async function loadData() {
    setLoading(true);
    try {
      const [membersRes] = await Promise.all([
        api<Member[]>("/admin/members"),
      ]);
      setMembers(membersRes.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
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
      setTenant({
        id: "",
        name: "",
        slug,
        planTier: "",
        planStatus: "",
      });
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
      setInviteError(err instanceof Error ? err.message : "Failed to invite");
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
      alert(e instanceof Error ? e.message : "Failed to remove");
    }
  }

  return (
    <div className="tenant-settings">
      <div className="ts-section">
        <h3 className="ts-section-title">Tenant Plan</h3>
        {tenant?.slug && (
          <div className="ts-plan-info">
            <div className="ts-plan-row">
              <span className="ts-plan-label">Subdomain</span>
              <code className="ts-plan-value">{tenant.slug}</code>
            </div>
            {tenant.planTier && (
              <div className="ts-plan-row">
                <span className="ts-plan-label">Plan</span>
                <span className="ts-plan-value">
                  {PLAN_TIER_LABELS[tenant.planTier] ?? tenant.planTier}
                </span>
              </div>
            )}
            {tenant.planStatus && (
              <div className="ts-plan-row">
                <span className="ts-plan-label">Status</span>
                <span
                  className="ts-plan-value"
                  style={{
                    color: PLAN_STATUS_COLORS[tenant.planStatus] ?? "#374151",
                    fontWeight: 600,
                  }}
                >
                  {tenant.planStatus}
                </span>
              </div>
            )}
          </div>
        )}
        {!tenant?.planTier && (
          <p className="ts-plan-hint">
            Contact platform support to upgrade your plan.
          </p>
        )}
      </div>

      <div className="ts-section">
        <h3 className="ts-section-title">Team Members</h3>

        {error && <div className="ts-error">{error}</div>}

        {loading ? (
          <p className="ts-loading">Loading members…</p>
        ) : (
          <div className="ts-members-list">
            {members.length === 0 && (
              <p className="ts-empty">No team members yet.</p>
            )}
            {members.map((m) => (
              <div key={m.id} className="ts-member-row">
                <div className="ts-member-info">
                  <span className="ts-member-name">
                    {m.user.name ?? "Unnamed"}
                  </span>
                  <span className="ts-member-phone">{m.user.phone}</span>
                </div>
                <span className={`ts-role-badge ts-role-${m.role.toLowerCase()}`}>
                  {m.role.replace("_", " ")}
                </span>
                <button
                  className="ts-remove-btn"
                  onClick={() => handleRemove(m.id)}
                  title="Remove member"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="ts-invite-section">
          <h4 className="ts-invite-title">Invite Team Member</h4>
          {inviteError && <div className="ts-error">{inviteError}</div>}
          <form className="ts-invite-form" onSubmit={handleInvite}>
            <input
              type="text"
              placeholder="Name (optional)"
              value={inviteName}
              onChange={(e) => setInviteName(e.target.value)}
              className="ts-input"
            />
            <input
              type="tel"
              placeholder="Phone number"
              required
              value={invitePhone}
              onChange={(e) => setInvitePhone(e.target.value)}
              className="ts-input"
            />
            <select
              value={inviteRole}
              onChange={(e) =>
                setInviteRole(e.target.value as typeof inviteRole)
              }
              className="ts-input"
            >
              <option value="COUNTER_SELLER">Counter Seller</option>
              <option value="ADMIN">Admin</option>
            </select>
            <button
              type="submit"
              className="ts-invite-btn"
              disabled={inviting}
            >
              {inviting ? "Inviting…" : "Invite"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
