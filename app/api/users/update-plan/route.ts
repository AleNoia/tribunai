import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { planSchema, ERROR_MESSAGES } from "@/lib/security";
import { logger } from "@/lib/logger";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.USER_NOT_FOUND },
        { status: 401 }
      );
    }

    const body = await req.json();
    const validation = planSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.INVALID_DATA },
        { status: 400 }
      );
    }

    const { plan } = validation.data;

    const { error: updateError } = await supabase
      .from("users")
      .update({
        selected_plan: plan,
        payment_status: plan === "free" ? "paid" : "pending",
      })
      .eq("auth_user_id", user.id);

    if (updateError) {
      logger.error("Erro ao atualizar plano do usuário", {
        action: "update_plan_error",
        userId: user.id,
        metadata: { error: updateError.message, plan },
      });

      return NextResponse.json(
        { error: ERROR_MESSAGES.INTERNAL_ERROR },
        { status: 500 }
      );
    }

    logger.info("Plano atualizado com sucesso", {
      action: "update_plan_success",
      userId: user.id,
      metadata: { plan },
    });

    return NextResponse.json({ 
      success: true,
      message: "Plano atualizado", 
      plan 
    });
  } catch (error) {
    logger.error("Erro inesperado ao atualizar plano", {
      action: "update_plan_unexpected_error",
      metadata: { error: error instanceof Error ? error.message : "Unknown error" },
    });

    return NextResponse.json(
      { error: ERROR_MESSAGES.INTERNAL_ERROR },
      { status: 500 }
    );
  }
}


