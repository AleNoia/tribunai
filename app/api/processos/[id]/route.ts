import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { editProcessoSchema } from "@/lib/schemas/processo";
import { logger } from "@/lib/logger";

// Tipos para o retorno do Supabase
interface ProcessData {
  id: string;
  numero: string;
  tribunal: string;
  partes?: unknown;
  ultima_movimentacao?: {
    data: string;
    descricao: string;
  };
  classe?: {
    codigo: number;
    nome: string;
  };
  sistema?: {
    codigo: number;
    nome: string;
  };
  formato?: {
    codigo: number;
    nome: string;
  };
  data_ajuizamento?: string;
  grau?: string;
  orgao_julgador?: {
    codigo: number;
    nome: string;
  };
  assuntos?: Array<{
    codigo: number;
    nome: string;
  }>;
  movimentos?: Array<{
    dataHora: string;
    nome: string;
    complementosTabelados?: Array<{
      descricao: string;
    }>;
  }>;
}

interface UserProcessWithProcess {
  id: string;
  apelido: string | null;
  notificar: boolean;
  criado_em: string;
  atualizado_em: string;
  processes: ProcessData;
}

// GET - Buscar processo específico
export async function GET(
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
        action: "get_processo_user_not_found",
        userId: user.id,
        metadata: { error: userError?.message },
      });
      return NextResponse.json(
        { error: "Usuário não encontrado. Entre em contato com o suporte." },
        { status: 404 }
      );
    }

    const internalUserId = userData.id;

    // Buscar processo
    const { data: processo, error: fetchError } = await supabaseAdmin
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
          classe,
          sistema,
          formato,
          data_ajuizamento,
          grau,
          orgao_julgador,
          assuntos,
          movimentos
        )
      `
      )
      .eq("id", id)
      .eq("user_id", internalUserId)
      .maybeSingle();

    if (fetchError || !processo) {
      logger.error("Erro ao buscar processo", {
        action: "get_processo_error",
        userId: user.id,
        metadata: { error: fetchError?.message, id },
      });

      return NextResponse.json(
        { error: "Processo não encontrado" },
        { status: 404 }
      );
    }

    logger.info("Processo carregado com sucesso", {
      action: "get_processo_success",
      userId: user.id,
      metadata: { id },
    });

    // Formatar resposta
    const typedProcesso = processo as unknown as UserProcessWithProcess;
    const processoFormatado = {
      id: typedProcesso.id,
      process_id: typedProcesso.processes.id,
      numero: typedProcesso.processes.numero,
      tribunal: typedProcesso.processes.tribunal,
      apelido: typedProcesso.apelido,
      notificar: typedProcesso.notificar,
      created_at: typedProcesso.criado_em,
      updated_at: typedProcesso.atualizado_em,
      ultima_movimentacao: typedProcesso.processes.ultima_movimentacao,
      partes: typedProcesso.processes.partes,
      classe: typedProcesso.processes.classe,
      sistema: typedProcesso.processes.sistema,
      formato: typedProcesso.processes.formato,
      dataAjuizamento: typedProcesso.processes.data_ajuizamento,
      grau: typedProcesso.processes.grau,
      orgaoJulgador: typedProcesso.processes.orgao_julgador,
      assuntos: typedProcesso.processes.assuntos,
      movimentos: typedProcesso.processes.movimentos,
    };

    return NextResponse.json({ processo: processoFormatado });
  } catch (error) {
    logger.error("Erro inesperado ao buscar processo", {
      action: "get_processo_unexpected_error",
      metadata: { error: error instanceof Error ? error.message : "unknown" },
    });

    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

// PATCH - Editar acompanhamento
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
        action: "patch_processo_user_not_found",
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
    const validation = editProcessoSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: validation.error.issues },
        { status: 400 }
      );
    }

    const { apelido, notificar } = validation.data;

    // Verificar se o registro pertence ao usuário
    const { data: existingProcess } = await supabaseAdmin
      .from("user_processes")
      .select("id")
      .eq("id", id)
      .eq("user_id", internalUserId)
      .maybeSingle();

    if (!existingProcess) {
      return NextResponse.json(
        { error: "Processo não encontrado ou não pertence a você" },
        { status: 404 }
      );
    }

    // Atualizar (usando Admin para bypass RLS)
    const { data: updated, error: updateError } = await supabaseAdmin
      .from("user_processes")
      .update({
        apelido: apelido || null,
        notificar,
        atualizado_em: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("user_id", internalUserId)
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

    if (updateError || !updated) {
      logger.error("Erro ao atualizar processo", {
        action: "update_processo_error",
        userId: user.id,
        metadata: { error: updateError?.message, id },
      });

      return NextResponse.json({ error: "Erro ao atualizar processo" }, { status: 500 });
    }

    logger.info("Processo atualizado com sucesso", {
      action: "update_processo_success",
      userId: user.id,
      metadata: { id },
    });

    // Formatar resposta
    const typedUpdated = updated as unknown as UserProcessWithProcess;
    const processo = {
      id: typedUpdated.id,
      process_id: typedUpdated.processes.id,
      numero: typedUpdated.processes.numero,
      tribunal: typedUpdated.processes.tribunal,
      apelido: typedUpdated.apelido,
      notificar: typedUpdated.notificar,
      criado_em: typedUpdated.criado_em,
      atualizado_em: typedUpdated.atualizado_em,
      ultima_movimentacao: typedUpdated.processes.ultima_movimentacao,
      partes: typedUpdated.processes.partes,
    };

    return NextResponse.json({ processo });
  } catch (error) {
    logger.error("Erro inesperado ao atualizar processo", {
      action: "update_processo_unexpected_error",
      metadata: { error: error instanceof Error ? error.message : "unknown" },
    });

    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

// DELETE - Remover acompanhamento
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
        action: "delete_processo_user_not_found",
        userId: user.id,
        metadata: { error: userError?.message },
      });
      return NextResponse.json(
        { error: "Usuário não encontrado. Entre em contato com o suporte." },
        { status: 404 }
      );
    }

    const internalUserId = userData.id;

    // Verificar se o registro pertence ao usuário
    const { data: existingProcess } = await supabaseAdmin
      .from("user_processes")
      .select("id")
      .eq("id", id)
      .eq("user_id", internalUserId)
      .maybeSingle();

    if (!existingProcess) {
      return NextResponse.json(
        { error: "Processo não encontrado ou não pertence a você" },
        { status: 404 }
      );
    }

    // Deletar (usando Admin para bypass RLS)
    const { error: deleteError } = await supabaseAdmin
      .from("user_processes")
      .delete()
      .eq("id", id)
      .eq("user_id", internalUserId);

    if (deleteError) {
      logger.error("Erro ao deletar processo", {
        action: "delete_processo_error",
        userId: user.id,
        metadata: { error: deleteError.message, id },
      });

      return NextResponse.json({ error: "Erro ao deletar processo" }, { status: 500 });
    }

    logger.info("Processo deletado com sucesso", {
      action: "delete_processo_success",
      userId: user.id,
      metadata: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error("Erro inesperado ao deletar processo", {
      action: "delete_processo_unexpected_error",
      metadata: { error: error instanceof Error ? error.message : "unknown" },
    });

    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

