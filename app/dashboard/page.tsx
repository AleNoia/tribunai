"use client";

import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Scale } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      toast.success("Logout realizado com sucesso");
      router.push("/entrar");
      router.refresh();
    } catch {
      toast.error("Erro ao fazer logout");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        {/* Header */}
        <header className="flex items-center justify-between mb-16 pb-6 border-b border-border">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-md">
              <Scale className="h-6 w-6 text-foreground" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold">Dashboard</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Bem-vindo, {user?.user_metadata?.name || "Usuário"}
              </p>
            </div>
          </div>
          <Button variant="outline" onClick={handleSignOut}>
            Sair
          </Button>
        </header>

        {/* Conteúdo */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-2">Processos</h3>
            <p className="text-sm text-muted-foreground">
              Visualize seus processos
            </p>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-2">Consultas</h3>
            <p className="text-sm text-muted-foreground">
              Realize novas consultas
            </p>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-2">Relatórios</h3>
            <p className="text-sm text-muted-foreground">
              Acesse seus relatórios
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
