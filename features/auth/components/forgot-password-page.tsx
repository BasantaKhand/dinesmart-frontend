"use client"

import { useState } from "react"
import { Loader2, CheckCircle, ArrowLeft } from "lucide-react"
import { forgotPasswordApi } from "@/api/auth.api"

export function ForgotPasswordPage() {
    const [email, setEmail] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSent, setIsSent] = useState(false)
    const [error, setError] = useState("")

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        setError("")

        try {
            await forgotPasswordApi(email)
            setIsSent(true)
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
                        {isSent ? (
                            <div className="text-center py-4">
                                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50">
                                    <CheckCircle size={28} className="text-emerald-500" />
                                </div>
                                <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
                                    Check your email
                                </h1>
                                <p className="mt-3 text-[15px] leading-6 text-zinc-600">
                                    We&apos;ve sent a password reset link to{" "}
                                    <span className="font-medium text-zinc-900">{email}</span>.
                                    The link will expire in 15 minutes.
                                </p>
                                <p className="mt-4 text-sm text-zinc-500">
                                    Didn&apos;t receive the email? Check your spam folder or{" "}
                                    <button
                                        onClick={() => { setIsSent(false); setEmail(""); }}
                                        className="font-medium text-[#FF5C00] hover:underline underline-offset-4"
                                    >
                                        try again
                                    </button>
                                </p>
                            </div>
                        ) : (
                            <>
                                <div className="text-center">
                                    <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
                                        Reset your password
                                    </h1>
                                    <p className="mt-2 text-[15px] leading-6 text-zinc-600">
                                        Enter the email associated with your account and we&apos;ll send a reset link.
                                    </p>
                                </div>

                                <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
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
                                                Sending...
                                            </>
                                        ) : (
                                            "Send Reset Link"
                                        )}
                                    </button>
                                </form>
                            </>
                        )}

                        <div className="mt-6 text-center">
                            <a
                                href="/auth/login"
                                className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors"
                            >
                                <ArrowLeft size={14} />
                                Back to login
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
