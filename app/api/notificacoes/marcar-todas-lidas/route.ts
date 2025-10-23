import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { logger } from "@/lib/logger";

// POST - Marcar todas as notificações como lidas
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();

    // Verificar autenticação
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    // Marcar todas como lidas
    const { error } = await supabase
      .from("notifications")
      .update({
        lida: true,
        lida_em: new Date().toISOString(),
      })
      .eq("user_id", user.id)
      .eq("lida", false);

    if (error) throw error;

    logger.info("Todas notificações marcadas como lidas", {
      action: "marcar_todas_lidas",
      metadata: { user_id: user.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error("Erro ao marcar todas como lidas", {
      action: "marcar_todas_lidas_error",
      metadata: { error },
    });

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Erro ao marcar notificações como lidas",
      },
      { status: 500 }
    );
  }
}

