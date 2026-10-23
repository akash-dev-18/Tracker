import { Wordmark } from "@/components/brand/mark";

const registerRows = [
  {
    index: "01",
    title: "Practice",
    description: "Problems, code, notes, and a revision schedule that remembers for you.",
  },
  {
    index: "02",
    title: "Apply",
    description: "Every application from wishlist to offer, with a clear next step.",
  },
  {
    index: "03",
    title: "Ship",
    description: "Projects and tasks that move forward, not just sit on a list.",
  },
];

export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="relative grid min-h-dvh lg:grid-cols-[1.08fr_1fr]">
      <aside className="relative hidden overflow-hidden border-r border-line lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="pointer-events-none absolute inset-0 grid-paper opacity-40 [mask-image:radial-gradient(ellipse_at_30%_20%,black,transparent_72%)]" />

        <header className="relative">
          <Wordmark />
        </header>

        <div className="relative max-w-md">
          <div className="kicker flex items-center gap-3 text-copper">
            <span className="h-px w-8 bg-copper/50" />
            Est. 2026 · Personal register
          </div>
          <h2 className="mt-6 font-serif text-[clamp(2.8rem,4.4vw,4.2rem)] leading-[0.94] text-bone">
            Every problem.
            <br />
            Every application.
            <br />
            <span className="text-copper">On the record.</span>
          </h2>
          <p className="mt-6 max-w-sm text-sm leading-relaxed text-ash">
            A quiet place to keep the work visible. Practice deliberately, apply consistently,
            and ship what you said you would.
          </p>
        </div>

        <div className="relative">
          <div className="divide-y divide-line border-y border-line">
            {registerRows.map((row) => (
              <div key={row.index} className="grid grid-cols-[2.5rem_6.5rem_1fr] gap-3 py-4">
                <span className="font-mono text-[10px] tracking-[0.16em] text-copper/80">
                  {row.index}
                </span>
                <span className="text-sm text-bone">{row.title}</span>
                <span className="text-xs leading-relaxed text-faint">{row.description}</span>
              </div>
            ))}
          </div>
          <p className="mt-5 font-mono text-[10px] tracking-[0.14em] text-faint uppercase">
            Docket · Private by default
          </p>
        </div>
      </aside>

      <main className="relative flex min-h-dvh min-w-0 flex-col overflow-x-hidden">
        <div className="flex items-center justify-between p-6 lg:hidden">
          <Wordmark />
          <span className="kicker">Est. 2026</span>
        </div>
        <div className="flex w-full min-w-0 flex-1 items-center justify-center px-5 pt-2 pb-12 sm:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}
