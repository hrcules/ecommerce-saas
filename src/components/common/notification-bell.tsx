"use client";

import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useNotifications } from "@/hooks/queries/use-notifications";
import { useMarkNotificationRead } from "@/hooks/mutations/use-mark-notification-read";

export default function NotificationBell() {
  const { data: notifications = [] } = useNotifications();
  const markAsReadMutation = useMarkNotificationRead();

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleNotificationClick = (id: string, isRead: boolean) => {
    if (!isRead) {
      markAsReadMutation.mutate(id);
    }
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
        <div className="bg-muted/20 flex items-center justify-between border-b px-4 py-3">
          <p className="text-sm font-semibold">Notificações</p>
          <span className="text-muted-foreground text-xs">
            {unreadCount} não lidas
          </span>
        </div>

        <div className="flex max-h-80 flex-col overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="text-muted-foreground p-4 text-center text-sm">
              Nenhuma notificação por aqui.
            </div>
          ) : (
            notifications.map((notification) => (
              <button
                key={notification.id}
                onClick={() =>
                  handleNotificationClick(notification.id, notification.isRead)
                }
                className={`hover:bg-muted/50 flex flex-col items-start gap-1 border-b px-4 py-3 text-left transition-colors ${
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
                    <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                  )}
                </div>
                <p className="text-muted-foreground line-clamp-2 text-xs">
                  {notification.message}
                </p>
              </button>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
