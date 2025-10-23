import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { logger } from "@/lib/logger";

// GET - Listar notificações do usuário
export async function GET(req: NextRequest) {
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

    // Buscar query params
    const { searchParams } = new URL(req.url);
    const apenas_nao_lidas = searchParams.get("apenas_nao_lidas") === "true";
    const limit = parseInt(searchParams.get("limit") || "50");

    // Construir query
    let query = supabase
      .from("notifications")
      .select(
        `
        id,
        tipo,
        titulo,
        mensagem,
        movimento_data,
        movimento_nome,
        lida,
        criado_em,
        user_processes (
          id,
          apelido,
          processes (
            numero,
            tribunal
          )
        )
      `
      )
      .eq("user_id", user.id)
      .order("criado_em", { ascending: false })
      .limit(limit);

    if (apenas_nao_lidas) {
      query = query.eq("lida", false);
    }

    const { data: notificacoes, error: dbError } = await query;

    if (dbError) throw dbError;

    // Contar não lidas
    const { count: naoLidas } = await supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("lida", false);

    logger.info("Notificações listadas", {
      action: "list_notificacoes",
      metadata: { total: notificacoes?.length, naoLidas },
    });

    return NextResponse.json({
      notificacoes: notificacoes || [],
      nao_lidas: naoLidas || 0,
    });
  } catch (error) {
    logger.error("Erro ao listar notificações", {
      action: "list_notificacoes_error",
      metadata: { error },
    });

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Erro ao listar notificações",
      },
      { status: 500 }
    );
  }
}

