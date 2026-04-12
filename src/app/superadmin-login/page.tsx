"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SuperAdminLoginPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/login?role=superadmin&next=/portal/superadmin");
  }, [router]);

  return null;
}
