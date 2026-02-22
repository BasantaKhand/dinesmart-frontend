import { Mail, Phone, MapPin } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-zinc-200 bg-white">
      <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <img src="/logo.svg" alt="DineSmart RMS" className="h-7 w-auto" />
              <span className="text-lg font-semibold text-zinc-900">
                DineSmart RMS
              </span>
            </div>

            <p className="text-[14.5px] leading-6 text-zinc-600">
              All-in-one restaurant management system to streamline billing,
              inventory, staff, and analytics from a single dashboard.
            </p>
          </div>

          <div>
            <p className="text-sm font-semibold text-zinc-900">Product</p>
            <ul className="mt-4 space-y-2 text-[14.5px] text-zinc-600">
              <li>
                <a href="#features" className="hover:text-zinc-900">
                  Features
                </a>
              </li>
              <li>
                <a href="#solutions" className="hover:text-zinc-900">
                  Solutions
                </a>
              </li>
              <li>
                <a href="#contact" className="hover:text-zinc-900">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold text-zinc-900">Company</p>
            <ul className="mt-4 space-y-2 text-[14.5px] text-zinc-600">
              <li>
                <a href="#about" className="hover:text-zinc-900">
                  About Us
                </a>
              </li>
              <li>
                <a href="#demo" className="hover:text-zinc-900">
                  Book Demo
                </a>
              </li>
              <li>
                <a href="/login" className="hover:text-zinc-900">
                  Login
                </a>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold text-zinc-900">Contact</p>
            <ul className="mt-4 space-y-3 text-[14.5px] text-zinc-600">
              <li className="flex items-center gap-2">
                <Mail size={16} className="text-[#FF5C00]" />
                support@dinesmart.com
              </li>
              <li className="flex items-center gap-2">
                <Phone size={16} className="text-[#FF5C00]" />
                +1 (555) 123-4567
              </li>
              <li className="flex items-center gap-2">
                <MapPin size={16} className="text-[#FF5C00]" />
                Your City, Your Country
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-zinc-200 pt-6 sm:flex-row">
          <p className="text-[14px] text-zinc-500">
            © {new Date().getFullYear()} DineSmart RMS. All rights reserved.
          </p>

          <div className="flex items-center gap-4 text-[14px] text-zinc-500">
            <a href="#" className="hover:text-zinc-900">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-zinc-900">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}