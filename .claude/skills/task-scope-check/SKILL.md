---
name: task-scope-check
description: Read-only audit of how much of one team member's task (A/B/C/D — Tịnh/Hoàng/Vũ/Hiệp) from phan_cong_cong_viec.md is actually done, versus still stubbed or leaking into another task's scope. Use this whenever the user asks things like "Vũ làm xong chưa", "check task C", "review PR của Hiệp có đúng phạm vi không", "task B còn thiếu gì", or wants a status/scope check on any of the four backend feature-cluster tasks — even if they only name a person, not a task letter.
---

# Check a task's real implementation status

This is a **read-only** audit — it never edits code. It exists because the
four tasks in [`phan_cong_cong_viec.md`](../../../phan_cong_cong_viec.md)
(index) and the per-person files (`phan_cong_tinh.md` / `phan_cong_hoang.md`
/ `phan_cong_vu.md` / `phan_cong_hiep.md`) deliberately share files in a
couple of places (`bookings.py` is split between the booking task and the
refund task), so it's easy for someone to accidentally implement more or
less than their slice, or for a reviewer to miss that an endpoint still
returns stub data.

## 1. Resolve the task

Map the name/letter via the "Vai trò" table in `phan_cong_cong_viec.md`:
Tịnh→A → `phan_cong_tinh.md`, Hoàng→B → `phan_cong_hoang.md`, Vũ→C →
`phan_cong_vu.md`, Hiệp→D → `phan_cong_hiep.md`. Read that person's file:
its endpoint checklist, frontend checklist, "KHÔNG thuộc Task X" list,
and Definition of Done.

## 2. Check each backend endpoint in the checklist

For each endpoint, find its handler in `backend/app/api/v1/*.py` and
determine its real status:

- **Still stub**: the function body calls something from
  `backend/app/api/v1/stubs.py` (e.g. `stub_booking`, `stub_room_type`) or
  returns a hardcoded/empty literal regardless of input.
- **Real**: the function queries `backend/app/models/hotel.py` ORM classes
  through a `Session` (via `Depends(get_db)`), with logic that actually
  reflects the request (filters, pagination, writes).
- **Partial**: some but not all fields respect the DB (worth flagging with
  what's still hardcoded).

`grep -n "stub" backend/app/api/v1/<file>.py` and reading the surrounding
function is usually enough to tell.

## 3. Check for scope leakage

For the "KHÔNG thuộc Task X" bullets in that task's section, check whether
the current code on the branch/PR under review touches those endpoints or
files anyway. The most common failure mode: someone owning `bookings.py`'s
main three functions also edits `cancel_my_booking` (or vice versa) — diff
the file's changed line ranges against which function they fall in, not
just "was this file touched."

## 4. Check each frontend page in the checklist

For each page path, check whether it still has
`from "@/lib/mock-data"` (or `@/lib/mock-data"` with a relative path) in
its imports — if so, it's not wired yet. If it imports `apiFetch`,
`useUserSession`, or `useAdminSession` instead, it's wired. Flag a page
that imports both (half-migrated).

## 5. Report

Produce a checklist matching the task's own Definition of Done, one line
per item, prefixed `✅`/`❌`/`⚠️` with a short note (not a paragraph) on
anything not ✅. End with a one-line overall verdict (done / in progress /
not started) and, if relevant, name the specific function or file that
needs the next change — don't just say "some endpoints are incomplete."
