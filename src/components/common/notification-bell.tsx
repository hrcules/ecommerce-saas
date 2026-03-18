"use client";

import { useState } from "react";
import { Bell, CheckCheck, ChevronLeft, ChevronRight } from "lucide-react"; // Adicionamos as setas!
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useNotifications } from "@/hooks/queries/use-notifications";
import { useMarkNotificationRead } from "@/hooks/mutations/use-mark-notification-read";
import { useMarkAllNotificationsRead } from "@/hooks/mutations/use-mark-all-notifications-read";

export default function NotificationBell() {
  const { data: notifications = [] } = useNotifications();
  const markAsReadMutation = useMarkNotificationRead();
  const markAllReadMutation = useMarkAllNotificationsRead();

  // === LÓGICA DE PAGINAÇÃO ===
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

  const totalPages = Math.ceil(notifications.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedNotifications = notifications.slice(
    startIndex,
    startIndex + itemsPerPage,
  );
  // ===========================

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleNotificationClick = (id: string, isRead: boolean) => {
    if (!isRead) {
      markAsReadMutation.mutate(id);
    }
  };

  const handleMarkAllRead = () => {
    markAllReadMutation.mutate();
    setCurrentPage(1); // Volta para a página 1 ao limpar tudo
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-80 p-0" align="start">
        {/* CABEÇALHO */}
        <div className="bg-muted/20 flex items-center justify-between border-b px-4 py-3">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold">Notificações</p>
            {unreadCount > 0 && (
              <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                {unreadCount} novas
              </span>
            )}
          </div>

          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-primary h-auto p-1 text-xs"
              onClick={handleMarkAllRead}
              disabled={markAllReadMutation.isPending}
            >
              <CheckCheck className="mr-1 h-3 w-3" />
              Ler todas
            </Button>
          )}
        </div>

        {/* LISTA DE NOTIFICAÇÕES (Com altura mínima para não ficar pulando) */}
        <div className="flex min-h-[350px] flex-col">
          <div className="flex-1 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="text-muted-foreground mt-10 flex h-full flex-col items-center justify-center p-6 text-center text-sm">
                <Bell className="mb-2 h-8 w-8 opacity-20" />
                <p>Nenhuma notificação recente.</p>
                <p className="mt-1 text-xs opacity-70">
                  Avisos de até 7 dias aparecem aqui.
                </p>
              </div>
            ) : (
              paginatedNotifications.map((notification) => (
                <button
                  key={notification.id}
                  onClick={() =>
                    handleNotificationClick(
                      notification.id,
                      notification.isRead,
                    )
                  }
                  className={`hover:bg-muted/50 flex w-full flex-col items-start gap-1 border-b px-4 py-3 text-left transition-colors ${
                    !notification.isRead
                      ? "bg-blue-50/30 dark:bg-blue-950/20"
                      : ""
                  }`}
                >
                  <div className="flex w-full items-center justify-between">
                    <p
                      className={`text-sm ${!notification.isRead ? "font-semibold" : "font-medium"}`}
                    >
                      {notification.title}
                    </p>
                    {!notification.isRead && (
                      <span className="h-2 w-2 flex-shrink-0 rounded-full bg-blue-500"></span>
                    )}
                  </div>
                  <p className="text-muted-foreground line-clamp-2 text-xs">
                    {notification.message}
                  </p>
                </button>
              ))
            )}
          </div>

          {/* RODAPÉ: CONTROLES DE PAGINAÇÃO */}
          {totalPages > 1 && (
            <div className="bg-muted/10 mt-auto flex items-center justify-between border-t px-4 py-2">
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-muted-foreground text-xs font-medium">
                {currentPage} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7"
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
