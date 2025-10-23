"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginFormValues } from "@/lib/security";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Scale,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { logger } from "@/lib/logger";

// Hook customizado para login
import { useAuth } from "@/hooks/useAuth";

function useLogin() {
  const [showPassword, setShowPassword] = useState(false);
  const [lastAttempt, setLastAttempt] = useState(0);
  const router = useRouter();
  const { refreshSession } = useAuth();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    // Rate limiting frontend (1 segundo)
    const now = Date.now();
    if (now - lastAttempt < 1000) {
      form.setError("root", {
        message: "Aguarde um momento antes de tentar novamente",
      });
      return;
    }

    setLastAttempt(now);

    try {
      logger.info("Tentativa de login", {
        action: "login_attempt",
        metadata: { email: data.email },
      });

      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const responseData = await res.json();

      if (!res.ok) {
        throw new Error(responseData.error || "Erro ao fazer login");
      }

      logger.info("Login bem-sucedido", {
        action: "login_success",
        metadata: { email: data.email, role: responseData.user?.role },
      });

      // Forçar refresh da sessão no cliente
      await refreshSession();

      // Redirecionar baseado no role
      const role = responseData.user?.role || "user";
      const redirectUrl = role === "admin" ? "/admin/usuarios" : "/dashboard";

      router.push(redirectUrl);
      router.refresh();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Erro ao fazer login";

      logger.error("Erro no login", {
        action: "login_error",
        metadata: { email: data.email, error: errorMessage },
      });

      form.setError("root", { message: errorMessage });
    }
  };

  return {
    form,
    showPassword,
    setShowPassword,
    onSubmit: form.handleSubmit(onSubmit),
    isLoading: form.formState.isSubmitting,
    rootError: form.formState.errors.root?.message,
  };
}

export default function EntrarPage() {
  const {
    form,
    showPassword,
    setShowPassword,
    onSubmit,
    isLoading,
    rootError,
  } = useLogin();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Logo/Header */}
        <header className="text-center">
          <Link
            href="/"
            className="inline-block mb-4 focus:outline-none focus:ring-2 focus:ring-primary rounded-lg"
          >
            <div className="flex items-center justify-center gap-3">
              <div className="p-3 bg-primary/10 rounded-md">
                <Scale className="h-8 w-8 text-foreground" aria-hidden="true" />
              </div>
              <h1 className="text-2xl font-semibold">DataJud CNJ</h1>
            </div>
          </Link>
          <h2 className="text-2xl font-semibold mt-4">Entrar</h2>
          <p className="text-sm text-muted-foreground mt-2">
            Faça login para acessar sua conta
          </p>
        </header>

        {/* Error Alert */}
        {rootError && (
          <Alert
            variant="destructive"
            className="animate-in fade-in slide-in-from-top-2 duration-300"
          >
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{rootError}</AlertDescription>
          </Alert>
        )}

        {/* Form */}
        <form onSubmit={onSubmit} className="space-y-6" noValidate>
          {/* Email Field */}
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="text-sm font-medium text-foreground"
            >
              Email
            </label>
            <div className="relative">
              <Mail
                className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none"
                aria-hidden="true"
              />
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                autoComplete="email"
                {...form.register("email")}
                disabled={isLoading}
                className="pl-10"
                aria-invalid={!!form.formState.errors.email}
                aria-describedby={
                  form.formState.errors.email ? "email-error" : undefined
                }
              />
            </div>
            {form.formState.errors.email && (
              <p
                id="email-error"
                className="text-sm text-destructive animate-in fade-in slide-in-from-top-1 duration-200"
                role="alert"
              >
                {form.formState.errors.email.message}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <label
              htmlFor="password"
              className="text-sm font-medium text-foreground"
            >
              Senha
            </label>
            <div className="relative">
              <Lock
                className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none"
                aria-hidden="true"
              />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                autoComplete="current-password"
                {...form.register("password")}
                disabled={isLoading}
                className="pl-10 pr-10"
                aria-invalid={!!form.formState.errors.password}
                aria-describedby={
                  form.formState.errors.password ? "password-error" : undefined
                }
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                tabIndex={0}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Eye className="h-4 w-4" aria-hidden="true" />
                )}
              </button>
            </div>
            {form.formState.errors.password && (
              <p
                id="password-error"
                className="text-sm text-destructive animate-in fade-in slide-in-from-top-1 duration-200"
                role="alert"
              >
                {form.formState.errors.password.message}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 text-base"
          >
            {isLoading ? (
              <>
                <Loader2
                  className="mr-2 h-4 w-4 animate-spin"
                  aria-hidden="true"
                />
                Entrando...
              </>
            ) : (
              "Entrar"
            )}
          </Button>

          {/* Footer Links */}
          <div className="space-y-3 text-center">
            <p className="text-sm text-muted-foreground">
              Não tem conta?{" "}
              <Link
                href="/cadastrar"
                className="font-medium text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary rounded"
                tabIndex={0}
              >
                Cadastrar-se
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
