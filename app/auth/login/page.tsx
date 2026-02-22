"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";
import { LoginPage } from "@/features/auth/components/login-page";

export default function LoginRoute() {
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

  if (isLoading || user) {
    return null;
  }

  return <LoginPage />;
}
