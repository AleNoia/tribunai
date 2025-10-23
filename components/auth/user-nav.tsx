"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { LogOut, User, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { logger } from "@/lib/logger";
import { createClient } from "@/lib/supabase/client";

export function UserNav() {
  const { user } = useAuth();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleSignOut = async () => {
    if (isLoggingOut) return;

    setIsLoggingOut(true);

    try {
      logger.info("Usuário iniciando logout", {
        action: "user_nav_logout_start",
        userId: user?.id,
      });

      const supabase = createClient();
      await supabase.auth.signOut();

      toast.success("Logout realizado com sucesso");

      // Limpar qualquer cache/estado local
      if (typeof window !== "undefined") {
        sessionStorage.clear();
      }

      router.push("/entrar");
      router.refresh();
    } catch (error) {
      logger.error("Erro no logout via user-nav", {
        action: "user_nav_logout_error",
        metadata: {
          error: error instanceof Error ? error.message : "Unknown",
        },
      });

      toast.error("Erro ao fazer logout. Tente novamente.");
      setIsLoggingOut(false);
    }
  };

  if (!user) return null;

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-3 px-4 py-2 bg-muted rounded-md border border-border">
        <div className="p-2 bg-primary/10 rounded-md">
          <User className="h-4 w-4 text-foreground" aria-hidden="true" />
        </div>
        <div className="text-sm">
          <p className="font-medium text-foreground">
            {user.user_metadata?.name || "Usuário"}
          </p>
          <p className="text-xs text-muted-foreground">{user.email}</p>
        </div>
      </div>
      <Button
        variant="outline"
        size="icon"
        onClick={handleSignOut}
        disabled={isLoggingOut}
        aria-label="Sair da conta"
        title="Sair"
      >
        {isLoggingOut ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        ) : (
          <LogOut className="h-4 w-4" aria-hidden="true" />
        )}
      </Button>
    </div>
  );
}
