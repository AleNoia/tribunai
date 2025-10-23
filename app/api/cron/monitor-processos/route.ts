import { NextRequest, NextResponse } from "next/server";
import { executarMonitoramento } from "@/lib/services/monitor-processos";
import { logger } from "@/lib/logger";

/**
 * API Route para monitoramento automático de processos
 * 
 * Este endpoint deve ser chamado por um cron job (Vercel Cron, GitHub Actions, etc.)
 * 
 * Segurança: Verificar CRON_SECRET para garantir que apenas o cron autorizado acesse
 */
export async function GET(req: NextRequest) {
  try {
    // 🔒 VERIFICAR AUTORIZAÇÃO
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
      logger.error("CRON_SECRET não configurado", {
        action: "cron_monitor_unauthorized",
      });
      return NextResponse.json(
        { error: "Configuração inválida" },
        { status: 500 }
      );
    }

    // Verificar token de autorização
    if (authHeader !== `Bearer ${cronSecret}`) {
      logger.warn("Tentativa de acesso não autorizado ao cron", {
        action: "cron_monitor_unauthorized",
      });
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    // ✅ EXECUTAR MONITORAMENTO
    logger.info("Iniciando job de monitoramento via cron", {
      action: "cron_monitor_start",
    });

    const resultado = await executarMonitoramento();

    logger.info("Job de monitoramento concluído", {
      action: "cron_monitor_complete",
      metadata: resultado,
    });

    return NextResponse.json({
      success: true,
      message: "Monitoramento executado com sucesso",
      stats: resultado,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error("Erro no job de monitoramento", {
      action: "cron_monitor_error",
      metadata: { error },
    });

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Erro desconhecido",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

// Vercel Cron Job: POST também é suportado
export async function POST(req: NextRequest) {
  return GET(req);
}

