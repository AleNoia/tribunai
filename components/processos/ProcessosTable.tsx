"use client";

import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { FileText, Bell, BellOff } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ProcessoAcompanhado } from "@/lib/schemas/processo";
import { EditProcessoDialog } from "./EditProcessoDialog";
import { DeleteProcessoDialog } from "./DeleteProcessoDialog";

interface ProcessosTableProps {
  processos: ProcessoAcompanhado[];
  onUpdate: () => void;
}

export function ProcessosTable({ processos, onUpdate }: ProcessosTableProps) {
  const router = useRouter();

  const handleRowClick = (processoId: string) => {
    router.push(`/dashboard/processos/${processoId}`);
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

  const formatDateShort = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd/MM/yyyy", { locale: ptBR });
    } catch {
      return "-";
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[40px]"></TableHead>
            <TableHead>Processo</TableHead>
            <TableHead>Tribunal</TableHead>
            <TableHead className="hidden md:table-cell">
              Última Atualização
            </TableHead>
            <TableHead className="hidden sm:table-cell">Notificações</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {processos.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center">
                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mb-2 opacity-50" />
                  <p>Nenhum processo encontrado</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            processos.map((processo) => (
              <TableRow
                key={processo.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleRowClick(processo.id)}
              >
                <TableCell>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-mono text-sm font-medium">
                      {processo.numero}
                    </span>
                    {processo.apelido && (
                      <span className="text-xs text-muted-foreground mt-1">
                        {processo.apelido}
                      </span>
                    )}
                    {processo.ultima_movimentacao?.descricao && (
                      <span className="text-xs text-muted-foreground mt-1 line-clamp-2 md:hidden">
                        {processo.ultima_movimentacao.descricao}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{processo.tribunal}</Badge>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {processo.ultima_movimentacao?.data ? (
                    <div className="flex flex-col">
                      <span className="text-sm">
                        {formatDateShort(processo.ultima_movimentacao.data)}
                      </span>
                      {processo.ultima_movimentacao.descricao && (
                        <span className="text-xs text-muted-foreground line-clamp-2 mt-1">
                          {processo.ultima_movimentacao.descricao}
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-sm">
                      Sem movimentações
                    </span>
                  )}
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  <div className="flex items-center gap-2">
                    {processo.notificar ? (
                      <>
                        <Bell className="h-4 w-4 text-green-600" />
                        <span className="text-xs text-muted-foreground">
                          Ativas
                        </span>
                      </>
                    ) : (
                      <>
                        <BellOff className="h-4 w-4 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          Desativadas
                        </span>
                      </>
                    )}
                  </div>
                </TableCell>
                <TableCell
                  className="text-right"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-end gap-1">
                    <EditProcessoDialog
                      processo={processo}
                      onSuccess={onUpdate}
                    />
                    <DeleteProcessoDialog
                      processo={processo}
                      onSuccess={onUpdate}
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
