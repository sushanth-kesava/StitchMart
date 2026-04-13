"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/login?role=admin&next=/portal/admin&force=1");
  }, [router]);

  return null;
}
