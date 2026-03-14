"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

const STORAGE_KEY = "mado-markdown";

export default function ShareRedirectPage() {
  const params = useParams();
  const router = useRouter();

  useEffect(() => {
    const id = params.id as string;
    if (!id) {
      router.replace("/");
      return;
    }

    fetch(`/api/share/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error("not found");
        return r.json();
      })
      .then((data) => {
        sessionStorage.setItem(STORAGE_KEY, data.markdown);
        router.replace("/view");
      })
      .catch(() => router.replace("/"));
  }, [params.id, router]);

  return (
    <div className="flex items-center justify-center py-20">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--primary)] border-t-transparent" />
    </div>
  );
}
