import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import {
  authRateLimiter,
  loginSchema,
  securityMiddleware,
  ERROR_MESSAGES,
} from "@/lib/security";
import { logger } from "@/lib/logger";

export async function POST(req: Request) {
  try {
    // Rate limiting
    await securityMiddleware.rateLimit(authRateLimiter)(req);

    // Parse e validar dados
    const body = await req.json();
    const sanitizedData = securityMiddleware.sanitizeData(body);

    const validation = loginSchema.safeParse(sanitizedData);

    if (!validation.success) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.INVALID_DATA },
        { status: 400 }
      );
    }

    const { email, password } = validation.data;

    // Autenticar via Supabase
    const supabase = await createClient();
    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      logger.warn("Falha no login", {
        action: "login_failed",
        metadata: {
          emailDomain: securityMiddleware.getEmailDomain(email),
          error: authError.message,
        },
      });

      if (authError.message.includes("Email not confirmed")) {
        return NextResponse.json(
          { error: ERROR_MESSAGES.EMAIL_NOT_CONFIRMED },
          { status: 401 }
        );
      }

      return NextResponse.json(
        { error: ERROR_MESSAGES.INVALID_CREDENTIALS },
        { status: 401 }
      );
    }

    // Buscar dados do usuário no banco
    if (data.user && data.user.email_confirmed_at) {
      const { data: existingUser } = await supabaseAdmin
        .from("users")
        .select("id, role, selected_plan")
        .eq("auth_user_id", data.user.id)
        .maybeSingle();

      if (!existingUser) {
        logger.error("Usuário não encontrado na tabela users", {
          action: "login_user_not_found_in_table",
          userId: data.user.id,
        });

        return NextResponse.json(
          { error: "Usuário não encontrado. Entre em contato com o suporte." },
          { status: 404 }
        );
      }

      logger.info("Login bem-sucedido", {
        action: "login_success",
        userId: data.user.id,
        metadata: {
          emailDomain: securityMiddleware.getEmailDomain(email),
          role: existingUser.role,
        },
      });

      return NextResponse.json({
        session: data.session,
        user: {
          ...data.user,
          role: existingUser.role,
          selectedPlan: existingUser.selected_plan,
        },
      });
    }

    return NextResponse.json({ session: data.session, user: data.user });
  } catch (error) {
    logger.error("Erro inesperado no login", {
      action: "login_unexpected_error",
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


