# GET /api/v1/payments/gateways

| Field | Value |
|-------|--------|
| **Task ID** | E27-08 |
| **Module** | payment |
| **Auth** | public (requires `x-tenant-slug`) |

Returns active payment gateways for the current tenant. If the tenant has active own credentials, only tenant gateways are returned; otherwise system gateways.

# POST /api/v1/payments/webhook/:providerCode

Provider IPN endpoint. Verifies signature, atomically confirms booking payment and credits tenant wallet when settlement route is SYSTEM.

# GET /api/v1/payments/callback/:providerCode

Browser return URL after PSP checkout. Validates payment and redirects to web confirmation page.
