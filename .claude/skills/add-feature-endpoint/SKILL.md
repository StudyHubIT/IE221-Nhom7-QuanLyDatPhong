---
name: add-feature-endpoint
description: Scaffolds or implements a real FastAPI endpoint for the hotel booking backend (backend/app), replacing a stub handler with real SQLAlchemy queries or adding a genuinely new route. Use this whenever the user asks to "implement", "nối", "hiện thực" an API endpoint, add a new route to the backend, wire an admin.py/bookings.py/catalog.py handler to the database, or scaffold a new FastAPI endpoint — even if they only name the endpoint or the screen it powers rather than saying "endpoint" explicitly.
---

# Add or implement a backend feature endpoint

The backend follows one consistent layering established in Task 0 and
documented in [`documents/phan-cong-api.md`](../../../documents/phan-cong-api.md)
(models → schemas → deps → routers). This skill scaffolds a new endpoint,
or converts an existing stub, following that exact layering instead of
inventing a new pattern.

## 1. Find the contract first

Read [`documents/openapi.yaml`](../../../documents/openapi.yaml) for the
exact path, method, request/response schema, and status codes for this
endpoint — the request/response shape is already decided, don't improvise
fields. Cross-check [`phan_cong_cong_viec.md`](../../../phan_cong_cong_viec.md)
at the repo root to confirm which task/table this endpoint belongs to, and
read that task's "KHÔNG thuộc phạm vi" notes so you don't accidentally
implement logic that belongs to a different feature cluster (the clearest
example: `POST /api/v1/bookings/{id}/cancel` lives in `bookings.py` but is
owned by the refund task, not the booking task).

## 2. Reuse existing models and schemas — don't create new tables

All 12 domain tables already exist as SQLAlchemy models in
`backend/app/models/hotel.py` (`Admin`, `Role`, `Permission`, `User`,
`RoomType`, `Room`, `Booking`, `BookingItem`, `Payment`, `Refund`, plus the
`admin_roles`/`role_permissions` association tables), all mapped with
plain `Mapped`/`mapped_column` (SQLAlchemy 2.0 style, not
`MappedAsDataclass`) and already carrying the `relationship()`s you'll
likely need. If the endpoint genuinely needs a new column or table beyond
those 12, **stop and ask the user first** — that means a new Alembic
migration (`make migration name=...`, chained after the latest revision in
`backend/alembic/versions/`), which is a bigger, more disruptive change
than adding a route.

Pydantic request/response schemas already exist in
`backend/app/schemas/hotel.py` for essentially every shape defined in
`openapi.yaml` (enums like `BookingStatus`/`RoomStatus`/`PaymentStatus`,
DTOs like `Booking`/`RoomType`/`Refund`). Reuse them; only add a new schema
if the endpoint truly needs a shape that isn't there yet. When a file
needs both the ORM model and the Pydantic schema of the same name (e.g.
`User`), alias the import — `from app.models.hotel import User as
UserModel` — rather than renaming either class.

## 3. Put the route in the right router file

- `backend/app/api/v1/catalog.py` — public room types & room availability
- `backend/app/api/v1/bookings.py` — customer-facing booking endpoints
  (list/checkout/detail/cancel)
- `backend/app/api/v1/admin.py` — every `/admin/*` route, already split
  into named sub-routers in that file (`room_types_router`, `rooms_router`,
  `bookings_router`, `payments_router`, `refunds_router`,
  `customers_router`, `staff_router`, `dashboard_router`) — attach the new
  path to the matching one, don't create a new top-level router unless the
  feature genuinely has no home yet.

For auth, depend on `CurrentUser`/`CurrentAdmin` from
`backend/app/api/deps.py` (never re-implement token parsing). For the DB
session, depend on `get_db` from `backend/app/core/db.py`.

## 4. Match the conventions already in the codebase

- List endpoints return `Paginated[T]` (`page`/`page_size` query params,
  default 1/20) — see any existing `list_*` handler in `admin.py` for the
  exact pattern.
- Conflicts use `409` (e.g. duplicate `so_phong`, deleting a room type
  still referenced by rooms), invalid state transitions use `400`, missing
  resources use `404`.
- Convert an ORM row to its Pydantic schema with `Schema.model_validate(row)`
  where the schema has `model_config = ConfigDict(from_attributes=True)`
  (already set on `User`/`AdminAccount`/`RoomType`/`Room`; add it to
  others as needed) — don't hand-map fields one by one unless the shapes
  genuinely diverge.
- Anything involving multiple writes that must succeed or fail together
  (e.g. checkout creating a booking + line items + payment, or refund
  approval touching both `REFUNDS` and `DATPHONG`) needs to happen in one
  transaction — don't split it across separate `db.commit()` calls.

## 5. Verify before calling it done

```bash
cd backend && poetry run pytest
```

Existing tests use fixtures in `backend/tests/conftest.py`
(`user_auth_header`/`admin_auth_header`) that log in against seeded demo
accounts — reuse them for any new test rather than hardcoding a token.
Then hit the endpoint for real through Swagger UI
(`http://localhost:8001/docs`) or `curl`, using a token from
`POST /api/v1/auth/login` or `/api/v1/admin/auth/login` with a seeded
account (see the "Tài khoản đăng nhập demo" section in the repo's
`README.md`) — a passing test suite doesn't substitute for actually
calling the route once.
