import {
  BarChart3,
  ClipboardList,
  CreditCard,
  Layers3,
  Package,
  Smartphone,
  Users,
  UtensilsCrossed,
} from "lucide-react";

const FEATURES = [
  {
    title: "POS & Billing",
    description:
      "Fast checkout, split bills, discounts, taxes, and multiple payment options.",
    icon: CreditCard,
  },
  {
    title: "Order Management",
    description:
      "Track dine-in, takeaway, and delivery orders with clear status updates.",
    icon: ClipboardList,
  },
  {
    title: "Table Management",
    description:
      "Live floor view, table occupancy, and quick reassignment during rush hours.",
    icon: UtensilsCrossed,
  },
  {
    title: "Inventory Tracking",
    description:
      "Stock levels, low-stock alerts, and ingredient usage to reduce waste.",
    icon: Package,
  },
  {
    title: "Staff & Roles",
    description:
      "Manage staff access, shifts, and permissions with role-based controls.",
    icon: Users,
  },
  {
    title: "Reports & Analytics",
    description:
      "Sales trends, top items, peak hours, and profit insights in one dashboard.",
    icon: BarChart3,
  },
  {
    title: "Multi-Branch Ready",
    description:
      "Centralized control across branches with branch-wise performance views.",
    icon: Layers3,
  },
  {
    title: "Works Everywhere",
    description:
      "Responsive experience for desktop, tablet, and mobile—no friction.",
    icon: Smartphone,
  },
];

export function FeaturesSection() {
  return (
    <section
      id="features"
      className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-3xl text-center">
        <p className="inline-flex rounded-full bg-[#FF5C00]/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#FF5C00]">
          Features
        </p>

        <h2 className="mt-4 text-[34px] font-extrabold leading-tight tracking-tight text-zinc-900 sm:text-[40px]">
          Everything you need to run a restaurant efficiently.
        </h2>

        <p className="mt-4 text-[16px] leading-7 text-zinc-600">
          DineSmart brings your daily operations into one unified system—so you
          spend less time managing and more time growing.
        </p>
      </div>

      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {FEATURES.map((f) => {
          const Icon = f.icon;
          return (
            <div
              key={f.title}
              className="h-full rounded-2xl bg-white p-5 shadow-sm ring-1 ring-zinc-100 transition hover:shadow-md"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FF5C00]/10">
                  <Icon size={20} className="text-[#FF5C00]" />
                </div>

                <div className="min-w-0">
                  <h3 className="text-[15.5px] font-semibold text-zinc-900">
                    {f.title}
                  </h3>
                  <p className="mt-1 text-[14.5px] leading-6 text-zinc-600">
                    {f.description}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}