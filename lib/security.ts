import { z } from "zod";

// Rate Limiter com cleanup automático
class RateLimiter {
  private attempts: Map<string, { count: number; resetTime: number }> =
    new Map();
  public config: { windowMs: number; maxAttempts: number };

  constructor(config: { windowMs: number; maxAttempts: number }) {
    this.config = config;
  }

  async checkLimit(
    req: Request
  ): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
    const ip = this.getClientIP(req);
    const now = Date.now();

    this.cleanup();

    const clientAttempts = this.attempts.get(ip);

    if (!clientAttempts || clientAttempts.resetTime < now) {
      this.attempts.set(ip, {
        count: 1,
        resetTime: now + this.config.windowMs,
      });
      return {
        allowed: true,
        remaining: this.config.maxAttempts - 1,
        resetTime: now + this.config.windowMs,
      };
    }

    if (clientAttempts.count >= this.config.maxAttempts) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: clientAttempts.resetTime,
      };
    }

    clientAttempts.count++;
    return {
      allowed: true,
      remaining: this.config.maxAttempts - clientAttempts.count,
      resetTime: clientAttempts.resetTime,
    };
  }

  private getClientIP(req: Request): string {
    return (
      req.headers.get("x-forwarded-for") ||
      req.headers.get("x-real-ip") ||
      "unknown"
    );
  }

  cleanup(): void {
    const now = Date.now();
    for (const [ip, data] of this.attempts.entries()) {
      if (data.resetTime < now) {
        this.attempts.delete(ip);
      }
    }
  }
}

// Configurações de Rate Limiting
export const apiRateLimiter = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutos
  maxAttempts: 100,
});

export const authRateLimiter = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutos
  maxAttempts: 5, // Máximo de 5 tentativas de login em 15 minutos
});

// Schemas de Validação
export const loginSchema = z.object({
  email: z.string().min(1, "Email é obrigatório").email("Email inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().min(1, "Email é obrigatório").email("Email inválido"),
  password: z
    .string()
    .min(6, "Senha deve ter pelo menos 6 caracteres")
    .regex(/[A-Z]/, "A senha deve conter pelo menos uma letra maiúscula")
    .regex(/[a-z]/, "A senha deve conter pelo menos uma letra minúscula")
    .regex(/[0-9]/, "A senha deve conter pelo menos um número"),
  confirmPassword: z.string().min(6, "Confirmação de senha é obrigatória"),
  selectedPlan: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

export const planSchema = z.object({
  plan: z.enum(["free", "monthly", "annual"]),
});

// Mensagens de erro padronizadas
export const ERROR_MESSAGES = {
  INVALID_CREDENTIALS: "Email ou senha incorretos",
  EMAIL_NOT_CONFIRMED: "Email não confirmado. Verifique sua caixa de entrada",
  RATE_LIMIT: "Muitas tentativas. Tente novamente em 15 minutos",
  INVALID_DATA: "Dados inválidos",
  INTERNAL_ERROR: "Erro interno do servidor",
  DUPLICATE_EMAIL: "Este email já está cadastrado",
  USER_NOT_FOUND: "Usuário não encontrado",
  WEAK_PASSWORD: "Senha fraca. Use letras maiúsculas, minúsculas e números",
};

// Middleware de Segurança
export const securityMiddleware = {
  rateLimit: (limiter: RateLimiter) => async (req: Request) => {
    const result = await limiter.checkLimit(req);
    if (!result.allowed) {
      const resetIn = Math.ceil((result.resetTime - Date.now()) / 1000 / 60);
      throw new Error(
        `Rate limit excedido. Tente novamente em ${resetIn} minutos`
      );
    }
    return result;
  },

  sanitizeData: (data: Record<string, unknown>): Record<string, unknown> => {
    const sanitized: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(data)) {
      if (typeof value === "string") {
        sanitized[key] = value.replace(/[<>]/g, "").trim();
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  },

  getEmailDomain: (email: string): string => {
    return email.split("@")[1] || "unknown";
  },
};

// Tipos
export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
export type PlanFormValues = z.infer<typeof planSchema>;


