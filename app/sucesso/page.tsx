"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Check, Loader2, XCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { logger } from "@/lib/logger";
import { Button } from "@/components/ui/button";

// Tipos
interface UserPlanData {
  plan: string;
  paymentStatus: string;
}

interface PaymentStatusResponse {
  success: boolean;
  message?: string;
  payment_status?: string;
}

// Função para buscar dados do plano do usuário
const fetchUserPlan = async (): Promise<UserPlanData> => {
  const response = await fetch("/api/users/get-plan");

  if (!response.ok) {
    throw new Error("Erro ao buscar plano do usuário");
  }

  return response.json();
};

// Função para atualizar status de pagamento manualmente
const updatePaymentStatus = async ({
  userId,
  sessionId,
}: {
  userId: string;
  sessionId: string;
}): Promise<PaymentStatusResponse> => {
  const response = await fetch("/api/stripe/update-payment-status", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, sessionId }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Erro ao atualizar status");
  }

  return response.json();
};

export default function SucessoPage() {
  const [countdown, setCountdown] = useState(3);
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("Verificando pagamento...");

  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const { user, refreshUser } = useAuth();
  const queryClient = useQueryClient();

  // Query para buscar dados do plano do usuário com polling
  const {
    data: planData,
    error: planError,
    isLoading: isLoadingPlan,
  } = useQuery({
    queryKey: ["user-plan", user?.id],
    queryFn: fetchUserPlan,
    enabled: !!user,
    refetchInterval: (query) => {
      const data = query.state.data;

      // Parar de refazer query se pagamento foi confirmado
      if (data && data.paymentStatus === "active" && data.plan !== "free") {
        logger.info("✅ Pagamento confirmado via polling", {
          action: "payment_confirmed_polling",
          userId: user?.id,
          metadata: {
            plan: data.plan,
            paymentStatus: data.paymentStatus,
            sessionId,
          },
        });
        return false;
      }

      // Refazer a cada 5 segundos se ainda está pending
      return 5000;
    },
    retry: 3,
    retryDelay: 2000,
  });

  // Mutation para atualizar status de pagamento manualmente
  const updatePaymentMutation = useMutation({
    mutationFn: updatePaymentStatus,
    onSuccess: (data) => {
      logger.info("✅ Status de pagamento atualizado com sucesso", {
        action: "payment_status_updated",
        userId: user?.id,
        metadata: { sessionId, response: data },
      });

      // Invalidar queries para buscar dados atualizados
      queryClient.invalidateQueries({ queryKey: ["user-plan", user?.id] });
      refreshUser();

      setStatus("success");
      setMessage("Pagamento confirmado! Redirecionando...");
    },
    onError: (error: Error) => {
      logger.error("❌ Erro ao atualizar status de pagamento", {
        action: "payment_status_update_error",
        userId: user?.id,
        metadata: {
          error: error.message,
          sessionId,
        },
      });

      setStatus("error");
      setMessage("Erro ao confirmar pagamento. Tente novamente.");
    },
  });

  // Efeito para verificar status do pagamento
  useEffect(() => {
    if (!user) {
      setStatus("loading");
      setMessage("Aguardando confirmação...");
      return;
    }

    // Aguardar um pouco para o webhook processar
    const timer = setTimeout(() => {
      if (planData?.paymentStatus === "active" && planData?.plan !== "free") {
        logger.info("✅ Pagamento confirmado via webhook", {
          action: "payment_confirmed_webhook",
          userId: user.id,
          metadata: {
            plan: planData.plan,
            paymentStatus: planData.paymentStatus,
            sessionId,
          },
        });

        setStatus("success");
        setMessage("Pagamento confirmado! Redirecionando...");
      } else if (planData?.paymentStatus === "pending" && sessionId) {
        logger.info(
          "⏳ Pagamento ainda pending, tentando atualizar manualmente",
          {
            action: "payment_manual_update_attempt",
            userId: user.id,
            metadata: { sessionId },
          }
        );

        updatePaymentMutation.mutate({ userId: user.id, sessionId });
      }
    }, 2000);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, planData, sessionId]);

  // Efeito para tratar erros
  useEffect(() => {
    if (planError) {
      logger.error("❌ Erro ao buscar dados do plano", {
        action: "plan_data_fetch_error",
        userId: user?.id,
        metadata: {
          error: planError.message,
          sessionId,
        },
      });

      setStatus("error");
      setMessage(
        "Erro ao verificar status do pagamento. Entre em contato com o suporte."
      );
    }
  }, [planError, user?.id, sessionId]);

  // Efeito para countdown e redirecionamento
  useEffect(() => {
    if (status !== "success") return;

    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      router.push("/dashboard");
    }
  }, [countdown, status, router]);

  const getStatusIcon = () => {
    if (isLoadingPlan || status === "loading") {
      return <Loader2 className="h-16 w-16 text-primary animate-spin" />;
    }

    switch (status) {
      case "success":
        return <Check className="h-16 w-16 text-green-600" />;
      case "error":
        return <XCircle className="h-16 w-16 text-red-600" />;
      default:
        return <Loader2 className="h-16 w-16 text-primary animate-spin" />;
    }
  };

  const getStatusTitle = () => {
    if (isLoadingPlan || status === "loading") {
      return "Processando pagamento";
    }

    switch (status) {
      case "success":
        return "Pagamento confirmado!";
      case "error":
        return "Erro no pagamento";
      default:
        return "Processando pagamento";
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center space-y-8 animate-in fade-in zoom-in duration-500">
        {/* Ícone Animado */}
        <div className="flex justify-center">
          <div className="relative">
            {status === "success" && (
              <div className="absolute inset-0 bg-green-500/20 rounded-full animate-ping" />
            )}
            <div
              className={`relative p-6 rounded-full ${
                status === "success"
                  ? "bg-green-500/10"
                  : status === "error"
                  ? "bg-red-500/10"
                  : "bg-primary/10"
              }`}
            >
              {getStatusIcon()}
            </div>
          </div>
        </div>

        {/* Mensagem */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">
            {getStatusTitle()}
          </h1>
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            {(status === "loading" || updatePaymentMutation.isPending) && (
              <Loader2 className="h-4 w-4 animate-spin" />
            )}
            <p className="text-sm">{message}</p>
          </div>
        </div>

        {/* Countdown */}
        {status === "success" && (
          <div className="space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <p className="text-sm text-muted-foreground">
              Redirecionando em{" "}
              <span className="font-bold text-primary text-lg">
                {countdown}
              </span>
            </p>
            <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-1000 ease-linear"
                style={{ width: `${((3 - countdown) / 3) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Botão de erro */}
        {status === "error" && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <Button
              onClick={() => router.push("/cadastrar")}
              className="w-full"
            >
              Tentar novamente
            </Button>
            <Button
              onClick={() => router.push("/dashboard")}
              variant="outline"
              className="w-full"
            >
              Ir para o dashboard
            </Button>
          </div>
        )}

        {/* Informações Adicionais */}
        {sessionId && (
          <p className="text-xs text-muted-foreground">
            ID da sessão: {sessionId.substring(0, 20)}...
          </p>
        )}

        {/* Debug info (apenas em dev) */}
        {process.env.NODE_ENV === "development" && planData && (
          <div className="mt-4 p-4 bg-muted rounded-lg text-left text-xs">
            <p>
              <strong>Plano:</strong> {planData.plan}
            </p>
            <p>
              <strong>Status:</strong> {planData.paymentStatus}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
