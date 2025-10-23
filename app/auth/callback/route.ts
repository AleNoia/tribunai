import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { logger } from "@/lib/logger";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  // Após confirmação de email, redirecionar para página de sucesso
  const next = searchParams.get("next") ?? "/email-confirmado";

  logger.info("Callback de autenticação chamado", {
    action: "auth_callback_called",
    metadata: { hasCode: !!code, hasTokenHash: !!token_hash, type, next },
  });

  const supabase = await createClient();

  // Cenário 1: Callback com CODE (PKCE flow)
  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error && data.session) {
      logger.info("✅ Sessão criada com sucesso no callback (PKCE)", {
        action: "auth_callback_session_created",
        userId: data.user?.id,
        metadata: {
          email: data.user?.email,
          emailConfirmed: !!data.user?.email_confirmed_at,
        },
      });

      // Criar usuário na tabela users se email foi confirmado
      if (data.user?.id && data.user?.email_confirmed_at) {
        try {
          logger.info("📝 Criando usuário na tabela users (PKCE)", {
            action: "auth_callback_create_user_pkce",
            userId: data.user.id,
          });

          const confirmResponse = await fetch(`${origin}/api/auth/confirm`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: data.user.id }),
          });

          if (confirmResponse.ok) {
            logger.info("✅ Usuário criado na tabela users (PKCE)", {
              action: "auth_callback_user_created_pkce",
              userId: data.user.id,
            });
          } else {
            const errorData = await confirmResponse.json();
            logger.error("❌ Erro ao criar usuário na tabela users (PKCE)", {
              action: "auth_callback_user_creation_failed_pkce",
              userId: data.user.id,
              metadata: { error: errorData },
            });
          }
        } catch (createError) {
          logger.error("❌ Exceção ao criar usuário na tabela users (PKCE)", {
            action: "auth_callback_user_creation_exception_pkce",
            userId: data.user.id,
            metadata: {
              error: createError instanceof Error ? createError.message : "Unknown",
            },
          });
        }
      }

      const forwardedHost = request.headers.get("x-forwarded-host");
      const isLocalEnv = process.env.NODE_ENV === "development";
      
      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`);
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`);
      } else {
        return NextResponse.redirect(`${origin}${next}`);
      }
    } else {
      logger.error("❌ Erro ao criar sessão no callback", {
        action: "auth_callback_error",
        metadata: { error: error?.message },
      });
    }
  }

  // Cenário 2: Callback com TOKEN_HASH (email confirmation)
  if (token_hash && type) {
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash,
      type: type as "signup" | "invite" | "magiclink" | "recovery" | "email_change" | "email",
    });

    if (!error && data.session) {
      logger.info("✅ Email confirmado com sucesso no callback", {
        action: "auth_callback_email_confirmed",
        userId: data.user?.id,
        metadata: {
          email: data.user?.email,
          emailConfirmed: !!data.user?.email_confirmed_at,
        },
      });

      // Criar usuário na tabela users após confirmação de email
      if (data.user?.id) {
        try {
          logger.info("📝 Criando usuário na tabela users", {
            action: "auth_callback_create_user",
            userId: data.user.id,
          });

          const confirmResponse = await fetch(`${origin}/api/auth/confirm`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: data.user.id }),
          });

          if (confirmResponse.ok) {
            logger.info("✅ Usuário criado na tabela users", {
              action: "auth_callback_user_created",
              userId: data.user.id,
            });
          } else {
            const errorData = await confirmResponse.json();
            logger.error("❌ Erro ao criar usuário na tabela users", {
              action: "auth_callback_user_creation_failed",
              userId: data.user.id,
              metadata: { error: errorData },
            });
          }
        } catch (createError) {
          logger.error("❌ Exceção ao criar usuário na tabela users", {
            action: "auth_callback_user_creation_exception",
            userId: data.user.id,
            metadata: {
              error: createError instanceof Error ? createError.message : "Unknown",
            },
          });
        }
      }

      const forwardedHost = request.headers.get("x-forwarded-host");
      const isLocalEnv = process.env.NODE_ENV === "development";
      
      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`);
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`);
      } else {
        return NextResponse.redirect(`${origin}${next}`);
      }
    } else {
      logger.error("❌ Erro ao confirmar email no callback", {
        action: "auth_callback_verify_error",
        metadata: { error: error?.message },
      });
    }
  }

  // Cenário 3: Verificar se já há uma sessão ativa (redirect direto do Supabase)
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  
  if (session && !sessionError) {
    logger.info("✅ Sessão ativa detectada no callback", {
      action: "auth_callback_session_detected",
      userId: session.user?.id,
      metadata: {
        email: session.user?.email,
        emailConfirmed: !!session.user?.email_confirmed_at,
      },
    });

    return NextResponse.redirect(`${origin}${next}`);
  }

  // Se nenhum cenário funcionou, redirecionar para entrar
  logger.warn("Callback sem código/token ou com erro - redirecionando para entrar", {
    action: "auth_callback_fallback",
  });
  return NextResponse.redirect(`${origin}/entrar`);
}

