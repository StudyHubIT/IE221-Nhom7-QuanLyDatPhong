const dashboardItems = [
  {
    title: "Pages",
    description: "Create and organize public-facing pages backed by PostgreSQL.",
  },
  {
    title: "Publishing",
    description: "Track draft-to-published flow from a single admin surface.",
  },
  {
    title: "API",
    description: "Expose clean content endpoints for your frontend routes.",
  },
];

export default function AdminDashboardPage() {
  return (
    <div className="fade-up flex min-h-full flex-col gap-8">
      <header className="space-y-3 border-b border-line pb-6">
        <p className="font-mono text-xs uppercase tracking-[0.24em] text-accent">
          Admin dashboard
        </p>
        <h2 className="text-4xl font-semibold tracking-tight text-navy">
          Start shaping the CMS from a focused editorial workspace.
        </h2>
        <p className="max-w-2xl text-base leading-8 text-muted">
          This placeholder dashboard is intentionally lean: one place to extend
          page CRUD, publishing states, and future content tools.
        </p>
      </header>

      <section className="grid gap-4 xl:grid-cols-3">
        {dashboardItems.map((item) => (
          <article
            key={item.title}
            className="rounded-[1.5rem] border border-line bg-white/70 p-5"
          >
            <h3 className="text-xl font-semibold text-navy">{item.title}</h3>
            <p className="mt-3 text-sm leading-7 text-muted">
              {item.description}
            </p>
          </article>
        ))}
      </section>

      <section className="rounded-[1.75rem] border border-line bg-[linear-gradient(135deg,rgba(18,32,51,0.96),rgba(17,94,89,0.92))] p-6 text-white">
        <p className="font-mono text-xs uppercase tracking-[0.24em] text-white/65">
          Next implementation step
        </p>
        <p className="mt-3 max-w-2xl text-lg leading-8 text-white/88">
          Connect this dashboard to `/api/pages`, then replace the placeholders
          with real content tables and forms.
        </p>
      </section>
    </div>
  );
}
