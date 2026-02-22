export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white/90 backdrop-blur-2xl">
      <nav className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 sm:px-6 sm:py-4 lg:px-8">
        <a href="/" className="flex items-center gap-2">
          <img src="/logo.svg" alt="DineSmart RMS" className="h-7 w-auto sm:h-8" />
          <span className="text-xl sm:text-2xl lg:text-xl font-bold tracking-wide text-zinc-900">
            DineSmart RMS
          </span>
        </a>

        <div className="hidden lg:flex flex-1 items-center justify-center gap-8 xl:gap-10 whitespace-nowrap">
          <a
            href="#features"
            className="text-sm lg:text-base font-medium text-zinc-700 hover:text-zinc-900 transition-colors duration-200 py-2"
          >
            Features
          </a>
          <a
            href="#solutions"
            className="text-sm lg:text-base font-medium text-zinc-700 hover:text-zinc-900 transition-colors duration-200 py-2"
          >
            Solutions
          </a>
          <a
            href="#contact"
            className="text-sm lg:text-base font-medium text-zinc-700 hover:text-zinc-900 transition-colors duration-200 py-2"
          >
            Contact Us
          </a>

          <div className="absolute left-0 -bottom-1 h-0.5 w-0 opacity-0" />
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <a
            href="/auth/login"
            className="hidden lg:flex items-center rounded-full border border-[#FF5C00] px-5 py-2 text-[15px] font-medium text-[#FF5C00] transition-colors duration-200 hover:bg-[#FF5C00] hover:text-white"
          >
            Login
          </a>
          <a
            href="#demo"
            className="flex items-center rounded-full bg-[#FF5C00] px-5 py-2 text-[15px] font-medium text-white transition-colors duration-200 hover:bg-[#e65300]"
          >
            Book Demo
          </a>
        </div>
      </nav>
    </header>
  );
}