---
name: add-unit-tests
description: Writes pytest tests for backend code that was just added or changed (a new/updated FastAPI endpoint, a model, a business rule) in backend/app. Use this right after implementing or wiring an endpoint (including right after using add-feature-endpoint), or whenever the user asks to "viết test", "thêm unit test", "test coverage cho", "test lại API vừa sửa" — even if they don't specify which framework or don't say "pytest" explicitly.
---

# Write tests for backend code that was just written

Scope this to what actually changed — read the diff (`git diff` /
`git status`) if the user says "test cho code vừa viết" without naming a
file, rather than asking them to repeat something already visible in the
working tree.

## Backend (FastAPI) — the default case

Follow the conventions already in `backend/tests/`, don't introduce a
different testing style:

- **Fixtures**: `backend/tests/conftest.py` already has `user_auth_header`
  and `admin_auth_header` — each logs in against a **seeded** demo account
  (`user1@gmail.com` / `admin@hotel.com`, password `password123`) through
  the real `/api/v1/auth/login` / `/api/v1/admin/auth/login` endpoints and
  returns a ready-to-use `Authorization` header. Use these for any test
  that needs an authenticated request instead of re-implementing login or
  hand-crafting a token.
- **Client**: `TestClient(app)` from `fastapi.testclient`, imported from
  `app.main`, as already done in `test_app.py` / `test_hotelbook_api.py`.
- **No mocking, no isolated test DB**: tests in this repo hit the real dev
  Postgres through the real endpoints (see the Task 0 notes — this was a
  deliberate simplification for a course project, not an oversight).
  Because of that, the DB is **shared and not reset between test runs** —
  write tests that stay valid as data accumulates:
  - Prefer asserting on the *shape and status code* of a response over an
    exact row count that will drift (e.g. don't assert
    `len(items) == 3` for a list endpoint that other tests or manual
    testing also write to).
  - When a test must create data (e.g. a booking, a new admin), use a
    fresh/unique value (an email or `so_phong` that won't collide on
    rerun) so the test is safe to run repeatedly, and don't assume a
    clean slate.
  - If a test's own assertions require rows created by a *different*
    test, that's a sign that test doesn't stand on its own and should
    create its own data instead of depending on the seed script or on
    another test's side effects.
- **What to actually cover** — for each endpoint touched, base the test
  list on the concrete cases already called out for that endpoint's task
  in the matching per-person file (`phan_cong_tinh.md` / `phan_cong_hoang.md`
  / `phan_cong_vu.md` / `phan_cong_hiep.md`; index:
  [`phan_cong_cong_viec.md`](../../../phan_cong_cong_viec.md))'s
  Definition of Done and backend checklist notes (e.g. "hủy lại lần 2
  cùng đơn → nhận 400", "thử nhảy ngược trạng thái → nhận 400", "2 request
  checkout cùng lúc cho cùng 1 phòng → 1 thành công, 1 nhận 409") — these
  are the actual business rules worth locking in, not generic CRUD
  smoke-tests. Also cover: the happy path, a request with no/invalid auth
  returning 401 where the endpoint requires it, and the specific
  conflict/validation status codes documented in
  [`documents/openapi.yaml`](../../../documents/openapi.yaml) for that
  path.
- **Naming**: `test_<action>_<expected_outcome>`, matching what's already
  in `test_hotelbook_api.py` (e.g. `test_login_rejects_wrong_password`).
  Put new tests in the file matching the domain (`test_hotelbook_api.py`
  for now, since that's where booking/admin/auth tests already live) —
  create a new `test_<domain>.py` module instead if the existing files
  are getting unwieldy, not as a default.
- **Don't test the framework**: Pydantic validation errors, FastAPI's own
  routing, and SQLAlchemy's own constraint enforcement are already
  exercised by their own test suites — focus tests on this app's actual
  business logic (the rules unique to this booking system), not on
  re-verifying that FastAPI returns 422 for a missing required field.

Run `cd backend && poetry run pytest` after writing, and check that both
the new tests and the full existing suite pass — a new test that only
passes in isolation but breaks something else (or only passes because it
depends on leftover state from a previous run) isn't done.

## Frontend

`apps/web/package.json` currently has **no test framework installed** at
all (no Jest, Vitest, Testing Library, Playwright). Don't add one
silently — installing a test runner is a real dependency/config decision
that affects the whole team, not just this one test. If asked to write
frontend tests, say so and ask which the user wants before installing
anything; don't default to writing tests that can't run.

## If the code being tested is still a stub

If the endpoint/component this is testing still returns stub/mock data
(e.g. it imports from `backend/app/api/v1/stubs.py`, or the frontend page
still imports `apps/web/lib/mock-data.ts`), say so before writing tests
against it — a test that asserts on hardcoded stub output will look green
but stops being meaningful the moment someone wires the real logic in,
and silently locking in stub behavior as "tested" hides that the feature
isn't actually done yet.
