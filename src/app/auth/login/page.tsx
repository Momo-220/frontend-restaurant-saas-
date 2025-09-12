"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Login désactivé temporairement: on redirige directement vers le dashboard
export default function LoginPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/dashboard");
  }, [router]);
  return null;
}



