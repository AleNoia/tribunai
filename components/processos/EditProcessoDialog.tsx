"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, Pencil } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  editProcessoSchema,
  EditProcessoInput,
  ProcessoAcompanhado,
} from "@/lib/schemas/processo";
import { logger } from "@/lib/logger";

interface EditProcessoDialogProps {
  processo: ProcessoAcompanhado;
  onSuccess: () => void;
}

export function EditProcessoDialog({
  processo,
  onSuccess,
}: EditProcessoDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<EditProcessoInput>({
    resolver: zodResolver(editProcessoSchema),
    defaultValues: {
      apelido: processo.apelido || "",
      notificar: processo.notificar,
    },
  });

  const notificar = watch("notificar");

  // Resetar form quando o dialog abrir
  useEffect(() => {
    if (open) {
      reset({
        apelido: processo.apelido || "",
        notificar: processo.notificar,
      });
    }
  }, [open, processo, reset]);

  const onSubmit = async (data: EditProcessoInput) => {
    setIsLoading(true);

    try {
      const response = await fetch(`/api/processos/${processo.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Erro ao editar processo");
      }

      logger.info("Processo editado via UI", {
        action: "edit_processo_ui_success",
        metadata: { processoId: processo.id },
      });

      toast.success("Processo atualizado com sucesso!");
      setOpen(false);
      onSuccess();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Erro desconhecido";

      logger.error("Erro ao editar processo via UI", {
        action: "edit_processo_ui_error",
        metadata: { error: errorMessage, processoId: processo.id },
      });

      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!isLoading) {
      setOpen(newOpen);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Pencil className="h-4 w-4 mr-2" />
          Editar
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Editar Acompanhamento</DialogTitle>
            <DialogDescription>
              Processo:{" "}
              <span className="font-mono font-medium">{processo.numero}</span>
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Apelido */}
            <div className="grid gap-2">
              <Label htmlFor="edit-apelido">Apelido (Opcional)</Label>
              <Input
                id="edit-apelido"
                placeholder="Ex: Processo do Sr. João Silva"
                {...register("apelido")}
                disabled={isLoading}
              />
              {errors.apelido && (
                <p className="text-sm text-destructive">
                  {errors.apelido.message}
                </p>
              )}
            </div>

            {/* Notificações */}
            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="edit-notificar" className="flex-1">
                Receber notificações sobre este processo
              </Label>
              <Switch
                id="edit-notificar"
                checked={notificar}
                onCheckedChange={(checked) => setValue("notificar", checked)}
                disabled={isLoading}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Salvar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
