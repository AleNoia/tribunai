"use client";

import { useEffect, useState, useCallback } from "react";
import { Loader2, FileText } from "lucide-react";
import { toast } from "sonner";

import { ProcessoAcompanhado } from "@/lib/schemas/processo";
import { ProcessosTable } from "@/components/processos/ProcessosTable";
import { AddProcessoDialog } from "@/components/processos/AddProcessoDialog";
import {
  ProcessosFilters,
  ProcessosFiltersState,
} from "@/components/processos/ProcessosFilters";
import { logger } from "@/lib/logger";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ProcessosPage() {
  const [processos, setProcessos] = useState<ProcessoAcompanhado[]>([]);
  const [filteredProcessos, setFilteredProcessos] = useState<
    ProcessoAcompanhado[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProcessos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/processos");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao buscar processos");
      }

      logger.info("Processos carregados na UI", {
        action: "fetch_processos_ui_success",
        metadata: { count: data.processos.length },
      });

      setProcessos(data.processos || []);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Erro desconhecido";

      logger.error("Erro ao carregar processos na UI", {
        action: "fetch_processos_ui_error",
        metadata: { error: errorMessage },
      });

      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProcessos();
  }, [fetchProcessos]);

  // Função de filtragem
  const handleFilterChange = useCallback(
    (filters: ProcessosFiltersState) => {
      let filtered = [...processos];

      // Filtro por número
      if (filters.numero) {
        const numeroLimpo = filters.numero.replace(/\D/g, "").toLowerCase();
        filtered = filtered.filter((p) =>
          p.numero.replace(/\D/g, "").toLowerCase().includes(numeroLimpo)
        );
      }

      // Filtro por tribunal
      if (filters.tribunal && filters.tribunal !== "todos") {
        filtered = filtered.filter((p) => p.tribunal === filters.tribunal);
      }

      // Filtro por parte (autor ou réu)
      if (filters.parte) {
        const parteLower = filters.parte.toLowerCase();
        filtered = filtered.filter((p) => {
          const partes = p.partes;
          if (!partes) return false;

          const todasPartes = [
            ...(partes.autor || []),
            ...(partes.reu || []),
          ].join(" ");

          return todasPartes.toLowerCase().includes(parteLower);
        });
      }

      // Filtro por notificações
      if (filters.notificacoes === "ativas") {
        filtered = filtered.filter((p) => p.notificar === true);
      } else if (filters.notificacoes === "desativadas") {
        filtered = filtered.filter((p) => p.notificar === false);
      }

      setFilteredProcessos(filtered);
    },
    [processos]
  );

  // Atualizar processos filtrados quando processos mudam
  useEffect(() => {
    setFilteredProcessos(processos);
  }, [processos]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Processos Acompanhados
          </h1>
          <p className="text-muted-foreground mt-2">
            Gerencie os processos que você está acompanhando
          </p>
        </div>
        <AddProcessoDialog onSuccess={fetchProcessos} />
      </div>

      {/* Filtros */}
      {processos.length > 0 && (
        <ProcessosFilters
          processos={processos}
          onFilterChange={handleFilterChange}
        />
      )}

      {/* Stats Card */}
      {processos.length > 0 && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total de Processos
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{processos.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {filteredProcessos.length === processos.length
                  ? "Processos acompanhados"
                  : `${filteredProcessos.length} de ${processos.length} exibidos`}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Com Notificações
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {processos.filter((p) => p.notificar).length}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Notificações ativas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Tribunais Únicos
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Set(processos.map((p) => p.tribunal)).size}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Diferentes tribunais
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Empty State */}
      {!loading && processos.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <FileText className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              Você ainda não acompanha nenhum processo
            </h3>
            <p className="text-muted-foreground text-center mb-6 max-w-md">
              Adicione processos para acompanhar suas movimentações e receber
              notificações importantes.
            </p>
            <AddProcessoDialog onSuccess={fetchProcessos} />
          </CardContent>
        </Card>
      )}

      {/* Error State */}
      {error && processos.length === 0 && (
        <Card className="border-destructive">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={fetchProcessos} variant="outline">
              Tentar Novamente
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Table */}
      {processos.length > 0 && (
        <ProcessosTable
          processos={filteredProcessos}
          onUpdate={fetchProcessos}
        />
      )}
    </div>
  );
}
