"use client"

import { useState } from "react"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { toast } from "react-toastify"
import { useAuth } from "@/providers/auth-provider"

export function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { login } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      await login({ email, password })
    } catch (err: any) {
      toast.error(err || 'Invalid credentials')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl items-center justify-center px-4 sm:px-6 lg:px-8">
        {/* responsive width */}
        <div className="w-full max-w-sm sm:max-w-md lg:max-w-sm">
          <a href="/" className="mb-6 flex items-center justify-center gap-2">
            <img src="/logo.svg" alt="DineSmart RMS" className="h-8 w-auto" />
            <span className="text-lg font-semibold text-zinc-900">
              DineSmart RMS
            </span>
          </a>

          {/* less rounded, more dashboard-like */}
          <div className="rounded-lg bg-white p-5 ring-1 ring-zinc-200 shadow-sm sm:p-6 lg:p-7">
            <div className="text-center">
              <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
                Welcome back
              </h1>
              <p className="mt-2 text-[15px] leading-6 text-zinc-600">
                Login to manage your restaurant dashboard.
              </p>
            </div>

            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              {/* Email */}
              <div>
                <label className="text-sm font-medium text-zinc-700">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="you@restaurant.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-2 w-full rounded-md bg-white px-4 py-2.5 text-[15px] text-zinc-900 ring-1 ring-zinc-200 outline-none transition focus:ring-2 focus:ring-[#FF5C00]/40"
                />
              </div>

              {/* Password */}
              <div>
                <label className="text-sm font-medium text-zinc-700">
                  Password
                </label>

                <div className="relative mt-2">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-md bg-white px-4 py-2.5 pr-12 text-[15px] text-zinc-900 ring-1 ring-zinc-200 outline-none transition focus:ring-2 focus:ring-[#FF5C00]/40"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-800"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Remember + Forgot */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <input
                    id="remember"
                    type="checkbox"
                    className="h-4 w-4 rounded border-zinc-300 text-[#FF5C00] focus:ring-[#FF5C00]/40"
                  />
                  <label
                    htmlFor="remember"
                    className="text-[14.5px] text-zinc-600"
                  >
                    Remember me
                  </label>
                </div>

                <a
                  href="/auth/forgot-password"
                  className="text-sm font-medium text-[#FF5C00] hover:underline underline-offset-4"
                >
                  Forgot Password?
                </a>
              </div>

              {/* Login */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex w-full items-center justify-center gap-2 rounded-md bg-[#FF5C00] px-5 py-2.5 text-[15px] font-medium text-white transition-colors duration-200 hover:bg-[#e65300] disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Logging in...
                  </>
                ) : (
                  "Login"
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <a
                href="#demo"
                className="mt-1 inline-flex text-[15px] font-medium text-[#FF5C00] underline-offset-4 hover:underline"
              >
                Request a walkthrough or book a demo →
              </a>
            </div>
          </div>

          <p className="mt-6 text-center text-[13px] text-zinc-500">
            © {new Date().getFullYear()} DineSmart RMS
          </p>
        </div>
      </div>
    </div>
  )
}
