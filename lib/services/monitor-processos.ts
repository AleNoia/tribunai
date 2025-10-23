import { supabaseAdmin } from "@/lib/supabase/admin";
import { buscarProcessoDataJud } from "@/lib/datajud";
import { logger } from "@/lib/logger";
import { DataJudMovimento } from "@/lib/types";

interface ProcessoParaMonitorar {
  user_process_id: string;
  user_id: string;
  process_id: string;
  numero: string;
  notificar: boolean;
  ultima_movimentacao_data: string | null;
}

interface NovaMovimentacao {
  user_process_id: string;
  user_id: string;
  process_id: string;
  numero: string;
  movimento: DataJudMovimento;
}

/**
 * Busca todos os processos que devem ser monitorados
 * (apenas processos com notificações ativas)
 */
export async function buscarProcessosParaMonitorar(): Promise<
  ProcessoParaMonitorar[]
> {
  try {
    const { data, error } = await supabaseAdmin
      .from("user_processes")
      .select(
        `
        id,
        user_id,
        process_id,
        notificar,
        processes (
          id,
          numero,
          ultima_movimentacao
        )
      `
      )
      .eq("notificar", true);

    if (error) throw error;

    return (data || []).map((up: any) => ({
      user_process_id: up.id,
      user_id: up.user_id,
      process_id: up.processes.id,
      numero: up.processes.numero,
      notificar: up.notificar,
      ultima_movimentacao_data: up.processes.ultima_movimentacao?.data || null,
    }));
  } catch (error) {
    logger.error("Erro ao buscar processos para monitorar", {
      action: "monitor_buscar_processos",
      metadata: { error },
    });
    return [];
  }
}

/**
 * Compara movimentações e detecta novas
 */
export function detectarNovasMovimentacoes(
  processo: ProcessoParaMonitorar,
  movimentosDataJud: DataJudMovimento[]
): DataJudMovimento[] {
  if (!movimentosDataJud || movimentosDataJud.length === 0) {
    return [];
  }

  // Se não há última movimentação registrada, considera todas como novas
  if (!processo.ultima_movimentacao_data) {
    return movimentosDataJud;
  }

  const dataUltimaMovimentacao = new Date(processo.ultima_movimentacao_data);

  // Filtra movimentos posteriores à última movimentação
  const novasMovimentacoes = movimentosDataJud.filter((mov) => {
    const dataMovimento = new Date(mov.dataHora);
    return dataMovimento > dataUltimaMovimentacao;
  });

  return novasMovimentacoes;
}

/**
 * Atualiza dados do processo no banco
 */
export async function atualizarDadosProcesso(
  processId: string,
  dadosDataJud: any
): Promise<boolean> {
  try {
    // Encontrar última movimentação
    let ultimaMovimentacao = null;
    if (dadosDataJud.movimentos && dadosDataJud.movimentos.length > 0) {
      const movimentoMaisRecente = dadosDataJud.movimentos.reduce(
        (mais_recente: any, atual: any) => {
          const dataAtual = new Date(atual.dataHora);
          const dataMaisRecente = new Date(mais_recente.dataHora);
          return dataAtual > dataMaisRecente ? atual : mais_recente;
        }
      );

      const complementos = movimentoMaisRecente.complementosTabelados
        ?.map((c: any) => c.descricao)
        .join(" - ");

      ultimaMovimentacao = {
        data: movimentoMaisRecente.dataHora,
        descricao: `${movimentoMaisRecente.nome}${
          complementos ? ` - ${complementos}` : ""
        }`,
      };
    }

    // Atualizar processo
    const { error } = await supabaseAdmin
      .from("processes")
      .update({
        partes: dadosDataJud.partes,
        classe: dadosDataJud.classe,
        sistema: dadosDataJud.sistema,
        formato: dadosDataJud.formato,
        data_ajuizamento: dadosDataJud.dataAjuizamento,
        grau: dadosDataJud.grau,
        orgao_julgador: dadosDataJud.orgaoJulgador,
        assuntos: dadosDataJud.assuntos,
        movimentos: dadosDataJud.movimentos,
        ultima_movimentacao: ultimaMovimentacao,
        atualizado_em: new Date().toISOString(),
      })
      .eq("id", processId);

    if (error) throw error;

    // Atualizar timestamp em user_processes
    await supabaseAdmin
      .from("user_processes")
      .update({ atualizado_em: new Date().toISOString() })
      .eq("process_id", processId);

    return true;
  } catch (error) {
    logger.error("Erro ao atualizar dados do processo", {
      action: "monitor_atualizar_processo",
      metadata: { processId, error },
    });
    return false;
  }
}

/**
 * Cria notificação para o usuário
 */
