"use client";

import { useEffect, useState, Suspense, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Check, Zap, Loader2, ArrowLeft, ArrowRight, Mail, Phone, CreditCard } from "lucide-react";
import axios from "@/lib/axios";
import Link from "next/link";
import { Navbar } from "@/features/landing/components/navbar";

interface SubscriptionPlan {
    _id: string;
    name: string;
    slug: string;
    description: string;
    price: number;
    currency: string;
    billingCycle: string;
    features: string[];
    isPopular: boolean;
}

interface EsewaFormData {
    amount: string;
    tax_amount: string;
    total_amount: string;
    transaction_uuid: string;
    product_code: string;
    product_service_charge: string;
    product_delivery_charge: string;
    success_url: string;
    failure_url: string;
    signed_field_names: string;
    signature: string;
}

// Curated features for cleaner display
const displayFeatures: Record<string, string[]> = {
    starter: ['Up to 10 tables', 'Up to 5 staff members', 'Basic POS features', 'Email support'],
    professional: ['Up to 30 tables', 'Up to 15 staff members', 'Full POS features', 'eSewa integration', 'Priority support'],
    enterprise: ['Unlimited tables & staff', 'Multi-branch support', 'All integrations', 'Dedicated support']
};

const planDescriptions: Record<string, string> = {
    starter: 'Perfect for small restaurants just getting started',
    professional: 'Best for growing restaurants with more staff',
    enterprise: 'For large restaurants and chains'
};

function SignupContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [step, setStep] = useState(1); // 1: Select Plan, 2: Contact Info, 3: Processing
    const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
    const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const formRef = useRef<HTMLFormElement>(null);
    const [esewaData, setEsewaData] = useState<EsewaFormData | null>(null);
    const [esewaUrl, setEsewaUrl] = useState<string>("");

    // Form data
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");

    const preselectedPlan = searchParams.get("plan");

    useEffect(() => {
        const fetchPlans = async () => {
            try {
                const response = await axios.get("/subscriptions/plans");
                const fetchedPlans = response.data.data || [];
                setPlans(fetchedPlans);

                // Auto-select plan if slug provided
                if (preselectedPlan) {
                    const plan = fetchedPlans.find((p: SubscriptionPlan) => p.slug === preselectedPlan);
                    if (plan) {
                        setSelectedPlan(plan);
                        setStep(2); // Skip to contact info
                    }
                }
            } catch (error) {
                setError("Failed to load subscription plans");
            } finally {
                setIsLoading(false);
            }
        };

        fetchPlans();
    }, [preselectedPlan]);

    // Auto-submit to eSewa when form data is ready
    useEffect(() => {
        if (esewaData && formRef.current) {
            formRef.current.submit();
        }
    }, [esewaData]);

    const handlePlanSelect = (plan: SubscriptionPlan) => {
        setSelectedPlan(plan);
        setStep(2);
        setError(null);
    };

    const handleBack = () => {
        setStep(1);
        setError(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!selectedPlan) {
            setError("Please select a plan");
            return;
        }

        if (!email || !phone) {
            setError("Please fill in all fields");
            return;
        }

        // Basic email validation
        if (!/^\S+@\S+\.\S+$/.test(email)) {
            setError("Please enter a valid email address");
            return;
        }

        setIsProcessing(true);
        setError(null);
        setStep(3);

        try {
            const response = await axios.post("/checkout/session", {
                email,
                phone,
                planId: selectedPlan._id,
            });

            const { esewaPaymentUrl, esewaFormData } = response.data.data;
            
            // Set form data and URL to trigger form submission
            setEsewaUrl(esewaPaymentUrl);
            setEsewaData(esewaFormData);
        } catch (err: any) {
            setError(err.response?.data?.message || "Something went wrong. Please try again.");
            setIsProcessing(false);
            setStep(2);
        }
    };

    const formatPrice = (price: number) => {
        return price.toLocaleString("en-NP");
    };

    const getDisplayFeatures = (slug: string, originalFeatures: string[]) => {
        return displayFeatures[slug] || originalFeatures.slice(0, 4);
    };

    const getDescription = (slug: string, originalDescription: string) => {
        return planDescriptions[slug] || originalDescription;
    };

    if (isLoading) {
        return (
            <>
                <Navbar />
                <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-200 border-t-[#FF5C00]"></div>
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-zinc-50 py-8 px-4">
            {/* Hidden eSewa form */}
            {esewaData && (
                <form ref={formRef} action={esewaUrl} method="POST" style={{ display: "none" }}>
                    <input type="hidden" name="amount" value={esewaData.amount} />
                    <input type="hidden" name="tax_amount" value={esewaData.tax_amount} />
                    <input type="hidden" name="total_amount" value={esewaData.total_amount} />
                    <input type="hidden" name="transaction_uuid" value={esewaData.transaction_uuid} />
                    <input type="hidden" name="product_code" value={esewaData.product_code} />
                    <input type="hidden" name="product_service_charge" value={esewaData.product_service_charge} />
                    <input type="hidden" name="product_delivery_charge" value={esewaData.product_delivery_charge} />
                    <input type="hidden" name="success_url" value={esewaData.success_url} />
                    <input type="hidden" name="failure_url" value={esewaData.failure_url} />
                    <input type="hidden" name="signed_field_names" value={esewaData.signed_field_names} />
                    <input type="hidden" name="signature" value={esewaData.signature} />
                </form>
            )}

            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    
                    {/* Progress Steps */}
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <div className={`flex items-center gap-2 ${step >= 1 ? 'text-[#FF5C00]' : 'text-zinc-400'}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${step >= 1 ? 'bg-[#FF5C00] text-white' : 'bg-zinc-200 text-zinc-500'}`}>
                                {step > 1 ? <Check size={16} /> : '1'}
                            </div>
                            <span className="text-sm font-medium hidden sm:inline">Select Plan</span>
                        </div>
                        <div className="w-8 h-px bg-zinc-300" />
                        <div className={`flex items-center gap-2 ${step >= 2 ? 'text-[#FF5C00]' : 'text-zinc-400'}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${step >= 2 ? 'bg-[#FF5C00] text-white' : 'bg-zinc-200 text-zinc-500'}`}>
                                {step > 2 ? <Check size={16} /> : '2'}
                            </div>
                            <span className="text-sm font-medium hidden sm:inline">Your Details</span>
                        </div>
                        <div className="w-8 h-px bg-zinc-300" />
                        <div className={`flex items-center gap-2 ${step >= 3 ? 'text-[#FF5C00]' : 'text-zinc-400'}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${step >= 3 ? 'bg-[#FF5C00] text-white' : 'bg-zinc-200 text-zinc-500'}`}>
                                3
                            </div>
                            <span className="text-sm font-medium hidden sm:inline">Payment</span>
                        </div>
                    </div>
                </div>

                {/* Step 1: Select Plan */}
                {step === 1 && (
                    <div>
                        <h1 className="text-2xl font-bold text-zinc-900 text-center mb-2">Choose Your Plan</h1>
                        <p className="text-zinc-600 text-center mb-8">Select the plan that fits your restaurant</p>

                        <div className="grid gap-4 md:grid-cols-3">
                            {plans.map((plan) => {
                                const features = getDisplayFeatures(plan.slug, plan.features);
                                const description = getDescription(plan.slug, plan.description);
                                return (
                                    <button
                                        key={plan._id}
                                        onClick={() => handlePlanSelect(plan)}
                                        className={`relative rounded-2xl bg-white p-5 text-left transition ring-1 hover:shadow-md ${
                                            plan.isPopular ? 'ring-[#FF5C00]' : 'ring-zinc-200 hover:ring-zinc-300'
                                        }`}
                                    >
                                        {plan.isPopular && (
                                            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                                <span className="inline-flex items-center gap-1 rounded-full bg-[#FF5C00] px-2.5 py-0.5 text-xs font-semibold text-white">
                                                    <Zap size={10} />
                                                    Popular
                                                </span>
                                            </div>
                                        )}
                                        
                                        <h3 className="font-bold text-zinc-900">{plan.name}</h3>
                                        <p className="mt-1 text-sm text-zinc-500">{description}</p>
                                        
                                        <div className="mt-4">
                                            <span className="text-2xl font-extrabold text-zinc-900">NPR {formatPrice(plan.price)}</span>
                                            <span className="text-sm text-zinc-500">/month</span>
                                        </div>

                                        <ul className="mt-4 space-y-2">
                                            {features.map((feature, idx) => (
                                                <li key={idx} className="flex items-start gap-2 text-sm text-zinc-600">
                                                    <Check size={14} className="mt-0.5 text-[#FF5C00] shrink-0" />
                                                    {feature}
                                                </li>
                                            ))}
                                        </ul>

                                        <div className="mt-5 text-center">
                                            <span className={`inline-flex items-center gap-1.5 text-sm font-semibold ${plan.isPopular ? 'text-[#FF5C00]' : 'text-zinc-700'}`}>
                                                Select Plan <ArrowRight size={14} />
                                            </span>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>

                        <p className="mt-6 text-center text-sm text-zinc-500">
                            Already have an account? <Link href="/auth/login" className="text-[#FF5C00] font-medium hover:underline">Login</Link>
                        </p>
                    </div>
                )}

                {/* Step 2: Contact Info */}
                {step === 2 && selectedPlan && (
                    <div className="max-w-md mx-auto">
                        <button
                            onClick={handleBack}
                            className="inline-flex items-center gap-1.5 text-sm text-zinc-600 hover:text-zinc-900 mb-6"
                        >
                            <ArrowLeft size={16} />
                            Change Plan
                        </button>

                        <div className="bg-white rounded-2xl p-6 ring-1 ring-zinc-200 mb-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-zinc-500">Selected Plan</p>
                                    <p className="font-bold text-zinc-900">{selectedPlan.name}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xl font-extrabold text-zinc-900">NPR {formatPrice(selectedPlan.price)}</p>
                                    <p className="text-sm text-zinc-500">per month</p>
                                </div>
                            </div>
                        </div>

                        <h2 className="text-xl font-bold text-zinc-900 mb-1">Enter Your Details</h2>
                        <p className="text-sm text-zinc-600 mb-6">We&apos;ll send your activation link to this email after payment</p>

                        {error && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="you@example.com"
                                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-zinc-200 focus:border-[#FF5C00] focus:ring-1 focus:ring-[#FF5C00] outline-none transition"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                                    Phone Number
                                </label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                                    <input
                                        type="tel"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        placeholder="98XXXXXXXX"
                                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-zinc-200 focus:border-[#FF5C00] focus:ring-1 focus:ring-[#FF5C00] outline-none transition"
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isProcessing}
                                className="w-full bg-[#FF5C00] text-white py-3 rounded-xl font-semibold hover:bg-[#e65300] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isProcessing ? (
                                    <>
                                        <Loader2 className="animate-spin" size={18} />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <CreditCard size={18} />
                                        Continue to Payment
                                    </>
                                )}
                            </button>
                        </form>

                        <p className="mt-4 text-center text-xs text-zinc-500">
                            By continuing, you agree to our Terms of Service and Privacy Policy
                        </p>
                    </div>
                )}

                {/* Step 3: Processing */}
                {step === 3 && (
                    <div className="max-w-md mx-auto text-center py-12">
                        <Loader2 className="h-12 w-12 animate-spin text-[#FF5C00] mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-zinc-900 mb-2">Redirecting to eSewa...</h2>
                        <p className="text-zinc-600">Please wait while we redirect you to complete payment</p>
                    </div>
                )}
            </div>
        </div>
        </>
    );
}

export default function SignupPage() {
    return (
        <Suspense fallback={
            <>
                <Navbar />
                <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-200 border-t-[#FF5C00]"></div>
                </div>
            </>
        }>
            <SignupContent />
        </Suspense>
    );
}
