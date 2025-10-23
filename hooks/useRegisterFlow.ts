import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { z } from "zod";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { logger } from "@/lib/logger";

// Enums para steps
export enum RegisterStep {
  Dados = 1,
  ConfirmacaoEmail = 2,
  EscolhaPlano = 3,
  Pagamento = 4,
}

// Constantes dos planos
export const PLAN_PRICES = {
  monthly: 2000, // R$ 20,00
  annual: 18000, // R$ 180,00
  free: 0,
};

const createRegisterSchema = () =>
  z
    .object({
      name: z
        .string()
        .min(1, "O nome é obrigatório")
        .min(3, "O nome deve ter pelo menos 3 caracteres"),
      email: z.string().min(1, "O email é obrigatório").email("Email inválido"),
      password: z
        .string()
        .min(6, "A senha deve ter pelo menos 6 caracteres")
        .regex(/[A-Z]/, "A senha deve conter pelo menos uma letra maiúscula")
        .regex(/[a-z]/, "A senha deve conter pelo menos uma letra minúscula")
        .regex(/[0-9]/, "A senha deve conter pelo menos um número"),
      confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: "As senhas devem coincidir",
      path: ["confirmPassword"],
    });

export type RegisterFormValues = z.infer<ReturnType<typeof createRegisterSchema>>;

