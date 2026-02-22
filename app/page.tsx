"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";
import { LandingPage } from "@/features/landing/components/landing-page";

export default function Home() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      if (user.role === 'WAITER') {
        router.replace("/waiter");
      } else if (user.role === 'CASHIER') {
        router.replace("/cashier");
      } else {
        router.replace("/admin");
      }
    }
  }, [user, isLoading, router]);

  // Show nothing or a loader while determining redirect to avoid layout shift
  if (isLoading || user) {
    return null;
  }

  return <LandingPage />;
}