export async function criarNotificacao(
  userId: string,
  userProcessId: string,
  processId: string,
  numeroProcesso: string,
  movimento: DataJudMovimento
): Promise<boolean> {
  try {
    const complementos = movimento.complementosTabelados
      ?.map((c) => c.descricao)
      .join(" - ");

    const titulo = "Nova movimentação processual";
    const mensagem = `Processo ${numeroProcesso}: ${movimento.nome}${
      complementos ? ` - ${complementos}` : ""
    }`;

    const { error } = await supabaseAdmin.from("notifications").insert({
      user_id: userId,
      user_process_id: userProcessId,
      process_id: processId,
      tipo: "nova_movimentacao",
      titulo,
      mensagem,
      movimento_data: movimento.dataHora,
      movimento_nome: movimento.nome,
      movimento_complementos: movimento.complementosTabelados || null,
      lida: false,
    });

    if (error) throw error;

    logger.info("Notificação criada", {
      action: "monitor_criar_notificacao",
      metadata: { userId, numeroProcesso },
    });

    return true;
  } catch (error) {
    logger.error("Erro ao criar notificação", {
      action: "monitor_criar_notificacao_error",
      metadata: { userId, numeroProcesso, error },
    });
    return false;
  }
}

/**
 * Monitora um processo específico
 */
export async function monitorarProcesso(
  processo: ProcessoParaMonitorar
): Promise<{
  success: boolean;
  novasMovimentacoes: number;
}> {
  try {
    logger.info("Monitorando processo", {
      action: "monitor_processo_start",
      metadata: { numero: processo.numero },
    });

    // Buscar dados atualizados no DataJud
    const resultado = await buscarProcessoDataJud(processo.numero);

    if (!resultado.success || !resultado.processo) {
      logger.warn("Não foi possível buscar dados do processo", {
        action: "monitor_processo_datajud_error",
        metadata: { numero: processo.numero, error: resultado.error },
      });
      return { success: false, novasMovimentacoes: 0 };
    }

    const dadosDataJud = resultado.processo;

    // Detectar novas movimentações
    const novasMovimentacoes = detectarNovasMovimentacoes(
      processo,
      dadosDataJud.movimentos || []
    );

    logger.info("Movimentações detectadas", {
      action: "monitor_processo_movimentacoes",
      metadata: {
        numero: processo.numero,
        novas: novasMovimentacoes.length,
      },
    });

    // Se há novas movimentações, atualizar banco e criar notificações
    if (novasMovimentacoes.length > 0) {
      // Atualizar dados do processo
      await atualizarDadosProcesso(processo.process_id, dadosDataJud);

      // Criar notificações (máximo 5 por vez para não sobrecarregar)
      const movimentacoesParaNotificar = novasMovimentacoes.slice(0, 5);

      for (const movimento of movimentacoesParaNotificar) {
        await criarNotificacao(
          processo.user_id,
          processo.user_process_id,
          processo.process_id,
          processo.numero,
          movimento
        );
      }

      // Se há mais de 5 movimentações, criar notificação resumida
      if (novasMovimentacoes.length > 5) {
        await supabaseAdmin.from("notifications").insert({
          user_id: processo.user_id,
          user_process_id: processo.user_process_id,
          process_id: processo.process_id,
          tipo: "alerta",
          titulo: "Múltiplas movimentações",
          mensagem: `Processo ${processo.numero} teve ${
            novasMovimentacoes.length - 5
          } movimentações adicionais. Acesse os detalhes para ver todas.`,
          lida: false,
        });
      }
    } else {
      // Mesmo sem novas movimentações, atualizar timestamp
      await supabaseAdmin
        .from("user_processes")
        .update({ atualizado_em: new Date().toISOString() })
        .eq("id", processo.user_process_id);
    }

    return { success: true, novasMovimentacoes: novasMovimentacoes.length };
  } catch (error) {
    logger.error("Erro ao monitorar processo", {
      action: "monitor_processo_error",
      metadata: { numero: processo.numero, error },
    });
    return { success: false, novasMovimentacoes: 0 };
  }
}

/**
 * Executa monitoramento de todos os processos
 */
export async function executarMonitoramento(): Promise<{
  total: number;
  sucesso: number;
  falhas: number;
  novasMovimentacoes: number;
}> {
  const startTime = Date.now();

  logger.info("Iniciando monitoramento de processos", {
    action: "monitor_start",
  });

  // Buscar processos para monitorar
  const processos = await buscarProcessosParaMonitorar();

  logger.info("Processos encontrados para monitorar", {
    action: "monitor_processos_encontrados",
    metadata: { total: processos.length },
  });

  if (processos.length === 0) {
    return { total: 0, sucesso: 0, falhas: 0, novasMovimentacoes: 0 };
  }

  // Monitorar cada processo (com delay para não sobrecarregar API)
  let sucesso = 0;
  let falhas = 0;
  let totalNovasMovimentacoes = 0;

  for (const processo of processos) {
    const resultado = await monitorarProcesso(processo);

    if (resultado.success) {
      sucesso++;
      totalNovasMovimentacoes += resultado.novasMovimentacoes;
    } else {
      falhas++;
    }

    // Delay de 2 segundos entre requisições para não sobrecarregar a API
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  const duration = Date.now() - startTime;

  logger.info("Monitoramento concluído", {
    action: "monitor_complete",
    metadata: {
      total: processos.length,
      sucesso,
      falhas,
      novasMovimentacoes: totalNovasMovimentacoes,
      duracao: `${(duration / 1000).toFixed(2)}s`,
    },
  });

  return {
    total: processos.length,
    sucesso,
    falhas,
    novasMovimentacoes: totalNovasMovimentacoes,
  };
}

