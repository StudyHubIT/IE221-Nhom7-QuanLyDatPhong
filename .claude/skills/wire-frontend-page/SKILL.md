---
name: wire-frontend-page
description: Wires a Next.js page in apps/web to the real FastAPI backend, replacing its hardcoded apps/web/lib/mock-data.ts import with a real apiFetch call. Use this whenever the user asks to "nối API", "kết nối backend", "chuyển trang X sang API thật", says a page "vẫn còn mock-data", or asks to hook up any route under apps/web/app to the real API — even if they just name the page/route without saying "wire" or "connect" explicitly.
---

# Wire a frontend page to the real API

This repo's frontend (`apps/web`) was built entirely against
`apps/web/lib/mock-data.ts`. The backend (FastAPI) is being connected one
feature cluster at a time per [`phan_cong_cong_viec.md`](../../../phan_cong_cong_viec.md)
at the repo root. This skill converts one page from mock data to a real
`apiFetch` call, keeping the existing UI/layout untouched.

## 1. Confirm the endpoint before touching any code

Read `phan_cong_cong_viec.md` at the repo root for the endpoint matrix,
then the matching per-person file (`phan_cong_tinh.md` / `phan_cong_hoang.md`
/ `phan_cong_vu.md` / `phan_cong_hiep.md`). Find the page in that file's
frontend checklist, and read the matching backend endpoint from the
"Ma trận endpoint ↔ Task" table (method + path). Do not guess or invent
an endpoint — if the page isn't listed there, or the endpoint it needs
isn't implemented yet server-side
(check `backend/app/api/v1/*.py` — if the handler still imports from
`app.api.v1.stubs`, it's not ready), say so instead of wiring against a
stub that will change shape later.

## 2. Reuse the existing plumbing, don't reinvent it

- `apps/web/lib/api.ts` — `apiFetch<T>(path, options)` and the `ApiError`
  class. Every request goes through this; don't hand-roll `fetch()`.
- `apps/web/lib/session.ts` + `apps/web/components/auth/session-provider.tsx`
  — `useUserSession()` / `useAdminSession()` give you `{ session, login,
  logout }`. If the endpoint needs auth, pass `session.token` as the
  `token` option to `apiFetch`. Pages under `app/(public)/account/*` and
  `app/(admin)/admin/*` are already gated by `RequireUserSession`/
  `RequireAdminSession`, so a session is guaranteed to exist there.
- `apps/web/app/(public)/login/page.tsx` is the canonical example for a
  **form** page: controlled inputs via `useState`, submit handler calls
  `apiFetch`, catches `ApiError` and renders
  `<p className="text-sm text-destructive">{message}</p>`, disables the
  submit button and swaps its label while a request is in flight.
- For a **display** page (a list or detail view, not a form), fetch in a
  `useEffect` on mount, keep `data`/`isLoading`/`error` in `useState`, and
  render a loading state and an error state using whatever the page
  already uses for empty states (check the existing shadcn components in
  the file — most pages already have some kind of empty-state markup you
  can adapt instead of inventing new UI).

## 3. Change the data source, not the UI

The whole point is that the page should look identical to before. Keep the
JSX structure, `className`s, and shadcn components as they are — only
change where the data comes from and how it's fetched. If a list endpoint
returns `Paginated<T>` (`{ items, total, page, page_size }` — see
`documents/openapi.yaml`), read `items` for the rows and wire `total`/
`page`/`page_size` into whatever pagination UI the page already has (see
`components/admin/pagination.tsx` if the page is an admin list).

## 4. Verify it actually compiles and renders

The dev stack runs via `docker compose` (`make up`), with the `web`
service on `http://localhost:3001` hot-reloading on file changes. After
editing:

```bash
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3001/<route>
docker compose logs web --tail=20
```

Confirm the log shows `✓ Compiled` (or no new error) and the curl returns
200. If the page needs a session to render its real content, log in first
via the API directly to get a token and sanity-check the same endpoint the
page calls (`curl -X POST http://localhost:8001/api/v1/... `) so you know
whether a blank page is a frontend bug or the backend genuinely having no
data yet.

## 5. Report what's left

If the page still needs data unavailable from any current endpoint (e.g.
frontend-only bits like client-side cart state), or if another type
export from `mock-data.ts` is still used elsewhere in the page for
something out of this endpoint's scope, say so explicitly rather than
silently leaving a partial mock. Don't delete anything from
`apps/web/lib/mock-data.ts` itself — other pages not yet wired still
depend on it.