export function useRegisterFlow() {
  const { user, refreshUser } = useAuth();
  const router = useRouter();
  const supabase = createClient();
  
  const [step, setStep] = useState<RegisterStep>(RegisterStep.Dados);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [isEmailSending, setIsEmailSending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | undefined>(undefined);
  const [resendCountdown, setResendCountdown] = useState(0);
  const [autoEmailSent, setAutoEmailSent] = useState(false);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(createRegisterSchema()),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  // Função centralizada para verificar confirmação de email
  const checkEmailConfirmation = useCallback(async (userId: string) => {
    try {
      logger.info("Verificando confirmação de email", {
        action: "check_email_confirmation",
        userId,
      });

      const response = await fetch("/api/auth/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      const result = await response.json();

      if (!response.ok) {
        logger.error("Erro na confirmação de email", {
          action: "email_confirmation_failed",
          userId,
          metadata: { error: result.error, status: response.status },
        });
        return { success: false, error: result.error };
      }

      logger.info("Email confirmado com sucesso", {
        action: "email_confirmation_success",
        userId,
      });

      return { success: true, data: result };
    } catch (error) {
      logger.error("Erro ao verificar confirmação", {
        action: "email_confirmation_error",
        userId,
        metadata: {
          error: error instanceof Error ? error.message : "Erro desconhecido",
        },
      });
      return { success: false, error: "Erro interno" };
    }
  }, []);

  // Função para verificar plano do usuário
  const checkUserPlan = useCallback(async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token;

      if (!token) {
        toast.error("Usuário não autenticado. Faça login novamente.");
        return null;
      }

      const response = await fetch("/api/users/get-plan", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();
      return response.ok ? result : null;
    } catch (error) {
      logger.error("Erro ao verificar plano do usuário", {
        action: "check_user_plan_error",
        metadata: {
          error: error instanceof Error ? error.message : "Erro desconhecido",
        },
      });
      return null;
    }
  }, [supabase]);

  // Função para login automático
  const autoLogin = useCallback(
    async (email: string, password: string) => {
      try {
        logger.info("Tentando login automático", {
          action: "auto_login_started",
          metadata: { email: email.toLowerCase() },
        });

        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          logger.error("Erro no login automático", {
            action: "auto_login_error",
            metadata: {
              email: email.toLowerCase(),
              error: error.message,
            },
          });
          throw error;
        }

        logger.info("Login automático bem-sucedido", {
          action: "auto_login_success",
          metadata: { email: email.toLowerCase() },
        });

        return true;
      } catch (error) {
        logger.info("Login automático falhou (aguardando confirmação)", {
          action: "auto_login_failed",
          metadata: {
            email: email.toLowerCase(),
            error: error instanceof Error ? error.message : "Erro desconhecido",
          },
        });
        // Não mostrar erro - é esperado até o email ser confirmado
        return false;
      }
    },
    [supabase]
  );

  // Função para processar checkout automático
  const processAutoCheckout = useCallback(
    async (
      user: {
        id: string;
        user_metadata?: { name?: string };
        email?: string;
      },
      plan: string
    ) => {
      try {
        const amount = PLAN_PRICES[plan as keyof typeof PLAN_PRICES];

        if (!amount || !user.id || !user.user_metadata?.name || !user.email) {
          logger.error("Dados inválidos para checkout automático", {
            action: "auto_checkout_invalid_data",
            userId: user.id,
          });
          toast.error("Dados inválidos para checkout automático. Tente novamente.");
          return false;
        }

        const checkoutData = {
          plan,
        };

        logger.info("Processando checkout automático", {
          action: "auto_checkout_processing",
          userId: user.id,
          metadata: { plan, amount },
        });

        const response = await fetch("/api/stripe/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(checkoutData),
        });

        const result = await response.json();
        if (!response.ok)
          throw new Error(result.error || "Erro ao processar pagamento");

        window.location.href = result.url;
        return true;
      } catch (error) {
        logger.error("Erro no checkout automático", {
          action: "auto_checkout_error",
          metadata: {
            error: error instanceof Error ? error.message : "Erro desconhecido",
          },
        });
        toast.error("Erro ao processar pagamento. Tente novamente.");
        return false;
      }
    },
    []
  );

  // useEffect principal para gerenciar o fluxo de registro
  useEffect(() => {
    const handleUserFlow = async () => {
      // Log para debug (detalhado)
      logger.info("🔄 handleUserFlow executado", {
        action: "user_flow_check",
        metadata: { 
          hasUser: !!user,
          userId: user?.id,
          email: user?.email,
          step, 
          emailConfirmed: user?.email_confirmed_at ? true : false,
          emailConfirmedAt: user?.email_confirmed_at || null,
        }
      });

      // Se usuário está logado com email já confirmado no Step 1, ir para escolha de plano
      if (user && step === RegisterStep.Dados && user.email_confirmed_at) {
        logger.info("Usuário logado com email confirmado - avançando para plano", {
          action: "advance_to_plan_selection",
          userId: user.id,
        });
        setStep(RegisterStep.EscolhaPlano);
        return;
      }

      // Se está no step de confirmação e usuário está logado com email confirmado
      if (step === RegisterStep.ConfirmacaoEmail) {
        console.log("🚀 ~ handleUserFlow ~ user:", user)
        console.log("🚀 ~ handleUserFlow ~ user.email_confirmed_at:", user?.email_confirmed_at)

        if (user && user.email_confirmed_at) {
          logger.info("✅ Email confirmado - avançando para escolha de plano", {
            action: "advance_to_plan_selection_after_confirmation",
            userId: user.id,
            metadata: {
              email: user.email,
              currentStep: step,
            },
          });
          
          // Verificar plano do usuário
          const planResult = await checkUserPlan();

          if (
            planResult &&
            (planResult.plan === "monthly" || planResult.plan === "annual")
          ) {
            // Processar checkout automático para planos pagos
            const checkoutSuccess = await processAutoCheckout(user, planResult.plan);
            if (checkoutSuccess) return;
          }

          // Avançar para escolha de plano (usuário gratuito ou checkout falhou)
          setStep(RegisterStep.EscolhaPlano);
        } else {
          logger.info("Aguardando confirmação de email", {
            action: "waiting_email_confirmation",
            metadata: {
              hasUser: !!user,
              emailConfirmed: user?.email_confirmed_at ? true : false,
              currentStep: step,
            },
          });
        }
      }
    };

    handleUserFlow();
  }, [
    user,
    step,
    checkEmailConfirmation,
    checkUserPlan,
    processAutoCheckout,
    form,
    autoLogin,
  ]);

  // Detectar quando usuário volta da confirmação (sessão criada pelo callback)
  useEffect(() => {
    // Se está no step de confirmação e o usuário acabou de fazer login
    if (step === RegisterStep.ConfirmacaoEmail && user && user.email_confirmed_at) {
      logger.info("✅ Email confirmado! Usuário detectado", {
        action: "email_confirmed_user_detected",
        userId: user.id,
      });
      toast.success("Email confirmado com sucesso!");
      // O useEffect principal vai cuidar de avançar para o próximo step
    }
  }, [user, step]);

  // Detectar quando usuário volta para a aba (após confirmar email em outra aba)
  useEffect(() => {
    const handleVisibilityChange = async () => {
      // Se a aba ficou visível e estamos aguardando confirmação
      if (!document.hidden && step === RegisterStep.ConfirmacaoEmail) {
        logger.info("Aba voltou ao foco - verificando sessão", {
          action: "window_focus_check_session",
          metadata: { step },
        });

        // Forçar verificação da sessão
        const {
          data: { session },
        } = await supabase.auth.getSession();

        logger.info("Sessão verificada ao voltar foco", {
          action: "session_check_on_focus",
          metadata: {
            hasSession: !!session,
            hasUser: !!session?.user,
            emailConfirmed: session?.user?.email_confirmed_at ? true : false,
            email: session?.user?.email,
          },
        });

        if (session?.user?.email_confirmed_at) {
          logger.info("✅ Sessão confirmada detectada ao voltar foco", {
            action: "session_confirmed_on_focus",
            userId: session.user.id,
          });
          
          // Forçar atualização completa da sessão
          await refreshUser();
          
          // Avançar diretamente para Step 3 (não esperar useEffect)
          logger.info("🚀 Forçando avanço para Step 3", {
            action: "force_advance_to_step3",
            userId: session.user.id,
          });
          
          setStep(RegisterStep.EscolhaPlano);
        } else {
          logger.warn("⚠️ Sessão existe mas email ainda não confirmado", {
            action: "session_not_confirmed_on_focus",
            metadata: {
              hasSession: !!session,
              userId: session?.user?.id,
            },
          });
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleVisibilityChange);
    };
  }, [step, supabase, refreshUser]);

  // Remover autoLogin - o callback do Supabase já cria a sessão automaticamente

  // Redirecionar para dashboard apenas se usuário já completou TODO o fluxo
  useEffect(() => {
    const checkAndRedirect = async () => {
      // Se está no Step 1 com usuário autenticado e email confirmado
      if (user && step === RegisterStep.Dados && user.email_confirmed_at) {
        // Verificar se usuário já tem um plano escolhido (completou cadastro)
        const planResult = await checkUserPlan();
        
        if (planResult && planResult.plan && planResult.plan !== "free") {
          // Usuário já completou o cadastro e tem plano pago
          logger.warn("Usuário já completou cadastro - redirecionando para dashboard", {
            action: "redirect_completed_user",
            userId: user.id,
            metadata: { plan: planResult.plan }
          });
          router.replace("/dashboard");
        } else {
          // Usuário está logado mas ainda não escolheu plano
          // Deixa continuar o fluxo para Step 3
          logger.info("Usuário autenticado mas sem plano - continuando fluxo", {
            action: "continue_registration_flow",
            userId: user.id,
          });
          setStep(RegisterStep.EscolhaPlano);
        }
      }
    };
    
    checkAndRedirect();
  }, [user, step, router, checkUserPlan]);

  const updateUserPlan = useCallback(
    async (plan: string) => {
      try {
        logger.info("🔄 updateUserPlan - Iniciando (SIMPLIFICADO)", {
          action: "update_plan_start",
          metadata: { plan },
        });

        logger.info("📡 Chamando API /api/users/update-plan (sem verificar token no frontend)", {
          action: "update_plan_api_call_direct",
          metadata: { plan },
        });

        // Chamar API diretamente (sem verificar token aqui)
        // O backend vai verificar autenticação usando cookies
        const response = await fetch("/api/users/update-plan", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ plan }),
        });

        const result = await response.json();

        logger.info("📥 Resposta da API recebida", {
          action: "update_plan_api_response",
          metadata: {
            ok: response.ok,
            status: response.status,
            result,
          },
        });

        if (!response.ok) {
          logger.error("❌ API retornou erro", {
            action: "update_plan_api_error",
            metadata: {
              status: response.status,
              error: result.error,
            },
          });
          
          if (response.status === 401) {
            toast.error("Sessão expirou. Faça login novamente.");
          } else {
            toast.error(result.error || "Erro ao atualizar plano. Tente novamente.");
          }
          return false;
        }

        logger.info("✅ Plano atualizado na API com sucesso", {
          action: "update_plan_api_success",
          metadata: { success: result.success },
        });

        return result.success;
      } catch (error) {
        logger.error("❌ Exceção ao atualizar plano", {
          action: "update_plan_exception",
          metadata: {
            error: error instanceof Error ? error.message : "Unknown error",
          },
        });
        console.error(error);
        toast.error("Erro ao atualizar plano. Tente novamente.");
        return false;
      }
    },
    []
  );

  const generateCheckoutSession = useCallback(async () => {
    try {
      logger.info("💳 generateCheckoutSession - INICIANDO", {
        action: "generate_checkout_start",
        metadata: { selectedPlan },
      });

      // Não precisamos verificar user - a API vai verificar via cookies
      // Isso evita o problema de getUser() travar

      let currentPlan = selectedPlan;
      if (
        currentPlan !== "monthly" &&
        currentPlan !== "annual" &&
        currentPlan !== "free"
      ) {
        currentPlan = "free";
      }

      logger.info("📋 Plano validado", {
        action: "generate_checkout_plan_validated",
        metadata: { plan: currentPlan },
      });

      if (currentPlan === "free") {
        logger.info("✅ Plano FREE - indo para dashboard", {
          action: "generate_checkout_free_redirect",
        });
        toast.success("Cadastro concluído!");
        router.push("/dashboard");
        return;
      }

      const checkoutData = {
        plan: currentPlan,
      };

      logger.info("📡 Chamando API /api/stripe/checkout", {
        action: "generate_checkout_api_call",
        metadata: { plan: currentPlan },
      });

      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(checkoutData),
      });

      logger.info("📥 Resposta da API Stripe recebida", {
        action: "generate_checkout_api_response",
        metadata: {
          ok: response.ok,
          status: response.status,
        },
      });

      const result = await response.json();

      logger.info("📄 Resultado parseado", {
        action: "generate_checkout_result_parsed",
        metadata: {
          hasUrl: !!result.url,
          hasError: !!result.error,
        },
      });

      if (!response.ok) {
        logger.error("❌ API Stripe retornou erro", {
          action: "generate_checkout_api_error",
          metadata: {
            status: response.status,
            error: result.error,
          },
        });
        throw new Error(result.error || "Erro ao gerar checkout");
      }

      logger.info("🚀 Redirecionando para Stripe", {
        action: "generate_checkout_redirecting",
        metadata: { url: result.url },
      });

      window.location.href = result.url;
    } catch (err) {
      logger.error("❌ Erro ao gerar checkout", {
        action: "generate_checkout_error",
        metadata: {
          error: err instanceof Error ? err.message : "Unknown error",
        },
      });
      toast.error(
        err instanceof Error
          ? err.message
          : "Erro ao gerar checkout. Tente novamente."
      );
    }
  }, [selectedPlan, router]);

  // Gerar Checkout quando Step 4 for carregado
  useEffect(() => {
    logger.info("🔄 useEffect [step] - Verificando Step 4", {
      action: "check_step4",
      metadata: {
        step,
        stepName: step === 1 ? "Dados" : step === 2 ? "Email" : step === 3 ? "Plano" : step === 4 ? "Pagamento" : "Unknown",
        selectedPlan,
        isPagamento: step === RegisterStep.Pagamento,
        hasPlan: !!selectedPlan,
        notFree: selectedPlan !== "free",
      },
    });

    if (step === RegisterStep.Pagamento && selectedPlan && selectedPlan !== "free") {
      logger.info("✅ Step 4 detectado - Gerando checkout", {
        action: "step4_generate_checkout",
        metadata: { plan: selectedPlan },
      });
      generateCheckoutSession();
    } else if (step === RegisterStep.Pagamento && selectedPlan === "free") {
      logger.info("✅ Step 4 com plano FREE - Redirecionando para dashboard", {
        action: "step4_free_plan_redirect",
      });
      toast.success("Cadastro concluído!");
      router.push("/dashboard");
    }
  }, [step, selectedPlan, generateCheckoutSession, router]);

  const onSubmit = async () => {
    if (step === RegisterStep.Pagamento) {
      return;
    }
  };

  const handleNextStep = async () => {
    let fieldsToValidate: (keyof RegisterFormValues)[] = [];
    
    if (step === RegisterStep.Dados) {
      fieldsToValidate = ["name", "email", "password", "confirmPassword"];
      
      const isValid = await form.trigger(fieldsToValidate);
      
      if (isValid) {
        logger.info("Validação do Step 1 passou - avançando para Step 2", {
          action: "step1_validated",
          metadata: { email: form.getValues("email") }
        });
        setStep(RegisterStep.ConfirmacaoEmail);
      } else {
        const formErrors = form.formState.errors;
        const errorMessages = Object.values(formErrors)
          .map((error) => error?.message)
          .filter(Boolean);
        if (errorMessages.length > 0) {
          toast.error(
            errorMessages[0] || "Por favor, preencha todos os campos obrigatórios"
          );
        }
      }
      return;
    }
    
    if (step === RegisterStep.EscolhaPlano) {
      logger.info("🎯 Step 3: Tentando avançar para pagamento", {
        action: "step3_advance_attempt",
        metadata: { selectedPlan },
      });

      if (!selectedPlan) {
        logger.warn("❌ Nenhum plano selecionado", {
          action: "step3_no_plan_selected",
        });
        toast.error("Por favor, selecione um plano");
        return;
      }

      logger.info("📝 Atualizando plano do usuário", {
        action: "step3_updating_plan",
        metadata: { plan: selectedPlan },
      });

      const planUpdated = await updateUserPlan(selectedPlan);

      if (!planUpdated) {
        logger.error("❌ Falha ao atualizar plano", {
          action: "step3_update_plan_failed",
          metadata: { plan: selectedPlan },
        });
        toast.error("Erro ao atualizar plano. Tente novamente.");
        return;
      }

      logger.info("✅ Plano atualizado com sucesso - Avançando para Step 4", {
        action: "step3_plan_updated_success",
        metadata: { plan: selectedPlan },
      });

      // Se FREE, vai direto pro dashboard
      if (selectedPlan === "free") {
        logger.info("✅ Plano FREE - Redirecionando para dashboard", {
          action: "step3_free_redirect",
        });
        toast.success("Cadastro concluído!");
        router.push("/dashboard");
        return;
      }

      // Se PAGO, gerar checkout diretamente (não esperar useEffect)
      logger.info("💳 Plano pago - Gerando checkout IMEDIATAMENTE", {
        action: "step3_generating_checkout_directly",
        metadata: { plan: selectedPlan },
      });

      setStep(RegisterStep.Pagamento);
      
      // Gerar checkout sem esperar useEffect
      await generateCheckoutSession();
      
      return;
    }
  };

  const resendConfirmationEmail = async () => {
    try {
      const email = form.getValues("email");

      logger.info("Reenviando email de confirmação (frontend)", {
        action: "resend_confirmation_email_frontend",
        metadata: { email: email.toLowerCase() },
      });

      const { error } = await supabase.auth.resend({
        type: "signup",
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        logger.error("Erro ao reenviar email de confirmação (frontend)", {
          action: "resend_confirmation_email_error_frontend",
          metadata: {
            email: email.toLowerCase(),
            error: error.message,
          },
        });
        throw error;
      }

      logger.info("Email de confirmação reenviado com sucesso (frontend)", {
        action: "resend_confirmation_email_success_frontend",
        metadata: { email: email.toLowerCase() },
      });

      toast.success("Email de confirmação reenviado. Verifique sua caixa de entrada.");
      setResendCountdown(13);
    } catch (error) {
      logger.error("Erro ao reenviar email de confirmação (frontend)", {
        action: "resend_confirmation_email_failed_frontend",
        metadata: {
          email: form.getValues("email").toLowerCase(),
          error: error instanceof Error ? error.message : "Erro desconhecido",
        },
      });
      toast.error("Erro ao reenviar email de confirmação. Tente novamente.");
    }
  };

  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCountdown]);

  const handleEmailConfirmation = useCallback(async () => {
    try {
      setIsEmailSending(true);
      const formData = form.getValues();

      logger.info("Iniciando processo de registro (frontend signUp)", {
        action: "register_started_frontend",
        metadata: { email: formData.email.toLowerCase() },
      });

      // Usar signUp do cliente (frontend) para gerar link PKCE correto
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.name,
            selectedPlan: "free",
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        logger.error("Erro ao criar usuário no Auth (frontend)", {
          action: "register_auth_error_frontend",
          metadata: {
            error: error.message,
            email: formData.email.toLowerCase(),
          },
        });

        if (error.message.includes('User already registered') || error.message.includes('already registered')) {
          logger.warn("Tentativa de registro com email já existente", {
            action: "register_duplicate_email_attempt",
            metadata: { email: formData.email.toLowerCase() },
          });
          toast.error(
            "Este email já está cadastrado. Tente outro email ou faça login."
          );
          setStep(RegisterStep.Dados);
          return;
        }

        throw error;
      }

      if (!data.user) {
        logger.error("Usuário não foi criado (frontend)", {
          action: "register_user_creation_failed_frontend",
        });
        throw new Error("Falha ao criar usuário");
      }

      // Se não há sessão, significa que precisa confirmar email
      if (data.user && !data.session) {
        logger.info("Registro bem-sucedido - confirmação de email necessária (frontend)", {
          action: "register_email_confirmation_required_frontend",
          metadata: { email: formData.email.toLowerCase(), userId: data.user.id },
        });
        setIsEmailSent(true);
        return;
      }

      // Se já tem sessão (email auto-confirmado), criar usuário na tabela users
      if (data.session) {
        logger.info("Registro concluído - email já confirmado (frontend)", {
          action: "register_auto_confirmed_frontend",
          metadata: { email: formData.email.toLowerCase(), userId: data.user.id },
        });

        await fetch("/api/auth/confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: data.user.id }),
        });

        setStep(RegisterStep.EscolhaPlano);
      }
    } catch (error) {
      logger.error("Erro ao registrar usuário (frontend)", {
        action: "register_error_frontend",
        metadata: {
          error: error instanceof Error ? error.message : "Erro desconhecido",
        },
      });
      toast.error(
        error instanceof Error
          ? error.message
          : "Erro ao enviar email de confirmação. Tente novamente."
      );
    } finally {
      setIsEmailSending(false);
    }
  }, [form, supabase]);

  // Enviar email automaticamente quando entrar no step de confirmação
  useEffect(() => {
    if (
      step === RegisterStep.ConfirmacaoEmail &&
      !isEmailSent &&
      !isEmailSending &&
      !autoEmailSent
    ) {
      setAutoEmailSent(true);
      handleEmailConfirmation();
    }
    if (step !== RegisterStep.ConfirmacaoEmail && autoEmailSent) {
      setAutoEmailSent(false);
    }
  }, [step, isEmailSent, isEmailSending, autoEmailSent, handleEmailConfirmation]);

  const handleBackToRegister = () => {
    setStep(RegisterStep.Dados);
    setIsEmailSent(false);
    setAutoEmailSent(false);
  };

  return {
    step,
    setStep,
    RegisterStep,
    form,
    isEmailSent,
    isEmailSending,
    isConfirming: false,
    showPassword,
    setShowPassword,
    selectedPlan,
    setSelectedPlan,
    resendCountdown,
    handleNextStep,
    resendConfirmationEmail,
    handleEmailConfirmation,
    handleBackToRegister,
    onSubmit,
  };
}

