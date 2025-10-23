"use client";

import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { PasswordStrengthIndicator } from "./PasswordStrengthIndicator";
import { useMemo } from "react";

export interface RegisterFormValues {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface Step1DadosPessoaisProps {
  form: UseFormReturn<RegisterFormValues>;
  isSubmitting: boolean;
  showPassword: boolean;
  setShowPassword: React.Dispatch<React.SetStateAction<boolean>>;
}

export function Step1DadosPessoais({
  form,
  isSubmitting,
  showPassword,
  setShowPassword,
}: Step1DadosPessoaisProps) {
  const password = form.watch("password");
  const confirmPassword = form.watch("confirmPassword");

  const passwordCriteria = useMemo(
    () => [
      {
        label: "Mínimo 6 caracteres",
        valid: password?.length >= 6,
      },
      {
        label: "Pelo menos 1 letra maiúscula",
        valid: /[A-Z]/.test(password || ""),
      },
      {
        label: "Pelo menos 1 letra minúscula",
        valid: /[a-z]/.test(password || ""),
      },
      {
        label: "Pelo menos 1 número",
        valid: /[0-9]/.test(password || ""),
      },
      {
        label: "Senhas coincidem",
        valid: password === confirmPassword && password?.length > 0,
      },
    ],
    [password, confirmPassword]
  );

  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nome completo *</FormLabel>
            <FormControl>
              <Input
                type="text"
                placeholder="Digite seu nome"
                autoFocus
                autoComplete="name"
                aria-label="Nome"
                {...field}
                disabled={isSubmitting}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Email *</FormLabel>
            <FormControl>
              <Input
                type="email"
                placeholder="seu@email.com"
                autoComplete="email"
                aria-label="Email"
                {...field}
                disabled={isSubmitting}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="password"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Senha *</FormLabel>
            <FormControl>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  aria-label="Senha"
                  {...field}
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </FormControl>
            {password && <PasswordStrengthIndicator password={password} />}
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="confirmPassword"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Confirmar senha *</FormLabel>
            <FormControl>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  aria-label="Confirmar senha"
                  {...field}
                  disabled={isSubmitting}
                />
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
