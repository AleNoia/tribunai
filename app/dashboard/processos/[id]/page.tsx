"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Loader2,
  FileText,
  ChevronLeft,
  Calendar,
  Building2,
  Bell,
  BellOff,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";

import { ProcessoAcompanhado } from "@/lib/schemas/processo";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { logger } from "@/lib/logger";

export default function ProcessoDetalhesPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [processo, setProcesso] = useState<ProcessoAcompanhado | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProcesso = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/processos/${id}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao buscar processo");
      }

      logger.info("Processo carregado", {
        action: "fetch_processo_detail",
        metadata: { id },
      });

      setProcesso(data.processo);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Erro desconhecido";

      logger.error("Erro ao carregar processo", {
        action: "fetch_processo_detail_error",
        metadata: { error: errorMessage, id },
      });

      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const atualizarProcessoDataJud = async () => {
    if (!processo?.numero) return;

    try {
      setUpdating(true);
      toast.info("Buscando dados atualizados no DataJud...");

      // ✅ SOLUÇÃO: Backend busca os dados (não expõe API key no cliente)
      const response = await fetch(`/api/processos/${id}/atualizar-datajud`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ numero: processo.numero }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao atualizar processo");
      }

      logger.info("Processo atualizado do DataJud", {
        action: "update_processo_datajud",
        metadata: { id },
      });

      toast.success("Dados atualizados com sucesso!");

      // Recarregar dados
      await fetchProcesso();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Erro desconhecido";

      logger.error("Erro ao atualizar do DataJud", {
        action: "update_processo_datajud_error",
        metadata: { error: errorMessage, id },
      });

      toast.error(errorMessage);
    } finally {
      setUpdating(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchProcesso();
    }
  }, [id, fetchProcesso]);

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd/MM/yyyy 'às' HH:mm", {
        locale: ptBR,
      });
    } catch {
      return "Data inválida";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !processo) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card className="border-destructive">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <AlertCircle className="h-16 w-16 text-destructive mb-4" />
            <p className="text-destructive mb-4">
              {error || "Processo não encontrado"}
            </p>
            <Button
              onClick={() => router.push("/dashboard/processos")}
              variant="outline"
            >
              Voltar para Processos
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/dashboard/processos")}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Detalhes do Processo
            </h1>
            <p className="text-muted-foreground mt-1">
              Informações completas do processo
            </p>
          </div>
        </div>
        <Button
          onClick={atualizarProcessoDataJud}
          disabled={updating}
          variant="outline"
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${updating ? "animate-spin" : ""}`} />
          {updating ? "Atualizando..." : "Atualizar do DataJud"}
        </Button>
      </div>

      {/* Informações Principais */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Informações Principais
            </CardTitle>
            <div className="flex items-center gap-2">
              {processo.notificar ? (
                <Badge variant="default" className="gap-1">
                  <Bell className="h-3 w-3" />
                  Notificações Ativas
                </Badge>
              ) : (
                <Badge variant="secondary" className="gap-1">
                  <BellOff className="h-3 w-3" />
                  Notificações Desativadas
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Número do Processo
              </label>
              <p className="font-mono text-lg font-semibold mt-1">
                {processo.numero}
              </p>
            </div>

            {processo.apelido && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Apelido
                </label>
                <p className="text-lg mt-1">{processo.apelido}</p>
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                <Building2 className="h-4 w-4" />
                Tribunal
              </label>
              <div className="mt-1">
                <Badge variant="outline" className="text-sm">
                  {processo.tribunal}
                </Badge>
              </div>
            </div>

            {processo.grau && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Grau
                </label>
                <p className="text-sm mt-1">{processo.grau}</p>
              </div>
            )}

            {processo.classe && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Classe
                </label>
                <p className="text-sm mt-1">{processo.classe.nome}</p>
              </div>
            )}

            {processo.formato && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Formato
                </label>
                <p className="text-sm mt-1">{processo.formato.nome}</p>
              </div>
            )}

            {processo.sistema && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Sistema
                </label>
                <p className="text-sm mt-1">{processo.sistema.nome}</p>
              </div>
            )}

            {processo.orgaoJulgador && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Órgão Julgador
                </label>
                <p className="text-sm mt-1">{processo.orgaoJulgador.nome}</p>
              </div>
            )}

            {processo.dataAjuizamento && (
              <div>
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Data de Ajuizamento
                </label>
                <p className="text-sm mt-1">
                  {formatDate(processo.dataAjuizamento)}
                </p>
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Adicionado em
              </label>
              <p className="text-sm mt-1">{formatDate(processo.created_at)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Assuntos */}
      {processo.assuntos && processo.assuntos.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Assuntos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {processo.assuntos.map((assunto, index) => (
                <Badge key={index} variant="secondary">
                  {assunto.nome}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Partes */}
      {processo.partes && Object.keys(processo.partes).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Partes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(processo.partes).map(
              ([tipo, nomes]) =>
                nomes &&
                nomes.length > 0 && (
                  <div key={tipo}>
                    <label className="text-sm font-medium text-muted-foreground capitalize">
                      {tipo}
                    </label>
                    <div className="mt-2 space-y-1">
                      {nomes.map((nome, index) => (
                        <p key={index} className="text-sm">
                          {nome}
                        </p>
                      ))}
                    </div>
                  </div>
                )
            )}
          </CardContent>
        </Card>
      )}

      {/* Movimentações */}
      {processo.movimentos && processo.movimentos.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Movimentações ({processo.movimentos.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {processo.movimentos.map((movimento, index) => (
                <div
                  key={index}
                  className={`pb-4 ${
                    index !== processo.movimentos!.length - 1 ? "border-b" : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{movimento.nome}</p>
                      {movimento.complementosTabelados &&
                        movimento.complementosTabelados.length > 0 && (
                          <div className="mt-2 space-y-1">
                            {movimento.complementosTabelados.map(
                              (comp, idx) => (
                                <p
                                  key={idx}
                                  className="text-sm text-muted-foreground"
                                >
                                  • {comp.descricao}
                                </p>
                              )
                            )}
                          </div>
                        )}
                    </div>
                    <div className="text-right">
                      <Badge
                        variant="outline"
                        className="text-xs whitespace-nowrap"
                      >
                        {formatDate(movimento.dataHora)}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : processo.ultima_movimentacao ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Última Movimentação
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Data
              </label>
              <p className="text-sm mt-1">
                {formatDate(processo.ultima_movimentacao.data)}
              </p>
            </div>

            {processo.ultima_movimentacao.descricao && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Descrição
                </label>
                <p className="text-sm mt-1 whitespace-pre-wrap">
                  {processo.ultima_movimentacao.descricao}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
