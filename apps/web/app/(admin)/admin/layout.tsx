import Link from "next/link";

const navigation = [
  { href: "/", label: "Public home" },
  { href: "/admin", label: "Dashboard" },
];

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen px-4 py-4 sm:px-6 sm:py-6">
      <div className="shell-panel mx-auto grid min-h-[calc(100vh-2rem)] w-full max-w-7xl overflow-hidden rounded-[2rem] lg:grid-cols-[280px_1fr]">
        <aside className="border-b border-line bg-navy px-6 py-8 text-white lg:border-r lg:border-b-0">
          <div className="space-y-4">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.24em] text-white/60">
                CMS workspace
              </p>
              <h1 className="mt-3 text-3xl font-semibold">Northstar</h1>
              <p className="mt-3 max-w-xs text-sm leading-7 text-white/72">
                Lightweight editorial shell for managing pages and publishing
                data through FastAPI.
              </p>
            </div>

            <nav className="space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block rounded-2xl border border-white/12 px-4 py-3 text-sm font-medium transition-colors duration-200 hover:bg-white/8"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </aside>

        <main className="bg-white/55 px-6 py-8 sm:px-8">{children}</main>
      </div>
    </div>
  );
}
