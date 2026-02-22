import { Building2, ChefHat, Coffee, Store, Truck, Utensils, Workflow } from "lucide-react";

const SOLUTIONS = [
  {
    title: "Dine-In Restaurants",
    description:
      "Handle table assignments, split bills, KOT flow, and fast checkout for peak hours.",
    icon: Utensils,
    bullets: ["Table & floor view", "KOT to kitchen", "Split bills & discounts"],
  },
  {
    title: "Cafés & Bakeries",
    description:
      "Quick counter billing, modifiers, and smart inventory tracking for daily items.",
    icon: Coffee,
    bullets: ["Fast POS", "Modifiers & add-ons", "Daily stock tracking"],
  },
  {
    title: "Cloud Kitchens",
    description:
      "Manage delivery-only workflows with order status, rider handoff, and reporting.",
    icon: ChefHat,
    bullets: ["Multi-channel orders", "Prep time tracking", "Delivery-ready reports"],
  },
  {
    title: "Quick Service (QSR)",
    description:
      "Speed up ordering, reduce queues, and keep kitchen operations smooth and accurate.",
    icon: Workflow,
    bullets: ["Rapid order flow", "Kitchen display friendly", "Rush-hour stability"],
  },
  {
    title: "Multi-Branch Chains",
    description:
      "Centralize pricing, menus, and performance insights across locations.",
    icon: Building2,
    bullets: ["Branch-wise analytics", "Central menu control", "Role-based access"],
  },
  {
    title: "Takeaway & Delivery",
    description:
      "Simplify pickup, delivery tracking, and customer communication from one place.",
    icon: Truck,
    bullets: ["Pickup queue", "Delivery status", "Customer notes & instructions"],
  },
];

export function SolutionsSection() {
  return (
    <section id="solutions" className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl text-center">
        <p className="inline-flex rounded-full bg-[#FF5C00]/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#FF5C00]">
          Solutions
        </p>

        <h2 className="mt-4 text-[34px] font-extrabold leading-tight tracking-tight text-zinc-900 sm:text-[40px]">
          Built for every kind of restaurant.
        </h2>

        <p className="mt-4 text-[16px] leading-7 text-zinc-600">
          Whether you run a café, a cloud kitchen, or multiple branches—DineSmart adapts to your workflow.
        </p>
      </div>

      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SOLUTIONS.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.title}
              className="h-full rounded-2xl bg-white p-6 shadow-sm ring-1 ring-zinc-100 transition hover:shadow-md"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FF5C00]/10">
                  <Icon size={20} className="text-[#FF5C00]" />
                </div>

                <div className="min-w-0">
                  <h3 className="text-[16px] font-semibold text-zinc-900">
                    {s.title}
                  </h3>
                  <p className="mt-1 text-[14.5px] leading-6 text-zinc-600">
                    {s.description}
                  </p>
                </div>
              </div>

              <ul className="mt-4 space-y-2 text-[14.5px] text-zinc-700">
                {s.bullets.map((b) => (
                  <li key={b} className="flex items-start gap-2">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#FF5C00]" />
                    <span className="leading-6">{b}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </section>
  );
}