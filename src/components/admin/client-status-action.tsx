"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

type ClientStatusActionProps = {
  tenantId: string;
  status: string;
};

export function ClientStatusAction({
  tenantId,
  status,
}: ClientStatusActionProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const isActive = status === "ACTIVE";

  async function handleToggleStatus() {
    const nextStatus = isActive ? "DEACTIVE" : "ACTIVE";

    const confirmed = window.confirm(
      isActive
        ? "Yakin ingin menonaktifkan client ini? Admin client dan staff tidak akan bisa login."
        : "Yakin ingin mengaktifkan kembali client ini?"
    );

    if (!confirmed) return;

    setLoading(true);

    try {
      const response = await fetch("/api/admin/admin-clients/status", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tenantId,
          status: nextStatus,
        }),
      });

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        toast.error(result?.message || "Gagal mengubah status client.");
        return;
      }

      toast.success(result?.message || "Status client berhasil diubah.");
      router.refresh();
    } catch {
      toast.error("Server tidak dapat dihubungi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <span
        className={
          isActive
            ? "rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700"
            : "rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700"
        }
      >
        {isActive ? "ACTIVE" : "DEACTIVE"}
      </span>

      <Button
        type="button"
        size="sm"
        variant={isActive ? "destructive" : "secondary"}
        disabled={loading}
        onClick={handleToggleStatus}
      >
        {loading ? "Loading..." : isActive ? "Deactivate" : "Activate"}
      </Button>
    </div>
  );
}