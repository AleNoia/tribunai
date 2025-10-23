import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { logger } from "@/lib/logger";
import { buscarProcessoDataJud } from "@/lib/datajud";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { numero } = body;

    if (!numero) {
      return NextResponse.json(
        { error: "Número do processo não fornecido" },
        { status: 400 }
      );
    }

    // Autenticar usuário
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      logger.error("Erro de autenticação", {
        action: "update_processo_datajud",
        metadata: { error: authError?.message },
      });
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    // Buscar user_id interno
    const { data: internalUser, error: userError } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("auth_user_id", user.id)
      .maybeSingle();

    if (userError || !internalUser) {
      logger.error("Erro ao buscar usuário interno", {
        action: "update_processo_datajud",
        metadata: { error: userError?.message },
      });
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    // Verificar ownership
    const { data: userProcess, error: fetchError } = await supabaseAdmin
      .from("user_processes")
      .select("process_id")
      .eq("id", id)
      .eq("user_id", internalUser.id)
      .maybeSingle();

    if (fetchError || !userProcess) {
      return NextResponse.json(
        { error: "Processo não encontrado" },
        { status: 404 }
      );
    }

    // ✅ BUSCAR DADOS DO DATAJUD NO SERVIDOR
    logger.info("Buscando dados do DataJud", {
      action: "update_processo_datajud",
      metadata: { id, numero },
    });

    const resultado = await buscarProcessoDataJud(numero);

    if (!resultado.success || !resultado.processo) {
      return NextResponse.json(
        { error: resultado.error || "Erro ao buscar dados no DataJud" },
        { status: 400 }
      );
    }

    const dadosDataJud = resultado.processo;

    // Atualizar processo
    const { error: updateError } = await supabaseAdmin
      .from("processes")
      .update({
        partes: dadosDataJud.partes || {},
        ultima_movimentacao:
          dadosDataJud.movimentos && dadosDataJud.movimentos.length > 0
            ? {
                data: dadosDataJud.movimentos[0].dataHora,
                descricao: dadosDataJud.movimentos[0].nome,
              }
            : null,
        classe: dadosDataJud.classe || null,
        sistema: dadosDataJud.sistema || null,
        formato: dadosDataJud.formato || null,
        data_ajuizamento: dadosDataJud.dataAjuizamento || null,
        grau: dadosDataJud.grau || null,
        orgao_julgador: dadosDataJud.orgaoJulgador || null,
        assuntos: dadosDataJud.assuntos || null,
        movimentos: dadosDataJud.movimentos || null,
        atualizado_em: new Date().toISOString(),
      })
      .eq("id", userProcess.process_id);

    if (updateError) {
      logger.error("Erro ao atualizar processo", {
        action: "update_processo_datajud",
        metadata: { 
          processId: userProcess.process_id,
          error: updateError.message,
        },
      });
      return NextResponse.json(
        { error: "Erro ao atualizar processo no banco de dados" },
        { status: 500 }
      );
    }

    // Atualizar timestamp
    await supabaseAdmin
      .from("user_processes")
      .update({ atualizado_em: new Date().toISOString() })
      .eq("id", id);

    logger.info("Processo atualizado com dados do DataJud", {
      action: "update_processo_datajud",
      metadata: { id, processId: userProcess.process_id },
    });

    return NextResponse.json({
      success: true,
      message: "Processo atualizado com sucesso",
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    logger.error("Erro não tratado ao atualizar processo do DataJud", {
      action: "update_processo_datajud",
      metadata: { error: errorMessage },
    });
    
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

