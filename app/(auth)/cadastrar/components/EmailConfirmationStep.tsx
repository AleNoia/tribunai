"use client";

import { Button } from "@/components/ui/button";
import { Mail, ArrowLeft, Loader2 } from "lucide-react";

interface EmailConfirmationStepProps {
  isEmailSending: boolean;
  isEmailSent: boolean;
  email: string;
  resendCountdown: number;
  onResendEmail: () => Promise<void>;
  onBackToRegister: () => void;
}

export function EmailConfirmationStep({
  isEmailSending,
  isEmailSent,
  email,
  resendCountdown,
  onResendEmail,
  onBackToRegister,
}: EmailConfirmationStepProps) {
  return (
    <div className="w-full mx-auto text-center space-y-6">
      {/* Ícone Animado */}
      <div className="flex justify-center">
        <div className="p-6 bg-primary/10 rounded-full animate-pulse">
          <Mail className="h-16 w-16 text-primary" aria-hidden="true" />
        </div>
      </div>

      {/* Mensagem */}
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">Confirme seu email</h2>
        {isEmailSending ? (
          <p className="text-sm text-muted-foreground">Enviando email...</p>
        ) : isEmailSent ? (
          <>
            <p className="text-sm text-muted-foreground">
              Enviamos um email para:
            </p>
            <p className="text-base font-medium text-foreground">{email}</p>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">
            Preparando envio de email...
          </p>
        )}
      </div>

      {isEmailSent && (
        <>
          <p className="text-sm text-muted-foreground">
            Clique no link para confirmar sua conta e continue o cadastro
          </p>

          {/* Loading Indicator */}
          <div className="flex items-center justify-center gap-2 py-4">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <span className="text-sm text-muted-foreground">
              Aguardando confirmação...
            </span>
          </div>

          {/* Botão Reenviar */}
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Não recebeu o email?
            </p>
            <Button
              variant="outline"
              onClick={onResendEmail}
              disabled={resendCountdown > 0}
              className="w-full"
            >
              {resendCountdown > 0
                ? `Reenviar email (${resendCountdown}s)`
                : "🔄 Reenviar email"}
            </Button>
          </div>
        </>
      )}

      {/* Botão Voltar */}
      <button
        onClick={onBackToRegister}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mx-auto"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar e editar dados
      </button>
    </div>
  );
}
