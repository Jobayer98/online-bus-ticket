# Design Principles

## 1. Single Responsibility

- One file / one class / one function → one reason to change.
- Route handlers do not contain SQL or pricing rules.

## 2. Dependency Direction

```
UI → API Client → HTTP → Controller → Service → Repository → DB
```

- Domain rules live in **services**, not in React components or Prisma hooks in the UI.
- `packages/shared` has zero dependency on Prisma or Express.

## 3. Contract-First at Boundaries

- Define contracts in `packages/shared` **before** API or UI code ([CONTRACTS.md](CONTRACTS.md)).
- Every HTTP body, query, and params: **Zod parse** at the controller; responses use DTO schemas + `{ data }` envelope.
- Reuse the same schema on the client for forms (react-hook-form + zodResolver).
- Trust nothing from the client (dates, prices, seat availability).

## 4. Explicit Over Clever

- Prefer readable code over abstractions used once.
- Name modules after bounded contexts: `booking`, `schedule`, not `utils2`.

## 5. Fail Fast, Fail Clearly

```typescript
// Good: stable API error
throw new AppError('SEAT_NOT_AVAILABLE', 'Seat 12A is already sold', 409);

// Bad: generic 500 with raw Prisma message to client
```

## 6. Transactions for Consistency

Use Prisma `$transaction` when:

- Holding seats and creating a booking draft
- Confirming payment and marking seats sold
- Counter refund and releasing seats

## 7. Idempotent Side Effects

- Payment confirmation, webhook handlers, and “issue ticket” must be safe to retry.
- Store idempotency keys on `Payment` and `Ticket` creation.

## 8. Feature Flags & Epics

- Implement one **micro-task** per PR when possible.
- Do not merge half-finished epics behind dead code paths; use feature flags only for large UI switches.

## 9. Testing Strategy (proportionate)

| Layer | What to test |
|-------|----------------|
| Zod schemas | Invalid/valid edge cases |
| Services | Business rules with mocked repos |
| API | Critical flows (search, hold, pay) integration tests |
| UI | Key flows E2E later (Playwright) |

## 10. Consistency

- **Dates:** Store UTC in DB; format in UI with explicit timezone (document default: `Asia/Dhaka`).
- **Money:** Integer minor units (poisa) in DB; format for display only.
- **IDs:** UUID v4 or cuid for public IDs; human `passengerNumber` separate.

## 11. API Versioning

- Prefix: `/api/v1/`
- Breaking changes → v2, never silent breakage.

## 12. Accessibility & UX (web)

- Seat map keyboard-focusable where possible.
- Loading and error states on every async action.
- Disable past dates in date picker **and** validate on server.

## 13. Security by Default

- Parameterized queries only (Prisma).
- RBAC on all counter/admin endpoints.
- Audit log for counter money movements.

## 14. Documentation per Change

- Update `docs/FEATURES.md` checkbox when a micro-task is done.
- If API contract changes, update the epic’s acceptance criteria section.
