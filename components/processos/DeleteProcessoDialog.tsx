"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Trash2 } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { ProcessoAcompanhado } from "@/lib/schemas/processo";
import { logger } from "@/lib/logger";

interface DeleteProcessoDialogProps {
  processo: ProcessoAcompanhado;
  onSuccess: () => void;
}

export function DeleteProcessoDialog({
  processo,
  onSuccess,
}: DeleteProcessoDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    setIsLoading(true);

    try {
      const response = await fetch(`/api/processos/${processo.id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Erro ao remover processo");
      }

      logger.info("Processo removido via UI", {
        action: "delete_processo_ui_success",
        metadata: { processoId: processo.id },
      });

      toast.success("Processo removido com sucesso!");
      setOpen(false);
      onSuccess();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Erro desconhecido";

      logger.error("Erro ao remover processo via UI", {
        action: "delete_processo_ui_error",
        metadata: { error: errorMessage, processoId: processo.id },
      });

      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="text-destructive hover:text-destructive"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Excluir
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remover acompanhamento?</AlertDialogTitle>
          <AlertDialogDescription>
            Você está prestes a remover o acompanhamento do processo{" "}
            <span className="font-mono font-medium">{processo.numero}</span>.
            <br />
            <br />
            Isso não exclui o processo do tribunal, apenas remove ele da sua
            lista de acompanhamento. Esta ação não pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleDelete();
            }}
            disabled={isLoading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Remover
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
