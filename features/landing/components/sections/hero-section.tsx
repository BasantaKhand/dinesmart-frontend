export function HeroSection() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 pb-16 pt-10 sm:px-6 lg:px-8">
      <div className="grid gap-10 py-8 md:grid-cols-2 md:items-center md:py-12">
        <div className="space-y-5">
          <p className="inline-flex rounded-full bg-[#FF5C00]/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#FF5C00]">
            Restaurant Management System
          </p>

          <h1 className="text-[42px] font-extrabold leading-tight tracking-tight text-zinc-900 md:text-[48px]">
            Manage Your Restaurant Faster, Smarter, and Better.
          </h1>

          <p className="max-w-xl text-[16px] leading-7 text-zinc-600">
            From table management and billing to inventory and analytics, DineSmart
            helps restaurants streamline daily operations and boost profitability
            with one unified platform.
          </p>

          <div className="flex flex-wrap gap-3">
            <a
              href="/auth/signup"
              className="rounded-full bg-[#FF5C00] px-5 py-2 text-[15px] font-medium text-white transition-colors duration-200 hover:bg-[#e65300]"
            >
              Get Started
            </a>
            <a
              href="#features"
              className="rounded-full bg-white px-5 py-2 text-[15px] font-medium text-zinc-800 ring-1 ring-zinc-200 transition-colors duration-200 hover:bg-zinc-50"
            >
              Explore Features
            </a>
          </div>
        </div>

        <div className="rounded-3xl bg-white p-5 shadow-sm md:p-6">
          <p className="text-sm font-medium text-zinc-500">Today at a glance</p>

          <div className="mt-5 grid grid-cols-2 gap-4">
            <div className="rounded-xl bg-[#FF5C00]/10 p-4">
              <p className="text-xs font-medium text-[#FF5C00]">Orders Processed</p>
              <p className="mt-2 text-2xl font-bold text-zinc-900">1,284</p>
            </div>

            <div className="rounded-xl bg-sky-500/10 p-4">
              <p className="text-xs font-medium text-sky-700">Table Turnover</p>
              <p className="mt-2 text-2xl font-bold text-zinc-900">92%</p>
            </div>

            <div className="rounded-xl bg-fuchsia-500/10 p-4">
              <p className="text-xs font-medium text-fuchsia-700">Avg. Service Time</p>
              <p className="mt-2 text-2xl font-bold text-zinc-900">11m</p>
            </div>

            <div className="rounded-xl bg-amber-500/10 p-4">
              <p className="text-xs font-medium text-amber-700">Revenue Today</p>
              <p className="mt-2 text-2xl font-bold text-zinc-900">$8,240</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}