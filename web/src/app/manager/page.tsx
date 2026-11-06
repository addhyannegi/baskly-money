"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ManagerRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard/fund-manager");
  }, [router]);

  return (
    <div className="min-h-screen bg-[#0B0A09] flex items-center justify-center font-sans">
      <div className="w-8 h-8 rounded-full border-2 border-[#F59E0B] border-t-transparent animate-spin" />
    </div>
  );
}
