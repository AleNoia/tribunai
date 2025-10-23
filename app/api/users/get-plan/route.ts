import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { logger } from "@/lib/logger";
import { ERROR_MESSAGES } from "@/lib/security";

export async function GET() {
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

    const { data: userData, error: dbError } = await supabase
      .from("users")
      .select("selected_plan, payment_status")
      .eq("auth_user_id", user.id)
      .maybeSingle();

    if (dbError) {
      logger.error("Erro ao buscar plano do usuário", {
        action: "get_plan_error",
        userId: user.id,
        metadata: { error: dbError.message },
      });

      return NextResponse.json(
        { error: ERROR_MESSAGES.INTERNAL_ERROR },
        { status: 500 }
      );
    }

    return NextResponse.json({
      plan: userData?.selected_plan || "free",
      paymentStatus: userData?.payment_status || "pending",
    });
  } catch (error) {
    logger.error("Erro inesperado ao buscar plano", {
      action: "get_plan_unexpected_error",
      metadata: { error: error instanceof Error ? error.message : "Unknown error" },
    });

    return NextResponse.json(
      { error: ERROR_MESSAGES.INTERNAL_ERROR },
      { status: 500 }
    );
  }
}


