"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LoadingSpinner } from "@/components/admin/LoadingSpinner";

export default function AdminPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin/posts");
  }, [router]);

  return (
    <LoadingSpinner label="リダイレクト中..." />
  );
}
