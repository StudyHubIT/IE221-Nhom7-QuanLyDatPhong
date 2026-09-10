# Frontend (apps/web) Guidelines for Agents

- **Tech Stack**: Next.js 14+ App Router, Tailwind CSS, TypeScript, `apps/web/lib/api.ts` (`apiFetch`).
- **Zero Mock Data**: Never import from `apps/web/lib/mock-data.ts` in completed production pages. Use `apiFetch<T>` with proper typed responses.
- **Session & Auth**: Retrieve token from session hooks/cookies and pass in headers via `{ token: session?.token }`.
- **UX & Error Handling**: Show spinner/skeletons when loading, disable buttons when submitting (`isSubmitting`), catch `ApiError` and display notifications or inline alerts.
- **Components**: Place reusable widgets in `components/` or `components/admin/`. Use `pagination.tsx` for table pagination.
