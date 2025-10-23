"use client";

import { Button } from "@/components/ui/button";
import { RegisterHeader } from "./components/RegisterHeader";
import { ProgressBar } from "./components/ProgressBar";
import { Step1DadosPessoais } from "./components/Step1DadosPessoais";
import { EmailConfirmationStep } from "./components/EmailConfirmationStep";
import { Step3EscolhaPlano } from "./components/Step3EscolhaPlano";
import { useRegisterFlow } from "@/hooks/useRegisterFlow";
import { Loader2 } from "lucide-react";
import { Form } from "@/components/ui/form";
import { motion, AnimatePresence } from "framer-motion";

export default function CadastrarPage() {
  const {
    step,
    RegisterStep,
    form,
    isEmailSent,
    isEmailSending,
    showPassword,
    setShowPassword,
    selectedPlan,
    setSelectedPlan,
    resendCountdown,
    handleNextStep,
    resendConfirmationEmail,
    handleBackToRegister,
    onSubmit,
  } = useRegisterFlow();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <RegisterHeader />

        <ProgressBar currentStep={step} totalSteps={4} />

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <AnimatePresence mode="wait" initial={false}>
              {step === RegisterStep.Dados && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -40 }}
                  transition={{ duration: 0.3 }}
                >
                  <Step1DadosPessoais
                    form={form}
                    isSubmitting={form.formState.isSubmitting}
                    showPassword={showPassword}
                    setShowPassword={setShowPassword}
                  />
                </motion.div>
              )}

              {step === RegisterStep.ConfirmacaoEmail && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -40 }}
                  transition={{ duration: 0.3 }}
                >
                  <EmailConfirmationStep
                    isEmailSending={isEmailSending}
                    isEmailSent={isEmailSent}
                    email={form.getValues("email")}
                    resendCountdown={resendCountdown}
                    onResendEmail={resendConfirmationEmail}
                    onBackToRegister={handleBackToRegister}
                  />
                </motion.div>
              )}

              {step === RegisterStep.EscolhaPlano && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -40 }}
                  transition={{ duration: 0.3 }}
                >
                  <Step3EscolhaPlano
                    selectedPlan={selectedPlan || ""}
                    setSelectedPlan={setSelectedPlan}
                  />
                </motion.div>
              )}

              {step === RegisterStep.Pagamento && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -40 }}
                  transition={{ duration: 0.3 }}
                  className="text-center space-y-4"
                >
                  <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
                  <p className="text-lg font-medium">
                    Redirecionando para pagamento...
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Você será redirecionado para o Stripe
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-2 mt-4">
              {step === RegisterStep.Dados && (
                <Button
                  className="w-full py-6"
                  type="button"
                  onClick={handleNextStep}
                  disabled={form.formState.isSubmitting}
                >
                  Continuar
                </Button>
              )}
              {step === RegisterStep.EscolhaPlano && (
                <Button
                  className="w-full py-6"
                  type="button"
                  onClick={handleNextStep}
                  disabled={form.formState.isSubmitting || !selectedPlan}
                >
                  Continuar
                </Button>
              )}
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
