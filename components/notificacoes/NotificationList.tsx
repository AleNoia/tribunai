"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  FileText,
  Check,
  CheckCheck,
  Trash2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

interface Notificacao {
  id: string;
  tipo: string;
  titulo: string;
  mensagem: string;
  movimento_data: string | null;
  movimento_nome: string | null;
  lida: boolean;
  criado_em: string;
  user_processes: {
    id: string;
    apelido: string | null;
    processes: {
      numero: string;
      tribunal: string;
    };
  };
}

interface NotificationListProps {
  onUpdate?: () => void;
}

export function NotificationList({ onUpdate }: NotificationListProps) {
  const router = useRouter();
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"todas" | "nao_lidas">("todas");

  const fetchNotificacoes = async () => {
    try {
      setLoading(true);
      const url =
        filter === "nao_lidas"
          ? "/api/notificacoes?apenas_nao_lidas=true"
          : "/api/notificacoes";

      const response = await fetch(url);
      const data = await response.json();
      setNotificacoes(data.notificacoes || []);
    } catch (error) {
      console.error("Erro ao buscar notificações:", error);
      toast.error("Erro ao carregar notificações");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotificacoes();
  }, [filter]);

  const marcarComoLida = async (id: string, lida: boolean) => {
    try {
      const response = await fetch(`/api/notificacoes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lida }),
      });

      if (!response.ok) throw new Error("Erro ao atualizar");

      await fetchNotificacoes();
      onUpdate?.();
      toast.success(lida ? "Marcada como lida" : "Marcada como não lida");
    } catch (error) {
      toast.error("Erro ao atualizar notificação");
    }
  };

  const deletarNotificacao = async (id: string) => {
    try {
      const response = await fetch(`/api/notificacoes/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Erro ao deletar");

      await fetchNotificacoes();
      onUpdate?.();
      toast.success("Notificação removida");
    } catch (error) {
      toast.error("Erro ao remover notificação");
    }
  };

  const marcarTodasLidas = async () => {
    try {
      const response = await fetch("/api/notificacoes/marcar-todas-lidas", {
        method: "POST",
      });

      if (!response.ok) throw new Error("Erro ao marcar todas");

      await fetchNotificacoes();
      onUpdate?.();
      toast.success("Todas notificações marcadas como lidas");
    } catch (error) {
      toast.error("Erro ao marcar todas como lidas");
    }
  };

  const navegarParaProcesso = (userProcessId: string) => {
    router.push(`/dashboard/processos/${userProcessId}`);
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd/MM/yyyy 'às' HH:mm", {
        locale: ptBR,
      });
    } catch {
      return "Data inválida";
    }
  };

  const getIcon = (tipo: string) => {
    switch (tipo) {
      case "nova_movimentacao":
        return <FileText className="h-4 w-4" />;
      case "alerta":
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4 mt-6">
      {/* Filtros e Ações */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex gap-2">
          <Button
            variant={filter === "todas" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("todas")}
          >
            Todas
          </Button>
          <Button
            variant={filter === "nao_lidas" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("nao_lidas")}
          >
            Não lidas
          </Button>
        </div>

        {notificacoes.some((n) => !n.lida) && (
          <Button variant="ghost" size="sm" onClick={marcarTodasLidas}>
            <CheckCheck className="h-4 w-4 mr-2" />
            Marcar todas
          </Button>
        )}
      </div>

      <Separator />

      {/* Lista de Notificações */}
      {notificacoes.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Bell className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">
              {filter === "nao_lidas"
                ? "Você não tem notificações não lidas"
                : "Você não tem notificações"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {notificacoes.map((notif) => (
            <Card
              key={notif.id}
              className={`cursor-pointer transition-colors ${
                !notif.lida ? "bg-muted/50" : ""
              }`}
              onClick={() => navegarParaProcesso(notif.user_processes.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div
                    className={`mt-1 ${
                      !notif.lida ? "text-primary" : "text-muted-foreground"
                    }`}
                  >
                    {getIcon(notif.tipo)}
                  </div>

                  <div className="flex-1 space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <h4
                        className={`text-sm font-medium ${
                          !notif.lida ? "font-semibold" : ""
                        }`}
                      >
                        {notif.titulo}
                      </h4>
                      {!notif.lida && (
                        <Badge variant="default" className="h-2 w-2 p-0" />
                      )}
                    </div>

                    <p className="text-sm text-muted-foreground">
                      {notif.mensagem}
                    </p>

                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{notif.user_processes.processes.numero}</span>
                      <span>•</span>
                      <span>{notif.user_processes.processes.tribunal}</span>
                      {notif.user_processes.apelido && (
                        <>
                          <span>•</span>
                          <span>{notif.user_processes.apelido}</span>
                        </>
                      )}
                    </div>

                    <p className="text-xs text-muted-foreground">
                      {formatDate(notif.criado_em)}
                    </p>
                  </div>

                  <div
                    className="flex flex-col gap-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => marcarComoLida(notif.id, !notif.lida)}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => deletarNotificacao(notif.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
