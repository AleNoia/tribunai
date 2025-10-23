import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { createClient } from "@supabase/supabase-js";
import {
  apiRateLimiter,
  registerSchema,
  securityMiddleware,
  ERROR_MESSAGES,
} from "@/lib/security";
import { logger } from "@/lib/logger";

export async function POST(req: Request) {
  try {
    // Rate limiting
    const rateLimitResult = await securityMiddleware.rateLimit(
      apiRateLimiter
    )(req);

    // Parse e validar dados
    const body = await req.json();
    const sanitizedData = securityMiddleware.sanitizeData(body);

    const validation = registerSchema.safeParse(sanitizedData);

    if (!validation.success) {
      logger.warn("Validação falhou no registro", {
        action: "register_validation_failed",
        metadata: { errors: validation.error.errors },
      });

      return NextResponse.json(
        { error: ERROR_MESSAGES.INVALID_DATA, details: validation.error.errors },
        { status: 400 }
      );
    }

    const { name, email, password, selectedPlan } = validation.data;

    // Verificar se email já existe
    const { data: existingUser } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (existingUser) {
      logger.warn("Tentativa de registro com email duplicado", {
        action: "register_duplicate_email",
        metadata: {
          emailDomain: securityMiddleware.getEmailDomain(email),
        },
      });

      return NextResponse.json(
        { error: ERROR_MESSAGES.DUPLICATE_EMAIL },
        { status: 409 }
      );
    }

    // Criar usuário usando signUp (envia email automaticamente)
    // Usar cliente anônimo em vez de admin para que o Supabase envie o email
    const supabaseClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data: authData, error: authError } = await supabaseClient.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          selectedPlan: selectedPlan || "free",
        },
        // IMPORTANTE: Usar a URL completa com protocolo
        emailRedirectTo: `http://localhost:3000/auth/callback`,
      },
    });

    if (authError) {
      logger.error("Erro ao criar usuário no Auth", {
        action: "register_auth_error",
        metadata: {
          error: authError.message,
          emailDomain: securityMiddleware.getEmailDomain(email),
        },
      });

      // Mapear erros específicos do Supabase
      if (authError.message.includes('User already registered')) {
        return NextResponse.json(
          { error: "Este email já está cadastrado" },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { error: ERROR_MESSAGES.INTERNAL_ERROR },
        { status: 500 }
      );
    }

    if (!authData.user) {
      logger.error("Usuário não foi criado", {
        action: "register_user_creation_failed",
      });
      return NextResponse.json(
        { error: ERROR_MESSAGES.INTERNAL_ERROR },
        { status: 500 }
      );
    }

    // Se não há sessão, significa que precisa confirmar email
    if (authData.user && !authData.session) {
      logger.info("Usuário registrado - confirmação de email necessária", {
        action: "register_email_confirmation_required",
        userId: authData.user.id,
        metadata: { email: email.toLowerCase() },
      });
      
      return NextResponse.json(
        {
          message: "Email confirmation required",
          userId: authData.user.id,
        },
        { status: 201 }
      );
    }
    
    logger.info("Usuário registrado com sucesso (email enviado automaticamente)", {
      action: "register_success",
      userId: authData.user.id,
      metadata: {
        emailDomain: securityMiddleware.getEmailDomain(email),
        plan: selectedPlan || "free",
      },
    });

    return NextResponse.json(
      {
        message: "Email confirmation required",
        userId: authData.user.id,
      },
      { status: 201 }
    );
  } catch (error) {
    logger.error("Erro inesperado no registro", {
      action: "register_unexpected_error",
      metadata: { error: error instanceof Error ? error.message : "Unknown error" },
    });

    return NextResponse.json(
      { error: ERROR_MESSAGES.INTERNAL_ERROR },
      { status: 500 }
    );
  }
}


