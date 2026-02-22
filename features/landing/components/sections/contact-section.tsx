import { Mail, MapPin, Phone, Clock } from "lucide-react";

export function ContactSection() {
  return (
    <section id="contact" className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl text-center">
        <p className="inline-flex rounded-full bg-[#FF5C00]/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#FF5C00]">
          Contact
        </p>

        <h2 className="mt-4 text-[34px] font-extrabold leading-tight tracking-tight text-zinc-900 sm:text-[40px]">
          Talk to our team.
        </h2>

        <p className="mt-4 text-[16px] leading-7 text-zinc-600">
          Have questions or want a demo? Send a message and we’ll get back to you quickly.
        </p>
      </div>

      <div className="mt-12 grid gap-6 lg:grid-cols-12">
        <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-zinc-100 lg:col-span-7">
          <form className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-1">
              <label className="text-sm font-medium text-zinc-700">Full name</label>
              <input
                type="text"
                placeholder="Your name"
                className="mt-2 w-full rounded-xl bg-white px-4 py-3 text-[15px] text-zinc-900 ring-1 ring-zinc-200 outline-none focus:ring-2 focus:ring-[#FF5C00]/40"
              />
            </div>

            <div className="sm:col-span-1">
              <label className="text-sm font-medium text-zinc-700">Restaurant name</label>
              <input
                type="text"
                placeholder="Your restaurant"
                className="mt-2 w-full rounded-xl bg-white px-4 py-3 text-[15px] text-zinc-900 ring-1 ring-zinc-200 outline-none focus:ring-2 focus:ring-[#FF5C00]/40"
              />
            </div>

            <div className="sm:col-span-1">
              <label className="text-sm font-medium text-zinc-700">Email</label>
              <input
                type="email"
                placeholder="you@restaurant.com"
                className="mt-2 w-full rounded-xl bg-white px-4 py-3 text-[15px] text-zinc-900 ring-1 ring-zinc-200 outline-none focus:ring-2 focus:ring-[#FF5C00]/40"
              />
            </div>

            <div className="sm:col-span-1">
              <label className="text-sm font-medium text-zinc-700">Phone</label>
              <input
                type="tel"
                placeholder="+1 (555) 000-0000"
                className="mt-2 w-full rounded-xl bg-white px-4 py-3 text-[15px] text-zinc-900 ring-1 ring-zinc-200 outline-none focus:ring-2 focus:ring-[#FF5C00]/40"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-sm font-medium text-zinc-700">Message</label>
              <textarea
                rows={5}
                placeholder="Tell us what you need (demo, pricing, branches, POS, inventory, etc.)"
                className="mt-2 w-full resize-none rounded-xl bg-white px-4 py-3 text-[15px] text-zinc-900 ring-1 ring-zinc-200 outline-none focus:ring-2 focus:ring-[#FF5C00]/40"
              />
            </div>

            <div className="sm:col-span-2 flex flex-wrap items-center justify-between gap-3 pt-2">
              <p className="text-sm text-zinc-500">
                By submitting, you agree to be contacted about DineSmart RMS.
              </p>

              <button
                type="button"
                className="rounded-full bg-[#FF5C00] px-6 py-2 text-[15px] font-medium text-white transition-colors duration-200 hover:bg-[#e65300]"
              >
                Send Message
              </button>
            </div>
          </form>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-zinc-100 lg:col-span-5">
          <h3 className="text-[18px] font-semibold text-zinc-900">Contact details</h3>
          <p className="mt-2 text-[15px] leading-7 text-zinc-600">
            Reach us directly or send a message using the form. We typically respond within 24 hours.
          </p>

          <div className="mt-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FF5C00]/10">
                <Mail size={20} className="text-[#FF5C00]" />
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-900">Email</p>
                <p className="text-[15px] text-zinc-600">support@dinesmart.com</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FF5C00]/10">
                <Phone size={20} className="text-[#FF5C00]" />
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-900">Phone</p>
                <p className="text-[15px] text-zinc-600">+1 (555) 123-4567</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FF5C00]/10">
                <Clock size={20} className="text-[#FF5C00]" />
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-900">Hours</p>
                <p className="text-[15px] text-zinc-600">Mon–Fri, 9:00 AM – 6:00 PM</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FF5C00]/10">
                <MapPin size={20} className="text-[#FF5C00]" />
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-900">Location</p>
                <p className="text-[15px] text-zinc-600">Your City, Your Country</p>
              </div>
            </div>
          </div>

          <div className="mt-8 rounded-2xl bg-zinc-50 p-4 ring-1 ring-zinc-100">
            <p className="text-sm font-medium text-zinc-900">For faster demos</p>
            <p className="mt-1 text-[15px] text-zinc-600">
              Include your restaurant type, number of branches, and preferred time.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}