import Link from "next/link";
import { getApiBaseUrl } from "@/lib/api";

const editorialSections = [
  "Page management",
  "Structured content",
  "Publish-ready workflow",
];

export default function PublicHomePage() {
  const apiBaseUrl = getApiBaseUrl();

  return (
    <main className="flex min-h-screen flex-col">
      <section className="mx-auto flex w-full max-w-7xl flex-1 px-6 py-10 sm:px-10 lg:px-16">
        <div className="grid w-full items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="fade-up flex flex-col justify-center gap-6">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-accent">
              Northstar CMS
            </p>
            <div className="space-y-4">
              <h1 className="max-w-3xl text-5xl font-semibold tracking-tight text-navy sm:text-6xl">
                Northstar keeps your editorial system clear from draft to
                publish.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-muted">
                A single workspace for managing pages, shaping content, and
                handing your frontend clean API-backed data.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/admin"
                className="inline-flex h-12 items-center justify-center rounded-full bg-navy px-6 text-sm font-semibold text-white transition-transform duration-200 hover:-translate-y-0.5"
              >
                Open admin
              </Link>
              <a
                href={`${apiBaseUrl}/docs`}
                className="inline-flex h-12 items-center justify-center rounded-full border border-line px-6 text-sm font-semibold text-navy transition-colors duration-200 hover:bg-white/60"
              >
                API docs
              </a>
            </div>
          </div>

          <div className="shell-panel drift fade-up relative overflow-hidden rounded-[2rem] p-6 shadow-[0_30px_80px_rgba(18,32,51,0.12)]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(15,118,110,0.15),transparent_45%)]" />
            <div className="relative flex h-full flex-col gap-6 rounded-[1.6rem] border border-white/60 bg-white/70 p-6">
              <div className="flex items-center justify-between border-b border-line pb-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">
                    Editorial focus
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold text-navy">
                    Content model snapshot
                  </h2>
                </div>
                <div className="rounded-full bg-navy px-3 py-1 font-mono text-xs text-white">
                  v0
                </div>
              </div>

              <div className="space-y-3">
                {editorialSections.map((section) => (
                  <div
                    key={section}
                    className="flex items-center justify-between rounded-2xl border border-line bg-white/70 px-4 py-4"
                  >
                    <span className="font-medium text-navy">{section}</span>
                    <span className="font-mono text-xs uppercase tracking-[0.18em] text-muted">
                      Ready
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-auto rounded-[1.5rem] bg-navy px-5 py-4 text-white">
                <p className="font-mono text-xs uppercase tracking-[0.2em] text-white/70">
                  Backend target
                </p>
                <p className="mt-2 text-sm leading-7 text-white/90">
                  FastAPI API base: <span className="font-mono">{apiBaseUrl}</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
