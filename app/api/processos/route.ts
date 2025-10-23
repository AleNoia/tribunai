import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { addProcessoSchema } from "@/lib/schemas/processo";
import { logger } from "@/lib/logger";
import { DataJudProcesso } from "@/lib/types";
import { buscarProcessoDataJud } from "@/lib/datajud";

// GET - Listar processos acompanhados do usuário
export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();

    // Verificar autenticação
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Buscar o ID interno do usuário na tabela users
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("auth_user_id", user.id)
      .maybeSingle();

    if (userError || !userData) {
      logger.error("Usuário não encontrado na tabela users", {
        action: "get_processos_user_not_found",
        userId: user.id,
        metadata: { error: userError?.message },
      });
      return NextResponse.json(
        { error: "Usuário não encontrado. Entre em contato com o suporte." },
        { status: 404 }
      );
    }

    const internalUserId = userData.id;

    // Buscar processos do usuário com JOIN (usando Admin para bypass RLS)
    // ✅ OTIMIZAÇÃO: Removido campo movimentos para melhorar performance
    const { data: userProcesses, error: dbError } = await supabaseAdmin
      .from("user_processes")
      .select(
        `
        id,
        apelido,
        notificar,
        criado_em,
        atualizado_em,
        processes (
          id,
          numero,
          tribunal,
          partes,
          ultima_movimentacao,
          atualizado_em,
          classe,
          sistema,
          formato,
          data_ajuizamento,
          grau,
          orgao_julgador,
          assuntos
        )
      `
      )
      .eq("user_id", internalUserId)
      .order("atualizado_em", { ascending: false });

    if (dbError) {
      logger.error("Erro ao buscar processos", {
        action: "get_processos_error",
        userId: user.id,
        metadata: { error: dbError.message },
      });

      return NextResponse.json({ error: "Erro ao buscar processos" }, { status: 500 });
    }

    // Formatar resposta (movimentos completos só no endpoint de detalhes)
    const processos = (userProcesses || []).map((up: any) => ({
      id: up.id,
      process_id: up.processes?.id,
      numero: up.processes?.numero,
      tribunal: up.processes?.tribunal,
      apelido: up.apelido,
      notificar: up.notificar,
      created_at: up.criado_em,
      updated_at: up.atualizado_em,
      criado_em: up.criado_em,
      atualizado_em: up.atualizado_em,
      ultima_movimentacao: up.processes?.ultima_movimentacao,
      partes: up.processes?.partes,
      classe: up.processes?.classe,
      sistema: up.processes?.sistema,
      formato: up.processes?.formato,
      dataAjuizamento: up.processes?.data_ajuizamento,
      grau: up.processes?.grau,
      orgaoJulgador: up.processes?.orgao_julgador,
      assuntos: up.processes?.assuntos,
    }));

    logger.info("Processos listados com sucesso", {
      action: "get_processos_success",
      userId: user.id,
      metadata: { count: processos.length },
    });

    return NextResponse.json({ processos });
  } catch (error) {
    logger.error("Erro inesperado ao listar processos", {
      action: "get_processos_unexpected_error",
      metadata: { error: error instanceof Error ? error.message : "unknown" },
    });

    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

// POST - Adicionar novo acompanhamento
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();

    // Verificar autenticação
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Buscar o ID interno do usuário na tabela users
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("auth_user_id", user.id)
      .maybeSingle();

    if (userError || !userData) {
      logger.error("Usuário não encontrado na tabela users", {
        action: "add_processo_user_not_found",
        userId: user.id,
        metadata: { error: userError?.message },
      });
      return NextResponse.json(
        { error: "Usuário não encontrado. Entre em contato com o suporte." },
        { status: 404 }
      );
    }

    const internalUserId = userData.id;

    // Validar entrada
    const body = await req.json();
    const validation = addProcessoSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: validation.error.errors },
        { status: 400 }
      );
    }

    const { numero, tribunal, apelido, notificar } = validation.data;

    // ✅ CORREÇÃO: Separar em 2 queries para evitar problemas com JOIN
    // 1. Buscar processo na tabela global
    const { data: existingProcess } = await supabaseAdmin
      .from("processes")
      .select("id")
      .eq("numero", numero)
      .maybeSingle();

    let processId: string;

    if (existingProcess) {
      // 2. Verificar se usuário já acompanha este processo
      const { data: existingUserProcess } = await supabaseAdmin
        .from("user_processes")
        .select("id")
        .eq("user_id", internalUserId)
        .eq("process_id", existingProcess.id)
        .maybeSingle();

      if (existingUserProcess) {
        return NextResponse.json(
          { error: "Você já acompanha este processo" },
          { status: 409 }
        );
      }

      processId = existingProcess.id;
    } else {
      // Buscar dados do DataJud usando a função do servidor
      const resultado = await buscarProcessoDataJud(numero);
      const dadosDataJud = resultado.success ? resultado.processo : null;

      // Criar novo processo na tabela global (usando Admin para bypass RLS)
      const { data: newProcess, error: createError} = await supabaseAdmin
        .from("processes")
        .insert({
          numero,
          tribunal,
          partes: dadosDataJud?.partes || {},
          ultima_movimentacao: dadosDataJud?.movimentos && dadosDataJud.movimentos.length > 0
            ? {
                data: dadosDataJud.movimentos[0].dataHora,
                descricao: dadosDataJud.movimentos[0].nome,
              }
            : null,
          classe: dadosDataJud?.classe || null,
          sistema: dadosDataJud?.sistema || null,
          formato: dadosDataJud?.formato || null,
          data_ajuizamento: dadosDataJud?.dataAjuizamento || null,
          grau: dadosDataJud?.grau || null,
          orgao_julgador: dadosDataJud?.orgaoJulgador || null,
          assuntos: dadosDataJud?.assuntos || null,
          movimentos: dadosDataJud?.movimentos || null,
        })
        .select("id")
        .single();

      if (createError || !newProcess) {
        logger.error("Erro ao criar processo", {
          action: "create_processo_error",
          userId: user.id,
          metadata: { error: createError?.message },
        });

        return NextResponse.json({ error: "Erro ao criar processo" }, { status: 500 });
      }

      processId = newProcess.id;
    }

    // Criar vínculo user_processes (usando Admin para bypass RLS)
    const { data: userProcess, error: linkError } = await supabaseAdmin
      .from("user_processes")
      .insert({
        user_id: internalUserId, // ✅ Usar o ID interno da tabela users
        process_id: processId,
        apelido: apelido || null,
        notificar,
      })
      .select(
        `
        id,
        apelido,
        notificar,
        criado_em,
        atualizado_em,
        processes (
          id,
          numero,
          tribunal,
          partes,
          ultima_movimentacao
        )
      `
      )
      .single();

    if (linkError || !userProcess) {
      logger.error("Erro ao vincular processo", {
        action: "link_processo_error",
        userId: user.id,
        metadata: { error: linkError?.message },
      });

      return NextResponse.json({ error: "Erro ao vincular processo" }, { status: 500 });
    }

    logger.info("Processo adicionado com sucesso", {
      action: "add_processo_success",
      userId: user.id,
      metadata: { processId, numero },
    });

    // Formatar resposta
    const processo = {
      id: userProcess.id,
      process_id: (userProcess as any).processes?.id,
      numero: (userProcess as any).processes?.numero,
      tribunal: (userProcess as any).processes?.tribunal,
      apelido: userProcess.apelido,
      notificar: userProcess.notificar,
      criado_em: userProcess.criado_em,
      atualizado_em: userProcess.atualizado_em,
      ultima_movimentacao: (userProcess as any).processes?.ultima_movimentacao,
      partes: (userProcess as any).processes?.partes,
    };

    return NextResponse.json({ processo }, { status: 201 });
  } catch (error) {
    logger.error("Erro inesperado ao adicionar processo", {
      action: "add_processo_unexpected_error",
      metadata: { error: error instanceof Error ? error.message : "unknown" },
    });

    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

