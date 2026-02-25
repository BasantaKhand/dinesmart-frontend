"use client";

import { useState, useEffect } from "react";
import { Check, Zap } from "lucide-react";
import axios from "@/lib/axios";
import Link from "next/link";

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

// Curated features for cleaner display (limited per plan)
const displayFeatures: Record<string, string[]> = {
    starter: [
        'Up to 10 tables',
        'Up to 5 staff members',
        'Basic POS features',
        'Email support'
    ],
    professional: [
        'Up to 30 tables',
        'Up to 15 staff members',
        'Full POS features',
        'eSewa integration',
        'Priority support'
    ],
    enterprise: [
        'Unlimited tables & staff',
        'Multi-branch support',
        'All integrations',
        'Dedicated support'
    ]
};

const planDescriptions: Record<string, string> = {
    starter: 'Perfect for small restaurants just getting started',
    professional: 'Best for growing restaurants with more staff',
    enterprise: 'For large restaurants and chains'
};

export function PricingSection() {
    const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchPlans = async () => {
            try {
                const response = await axios.get('/subscriptions/plans');
                setPlans(response.data.data || []);
            } catch (error) {
                console.error('Failed to fetch plans:', error);
                // Fallback plans if API fails
                setPlans([
                    {
                        _id: '1',
                        name: 'Starter',
                        slug: 'starter',
                        description: planDescriptions.starter,
                        price: 1999,
                        currency: 'NPR',
                        billingCycle: 'MONTHLY',
                        features: displayFeatures.starter,
                        isPopular: false
                    },
                    {
                        _id: '2',
                        name: 'Professional',
                        slug: 'professional',
                        description: planDescriptions.professional,
                        price: 4999,
                        currency: 'NPR',
                        billingCycle: 'MONTHLY',
                        features: displayFeatures.professional,
                        isPopular: true
                    },
                    {
                        _id: '3',
                        name: 'Enterprise',
                        slug: 'enterprise',
                        description: planDescriptions.enterprise,
                        price: 9999,
                        currency: 'NPR',
                        billingCycle: 'MONTHLY',
                        features: displayFeatures.enterprise,
                        isPopular: false
                    }
                ]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchPlans();
    }, []);

    const formatPrice = (price: number) => {
        return price.toLocaleString('en-NP');
    };

    const getDisplayFeatures = (slug: string, originalFeatures: string[]) => {
        return displayFeatures[slug] || originalFeatures.slice(0, 4);
    };

    const getDescription = (slug: string, originalDescription: string) => {
        return planDescriptions[slug] || originalDescription;
    };

    return (
        <section id="pricing" className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
                <p className="inline-flex rounded-full bg-[#FF5C00]/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#FF5C00]">
                    Pricing
                </p>

                <h2 className="mt-4 text-[34px] font-extrabold leading-tight tracking-tight text-zinc-900 sm:text-[40px]">
                    Simple, transparent pricing
                </h2>

                <p className="mt-4 text-[16px] leading-7 text-zinc-600">
                    Choose the plan that fits your restaurant. No hidden fees, cancel anytime.
                </p>
            </div>

            {isLoading ? (
                <div className="mt-12 flex items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-200 border-t-[#FF5C00]"></div>
                </div>
            ) : (
                <div className="mt-16 grid gap-6 md:grid-cols-3 max-w-4xl mx-auto">
                    {plans.map((plan) => {
                        const isPopular = plan.isPopular;
                        const features = getDisplayFeatures(plan.slug, plan.features);
                        const description = getDescription(plan.slug, plan.description);
                        
                        return (
                            <div
                                key={plan._id}
                                className={`relative rounded-2xl bg-white p-6 transition ${
                                    isPopular
                                        ? 'ring-2 ring-[#FF5C00] shadow-sm hover:shadow-md'
                                        : 'ring-1 ring-zinc-200 shadow-sm hover:shadow-md hover:ring-zinc-300'
                                }`}
                            >
                                {isPopular && (
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
                                    <span className="text-sm text-zinc-500">/{plan.billingCycle === 'MONTHLY' ? 'month' : 'year'}</span>
                                </div>

                                <ul className="mt-5 space-y-2.5">
                                    {features.map((feature, idx) => (
                                        <li key={idx} className="flex items-start gap-2 text-sm text-zinc-600">
                                            <Check size={14} className="mt-0.5 text-[#FF5C00] shrink-0" />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>

                                <div className="mt-6">
                                    <Link
                                        href={`/auth/signup?plan=${plan.slug}`}
                                        className={`inline-flex items-center gap-1.5 text-sm font-semibold ${
                                            isPopular ? 'text-[#FF5C00]' : 'text-zinc-700'
                                        } hover:underline`}
                                    >
                                        Select Plan <span aria-hidden="true">→</span>
                                    </Link>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            <p className="mt-10 text-center text-sm text-zinc-500">
                Pay via eSewa. Cancel anytime.
            </p>
        </section>
    );
}
