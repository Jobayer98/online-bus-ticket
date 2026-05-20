# Git Workflow & Commit Standards

## Branching

| Branch | Use |
|--------|-----|
| `main` | Production-ready |
| `develop` | Integration (optional) |
| `feature/{epic-id}-{short-name}` | One epic or micro-task series |
| `fix/{issue-id}-{short-name}` | Bug fixes |

**Example:** `feature/E05-search-schedules`

Prefer **one micro-task per PR** when practical (reviewable, revertible).

## Commit Message Format (Conventional Commits)

```
<type>(<scope>): <subject>

[optional body]

[optional footer: Closes E05-03]
```

### Types

| Type | When |
|------|------|
| `feat` | New feature / micro-task |
| `fix` | Bug fix |
| `refactor` | Code change without behavior change |
| `chore` | Tooling, deps |
| `docs` | Documentation only |
| `test` | Tests only |
| `db` | Prisma migrations / schema |

### Scopes (examples)

`api`, `web`, `db`, `shared`, `booking`, `schedule`, `payment`, `counter`, `admin`

### Examples

```
feat(booking): add seat hold with 10 minute TTL

db(schedule): add index on route_id and departure_date

fix(web): block past dates on search form and server
```

## Rules

1. **Atomic commits** — one logical change; migrations separate from unrelated refactors.
2. **Never commit** `.env`, secrets, or `node_modules`.
3. **Migration naming** — descriptive folder names via Prisma (`add_booking_status_enum`).
4. **Review generated SQL** before applying migrations in shared environments.
5. **No force-push** to `main` without explicit team approval.

## Pull Request Template

```markdown
## Summary
- What micro-task (ID) does this complete?

## Contract
- [ ] Request schema: `packages/shared/src/schemas/...`
- [ ] Response DTO: `packages/shared/src/dtos/...`
- [ ] `docs/contracts/...` updated (if HTTP)

## Changes
- Bullet list

## Test plan
- [ ] Step 1
- [ ] Step 2

## Screenshots (if UI)
```

## Pre-merge Checklist

- [ ] `pnpm lint` / `pnpm typecheck` pass
- [ ] Prisma migrate applies cleanly on fresh DB
- [ ] No secrets in diff
- [ ] `docs/FEATURES.md` task checked if complete
- [ ] API changes match Zod schemas in `packages/shared`
