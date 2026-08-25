---
name: seed-reset
description: Resets the local dev stack (Postgres + FastAPI + Next.js) to a clean, seeded state when the database looks broken or out of sync. Use this whenever the user says the dev DB/environment is "bị lỗi", "lệch state", "muốn reset lại", "seed lại data", asks to start fresh, or debugging a weird local issue turns out to be inconsistent database state — even if they don't name Docker or seeding explicitly.
---

# Reset the local dev environment

Wraps the manual sequence a developer would otherwise run by hand after
`make up`/`make seed` (documented in the repo's `README.md`) into one
consistent flow, for when local state has drifted (half-applied migration,
corrupted rows from a failed test, stale container).

## 1. Confirm before the destructive step

`docker compose down` stops every container and, unless the user has
already said they want a full reset, could interrupt something else
they're using right now (a manual test session, data they were about to
inspect). Ask in chat before running it — something like "sẽ dừng toàn bộ
stack (db/api/web) rồi khởi động lại sạch, có dữ liệu đang cần giữ không?"
— unless the user's request already makes clear they want a full reset
(e.g. "reset toàn bộ đi", "xóa hết làm lại từ đầu"). The Postgres data
volume itself is untouched by this flow (only containers restart, the
named volume persists) — but the seed step re-checks `admins` for
existing rows and skips if already seeded, so surface that if the user
seems to actually want the volume wiped (`docker compose down -v` — flag
this explicitly and get confirmation separately, since it deletes data
this skill doesn't otherwise touch).

## 2. The reset sequence

```bash
docker compose down
docker compose up -d db
# wait for healthy before continuing
until docker compose ps db | grep -q "healthy"; do sleep 1; done
cd backend && poetry run alembic upgrade head
cd backend && poetry run python -m app.db_seed
cd /path/to/repo/root && docker compose up -d
```

Run each step and check its exit code before moving to the next — don't
chain them with `&&` blindly. If `alembic upgrade head` fails, stop and
report the migration error rather than seeding against a broken schema.
`app.db_seed` is idempotent (it checks `admins` for existing rows and
prints "Seed data already present, skipping." if so) so re-running it is
always safe once the schema is right.

## 3. Confirm it worked

```bash
docker compose ps
curl -s http://localhost:8001/health
```

Then report the demo accounts the user can log in with — same table as
the "Tài khoản đăng nhập demo" section of the repo's `README.md`
(`user1@gmail.com` / `user2@gmail.com` / `admin@hotel.com` /
`staff@hotel.com`, all password `password123`). Don't just say "done" —
give the concrete accounts so the next thing they do is log in and check,
not go re-read the README.
