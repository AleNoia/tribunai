"use client";

import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { NotificationList } from "./NotificationList";

interface NotificationBellProps {
  className?: string;
}

export function NotificationBell({ className }: NotificationBellProps) {
  const [naoLidas, setNaoLidas] = useState(0);
  const [open, setOpen] = useState(false);

  // Buscar contagem de notificações não lidas
  const fetchNaoLidas = async () => {
    try {
      const response = await fetch("/api/notificacoes?apenas_nao_lidas=true");
      const data = await response.json();
      setNaoLidas(data.nao_lidas || 0);
    } catch (error) {
      console.error("Erro ao buscar notificações:", error);
    }
  };

  useEffect(() => {
    fetchNaoLidas();

    // Atualizar a cada 5 minutos
    const interval = setInterval(fetchNaoLidas, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={`relative ${className}`}
          onClick={() => setOpen(true)}
        >
          <Bell className="h-5 w-5" />
          {naoLidas > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 min-w-5 rounded-full px-1 text-xs"
            >
              {naoLidas > 99 ? "99+" : naoLidas}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Notificações</SheetTitle>
        </SheetHeader>
        <NotificationList onUpdate={fetchNaoLidas} />
      </SheetContent>
    </Sheet>
  );
}
