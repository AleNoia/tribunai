import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { logger } from "@/lib/logger";

// PATCH - Marcar notificação como lida/não lida
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    const body = await req.json();
    const { lida } = body;

    if (typeof lida !== "boolean") {
      return NextResponse.json(
        { error: "Campo 'lida' é obrigatório e deve ser booleano" },
        { status: 400 }
      );
    }

    // Atualizar notificação
    const { data, error } = await supabase
      .from("notifications")
      .update({
        lida,
        lida_em: lida ? new Date().toISOString() : null,
      })
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) throw error;

    if (!data) {
      return NextResponse.json(
        { error: "Notificação não encontrada" },
        { status: 404 }
      );
    }

    logger.info("Notificação atualizada", {
      action: "update_notificacao",
      metadata: { id, lida },
    });

    return NextResponse.json({ notificacao: data });
  } catch (error) {
    logger.error("Erro ao atualizar notificação", {
      action: "update_notificacao_error",
      metadata: { error },
    });

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Erro ao atualizar notificação",
      },
      { status: 500 }
    );
  }
}

// DELETE - Deletar notificação
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    // Deletar notificação
    const { error } = await supabase
      .from("notifications")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) throw error;

    logger.info("Notificação deletada", {
      action: "delete_notificacao",
      metadata: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error("Erro ao deletar notificação", {
      action: "delete_notificacao_error",
      metadata: { error },
    });

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Erro ao deletar notificação",
      },
      { status: 500 }
    );
  }
}

