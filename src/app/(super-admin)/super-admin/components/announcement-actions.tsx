"use client";

import { useState } from "react";
import { Eye, EyeOff, Trash } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  deleteAnnouncement,
  toggleAnnouncementStatus,
} from "@/actions/announcement"; // As actions

interface AnnouncementActionsProps {
  announcementId: string;
  isActive: boolean;
}

export function AnnouncementActions({
  announcementId,
  isActive,
}: AnnouncementActionsProps) {
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  async function handleToggle() {
    setIsPending(true);
    const result = await toggleAnnouncementStatus(announcementId, isActive);

    if (result.success) {
      toast.success(isActive ? "Aviso ocultado." : "Aviso visível novamente.");
      router.refresh();
    } else {
      toast.error(result.error);
    }
    setIsPending(false);
  }

  async function handleDelete() {
    if (!confirm("Tem certeza que deseja apagar permanentemente?")) return;

    setIsPending(true);
    const result = await deleteAnnouncement(announcementId);

    if (result.success) {
      toast.success("Aviso deletado!");
      router.refresh();
    } else {
      toast.error(result.error);
    }
    setIsPending(false);
  }

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handleToggle}
        disabled={isPending}
        title={isActive ? "Ocultar aviso" : "Mostrar aviso"}
      >
        {isActive ? (
          <EyeOff className="h-4 w-4" />
        ) : (
          <Eye className="h-4 w-4" />
        )}
      </Button>

      <Button
        variant="destructive"
        size="sm"
        onClick={handleDelete}
        disabled={isPending}
        title="Apagar permanentemente"
      >
        <Trash className="h-4 w-4" />
      </Button>
    </div>
  );
}
