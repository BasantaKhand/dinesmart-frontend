"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Eye, EyeOff, Loader2, CheckCircle, AlertCircle } from "lucide-react"
import { resetPasswordApi } from "@/api/auth.api"

export function ResetPasswordPage() {
    const searchParams = useSearchParams()
    const router = useRouter()

    const token = searchParams.get("token") || ""
    const email = searchParams.get("email") || ""

    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)
    const [error, setError] = useState("")

    const isMissingParams = !token || !email

    // Redirect to login after success
    useEffect(() => {
        if (isSuccess) {
            const timer = setTimeout(() => {
                router.push("/auth/login")
            }, 3000)
            return () => clearTimeout(timer)
        }
    }, [isSuccess, router])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")

        if (newPassword !== confirmPassword) {
            setError("Passwords do not match.")
            return
        }

        if (newPassword.length < 6) {
            setError("Password must be at least 6 characters.")
            return
        }

        setIsSubmitting(true)

        try {
            await resetPasswordApi({ email, token, newPassword })
            setIsSuccess(true)
        } catch (err: any) {
            setError(err?.response?.data?.message || "Something went wrong. Please try again.")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="min-h-screen bg-white">
            <div className="mx-auto flex min-h-screen w-full max-w-7xl items-center justify-center px-4 sm:px-6 lg:px-8">
                <div className="w-full max-w-sm sm:max-w-md lg:max-w-sm">
                    <a href="/" className="mb-6 flex items-center justify-center gap-2">
                        <img src="/logo.svg" alt="DineSmart RMS" className="h-8 w-auto" />
                        <span className="text-lg font-semibold text-zinc-900">
                            DineSmart RMS
                        </span>
                    </a>

                    <div className="rounded-lg bg-white p-5 ring-1 ring-zinc-200 shadow-sm sm:p-6 lg:p-7">
                        {isMissingParams ? (
                            <div className="text-center py-4">
                                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
                                    <AlertCircle size={28} className="text-red-500" />
                                </div>
                                <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
                                    Invalid reset link
                                </h1>
                                <p className="mt-3 text-[15px] leading-6 text-zinc-600">
                                    This password reset link is invalid or malformed. Please request a new one.
                                </p>
                                <a
                                    href="/auth/forgot-password"
                                    className="mt-5 inline-flex items-center justify-center rounded-md bg-[#FF5C00] px-5 py-2.5 text-[15px] font-medium text-white transition-colors duration-200 hover:bg-[#e65300]"
                                >
                                    Request New Link
                                </a>
                            </div>
                        ) : isSuccess ? (
                            <div className="text-center py-4">
                                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50">
                                    <CheckCircle size={28} className="text-emerald-500" />
                                </div>
                                <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
                                    Password reset successful
                                </h1>
                                <p className="mt-3 text-[15px] leading-6 text-zinc-600">
                                    Your password has been updated. Redirecting to login...
                                </p>
                                <a
                                    href="/auth/login"
                                    className="mt-5 inline-flex items-center justify-center rounded-md bg-[#FF5C00] px-5 py-2.5 text-[15px] font-medium text-white transition-colors duration-200 hover:bg-[#e65300]"
                                >
                                    Go to Login
                                </a>
                            </div>
                        ) : (
                            <>
                                <div className="text-center">
                                    <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
                                        Set new password
                                    </h1>
                                    <p className="mt-2 text-[15px] leading-6 text-zinc-600">
                                        Enter your new password below.
                                    </p>
                                </div>

                                <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
                                    {/* New Password */}
                                    <div>
                                        <label className="text-sm font-medium text-zinc-700">
                                            New Password
                                        </label>
                                        <div className="relative mt-2">
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                placeholder="••••••••"
                                                required
                                                minLength={6}
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
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

                                    {/* Confirm Password */}
                                    <div>
                                        <label className="text-sm font-medium text-zinc-700">
                                            Confirm Password
                                        </label>
                                        <div className="relative mt-2">
                                            <input
                                                type={showConfirmPassword ? "text" : "password"}
                                                placeholder="••••••••"
                                                required
                                                minLength={6}
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                className="w-full rounded-md bg-white px-4 py-2.5 pr-12 text-[15px] text-zinc-900 ring-1 ring-zinc-200 outline-none transition focus:ring-2 focus:ring-[#FF5C00]/40"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPassword((v) => !v)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-800"
                                                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                                            >
                                                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>
                                    </div>

                                    {error && (
                                        <p className="text-sm font-medium text-red-600">{error}</p>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="flex w-full items-center justify-center gap-2 rounded-md bg-[#FF5C00] px-5 py-2.5 text-[15px] font-medium text-white transition-colors duration-200 hover:bg-[#e65300] disabled:opacity-70 disabled:cursor-not-allowed"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 size={18} className="animate-spin" />
                                                Resetting...
                                            </>
                                        ) : (
                                            "Reset Password"
                                        )}
                                    </button>
                                </form>
                            </>
                        )}
                    </div>

                    <p className="mt-6 text-center text-[13px] text-zinc-500">
                        © {new Date().getFullYear()} DineSmart RMS
                    </p>
                </div>
            </div>
        </div>
    )
}
