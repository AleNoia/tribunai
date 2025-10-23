"use client";

import { CheckCircle2, X, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";

export default function EmailConfirmadoPage() {
  useEffect(() => {
    // Tentar fechar a aba automaticamente após 3 segundos
    const timer = setTimeout(() => {
      window.close();
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    window.close();
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Ícone de Sucesso Animado */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-green-500/20 rounded-full animate-ping"></div>
            <div className="relative p-6 bg-green-500/10 rounded-full">
              <CheckCircle2
                className="h-20 w-20 text-green-600"
                aria-hidden="true"
                strokeWidth={1.5}
              />
            </div>
          </div>
        </div>

        {/* Mensagem Principal */}
        <div className="space-y-3">
          <h1 className="text-3xl font-bold text-foreground">
            Email Confirmado! ✅
          </h1>
          <p className="text-lg text-muted-foreground">
            Seu email foi verificado com sucesso
          </p>
        </div>

        {/* Instruções */}
        <div className="bg-muted/50 rounded-lg p-6 space-y-4 border border-border">
          <div className="flex items-start gap-3 text-left">
            <div className="p-2 bg-primary/10 rounded-md flex-shrink-0 mt-0.5">
              <ArrowLeft className="h-5 w-5 text-primary" aria-hidden="true" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-1">
                Volte para a aba do cadastro
              </h3>
              <p className="text-sm text-muted-foreground">
                Retorne à aba onde você iniciou o cadastro. O sistema detectará
                automaticamente a confirmação.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 text-left">
            <div className="p-2 bg-primary/10 rounded-md flex-shrink-0 mt-0.5">
              <X className="h-5 w-5 text-primary" aria-hidden="true" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-1">
                Feche esta aba
              </h3>
              <p className="text-sm text-muted-foreground">
                Você pode fechar esta janela com segurança. Seu cadastro
                continuará na outra aba.
              </p>
            </div>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="space-y-3">
          <Button
            onClick={handleClose}
            className="w-full h-12 text-base"
            size="lg"
          >
            <X className="h-5 w-5 mr-2" />
            Fechar esta aba
          </Button>

          <p className="text-xs text-muted-foreground">
            Esta janela será fechada automaticamente em alguns segundos
          </p>
        </div>

        {/* Informação Extra */}
        <div className="pt-4 border-t border-border">
          <p className="text-sm text-muted-foreground">
            Caso a aba não feche automaticamente,{" "}
            <button
              onClick={handleClose}
              className="text-primary hover:underline font-medium"
            >
              clique aqui
            </button>{" "}
            ou feche manualmente.
          </p>
        </div>
      </div>
    </div>
  );
}
