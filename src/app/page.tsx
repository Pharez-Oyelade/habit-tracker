"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import SplashScreen from "./components/shared/SplashScreen";
import { getSession } from "@/lib/storage";

export default function SplashPage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      const session = getSession();
      router.replace(session ? "/dashboard" : "/login");
    }, 1000);

    return () => clearTimeout(timer);
  }, [router]);

  return <SplashScreen />;
}
