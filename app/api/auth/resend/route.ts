import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/client";
import { authRateLimiter, securityMiddleware, ERROR_MESSAGES } from "@/lib/security";
import { logger } from "@/lib/logger";
import { z } from "zod";

const resendSchema = z.object({
  email: z.string().email("Email inválido"),
});

export async function POST(req: Request) {
  try {
    // Rate limiting
    await securityMiddleware.rateLimit(authRateLimiter)(req);

    const body = await req.json();
    const validation = resendSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.INVALID_DATA },
        { status: 400 }
      );
    }

    const { email } = validation.data;
    const supabase = createClient();

    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
      options: {
        // IMPORTANTE: Usar a URL completa com protocolo
        emailRedirectTo: `http://localhost:3000/auth/callback`,
      },
    });

    if (error) {
      logger.warn("Erro ao reenviar email de confirmação", {
        action: "resend_error",
        metadata: {
          emailDomain: securityMiddleware.getEmailDomain(email),
          error: error.message,
        },
      });

      return NextResponse.json(
        { error: "Erro ao reenviar email" },
        { status: 500 }
      );
    }

    logger.info("Email de confirmação reenviado", {
      action: "resend_success",
      metadata: {
        emailDomain: securityMiddleware.getEmailDomain(email),
      },
    });

    return NextResponse.json({ message: "Email reenviado com sucesso" });
  } catch (error) {
    logger.error("Erro inesperado ao reenviar email", {
      action: "resend_unexpected_error",
      metadata: { error: error instanceof Error ? error.message : "Unknown error" },
    });

    if (error instanceof Error && error.message.includes("Rate limit")) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.RATE_LIMIT },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: ERROR_MESSAGES.INTERNAL_ERROR },
      { status: 500 }
    );
  }
}


