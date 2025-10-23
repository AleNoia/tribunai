"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, Plus } from "lucide-react";
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
import { addProcessoSchema, AddProcessoInput } from "@/lib/schemas/processo";
import { logger } from "@/lib/logger";

interface AddProcessoDialogProps {
  onSuccess: () => void;
}

export function AddProcessoDialog({ onSuccess }: AddProcessoDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<AddProcessoInput>({
    resolver: zodResolver(addProcessoSchema),
    defaultValues: {
      numero: "",
      tribunal: "",
      apelido: "",
      notificar: true,
    },
  });

  const notificar = watch("notificar");

  const onSubmit = async (data: AddProcessoInput) => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/processos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Erro ao adicionar processo");
      }

      logger.info("Processo adicionado via UI", {
        action: "add_processo_ui_success",
        metadata: { numero: data.numero },
      });

      toast.success("Processo adicionado com sucesso!");
      reset();
      setOpen(false);
      onSuccess();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Erro desconhecido";

      logger.error("Erro ao adicionar processo via UI", {
        action: "add_processo_ui_error",
        metadata: { error: errorMessage },
      });

      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!isLoading) {
      setOpen(newOpen);
      if (!newOpen) {
        reset();
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Acompanhar Processo
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Adicionar Novo Processo</DialogTitle>
            <DialogDescription>
              Preencha os dados do processo que deseja acompanhar.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Número do processo */}
            <div className="grid gap-2">
              <Label htmlFor="numero">
                Número do Processo <span className="text-destructive">*</span>
              </Label>
              <Input
                id="numero"
                placeholder="0000000-00.0000.0.00.0000"
                {...register("numero")}
                disabled={isLoading}
                aria-invalid={!!errors.numero}
                aria-describedby={errors.numero ? "numero-error" : undefined}
              />
              {errors.numero && (
                <p id="numero-error" className="text-sm text-destructive">
                  {errors.numero.message}
                </p>
              )}
            </div>

            {/* Tribunal */}
            <div className="grid gap-2">
              <Label htmlFor="tribunal">
                Tribunal <span className="text-destructive">*</span>
              </Label>
              <Input
                id="tribunal"
                placeholder="Ex: TJ-SP, TRF-3, STJ"
                {...register("tribunal")}
                disabled={isLoading}
                aria-invalid={!!errors.tribunal}
                aria-describedby={
                  errors.tribunal ? "tribunal-error" : undefined
                }
              />
              {errors.tribunal && (
                <p id="tribunal-error" className="text-sm text-destructive">
                  {errors.tribunal.message}
                </p>
              )}
            </div>

            {/* Apelido */}
            <div className="grid gap-2">
              <Label htmlFor="apelido">Apelido (Opcional)</Label>
              <Input
                id="apelido"
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
              <Label htmlFor="notificar" className="flex-1">
                Receber notificações sobre este processo
              </Label>
              <Switch
                id="notificar"
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
              Adicionar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
