import { NextResponse } from "next/server";
import { supabaseAdmin, initializeUserProgress } from "@/lib/supabase/admin";
import { apiRateLimiter, securityMiddleware, ERROR_MESSAGES } from "@/lib/security";
import { logger } from "@/lib/logger";

export async function POST(req: Request) {
  try {
    // Rate limiting
    await securityMiddleware.rateLimit(apiRateLimiter)(req);

    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.INVALID_DATA },
        { status: 400 }
      );
    }

    // Verificar se usuário já existe no banco
    const { data: existingUser } = await supabaseAdmin
      .from("users")
      .select("id, auth_user_id")
      .eq("auth_user_id", userId)
      .maybeSingle();

    if (existingUser) {
      logger.info("Usuário já existe no banco", {
        action: "confirm_user_exists",
        userId,
        metadata: { tableId: existingUser.id },
      });

      return NextResponse.json({ 
        message: "User already exists",
        tableId: existingUser.id 
      });
    }

    // Buscar dados do usuário no Auth
    const { data: authUser, error: authError } =
      await supabaseAdmin.auth.admin.getUserById(userId);

    if (authError || !authUser) {
      logger.error("Erro ao buscar usuário no Auth", {
        action: "confirm_auth_error",
        userId,
        metadata: { error: authError?.message },
      });

      return NextResponse.json(
        { error: ERROR_MESSAGES.USER_NOT_FOUND },
        { status: 404 }
      );
    }

    const userMetadata = authUser.user.user_metadata || {};

    // Criar usuário no banco
    const { error: insertError } = await supabaseAdmin.from("users").insert({
      auth_user_id: userId,
      name: userMetadata.name || "",
      email: authUser.user.email || "",
      selected_plan: userMetadata.selectedPlan || "free",
      payment_status: "pending",
      role: "user",
      metadata: {},
    });

    if (insertError) {
      logger.error("Erro ao criar usuário no banco", {
        action: "confirm_insert_error",
        userId,
        metadata: { error: insertError.message },
      });

      return NextResponse.json(
        { error: ERROR_MESSAGES.INTERNAL_ERROR },
        { status: 500 }
      );
    }

    // Inicializar progresso
    await initializeUserProgress(userId);

    logger.info("Usuário confirmado e criado no banco", {
      action: "confirm_success",
      userId,
      metadata: {
        plan: userMetadata.selectedPlan || "free",
      },
    });

    return NextResponse.json({ message: "User confirmed and created" });
  } catch (error) {
    logger.error("Erro inesperado na confirmação", {
      action: "confirm_unexpected_error",
      metadata: { error: error instanceof Error ? error.message : "Unknown error" },
    });

    return NextResponse.json(
      { error: ERROR_MESSAGES.INTERNAL_ERROR },
      { status: 500 }
    );
  }
}


