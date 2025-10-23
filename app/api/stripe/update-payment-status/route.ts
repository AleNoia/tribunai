import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { logger } from "@/lib/logger";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia",
});

export async function POST(req: NextRequest) {
  try {
    logger.info("🔄 Iniciando atualização manual de status de pagamento", {
      action: "stripe_update_payment_status_start",
    });

    const { userId, sessionId } = await req.json();

    if (!userId || !sessionId) {
      logger.warn("❌ userId ou sessionId ausentes", {
        action: "stripe_update_payment_status_missing_data",
        metadata: { userId, sessionId },
      });
      return NextResponse.json(
        { error: "userId e sessionId são obrigatórios" },
        { status: 400 }
      );
    }

    logger.info("📡 Buscando sessão do Stripe", {
      action: "stripe_update_payment_status_fetch_session",
      userId,
      metadata: { sessionId },
    });

    // Buscar a sessão do Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    logger.info("✅ Sessão do Stripe encontrada", {
      action: "stripe_update_payment_status_session_found",
      userId,
      metadata: {
        sessionId,
        payment_status: session.payment_status,
        status: session.status,
      },
    });

    if (session.payment_status === "paid") {
      // Preparar dados básicos para atualização
      const updateData: Record<string, any> = {
        payment_status: "active",
      };

      // Tentar adicionar IDs do Stripe se disponíveis
      // Essas colunas são opcionais e podem não existir no schema
      if (session.customer) {
        updateData.stripe_customer_id = session.customer as string;
      }

      if (session.subscription) {
        updateData.stripe_subscription_id = session.subscription as string;
      }

      // Atualizar o status no banco
      const { error: updateError } = await supabaseAdmin
        .from("users")
        .update(updateData)
        .eq("auth_user_id", userId);

      if (updateError) {
        // Se erro for por coluna não existir, tentar novamente sem essas colunas
        if (updateError.message.includes("stripe_customer_id") || 
            updateError.message.includes("stripe_subscription_id")) {
          logger.warn("⚠️ Colunas do Stripe não existem, atualizando apenas payment_status", {
            action: "stripe_update_payment_status_fallback",
            userId,
            metadata: { originalError: updateError.message },
          });

          // Atualizar apenas campos essenciais
          const { error: fallbackError } = await supabaseAdmin
            .from("users")
            .update({ payment_status: "active" })
            .eq("auth_user_id", userId);

          if (fallbackError) {
            logger.error("❌ Erro ao atualizar status no banco (fallback)", {
              action: "stripe_update_payment_status_fallback_error",
              userId,
              metadata: { error: fallbackError.message },
            });
            return NextResponse.json(
              { error: "Erro ao atualizar status" },
              { status: 500 }
            );
          }
        } else {
          logger.error("❌ Erro ao atualizar status no banco", {
            action: "stripe_update_payment_status_db_error",
            userId,
            metadata: { error: updateError.message },
          });
          return NextResponse.json(
            { error: "Erro ao atualizar status" },
            { status: 500 }
          );
        }
      }

      logger.info("✅ Status de pagamento atualizado para 'active'", {
        action: "stripe_update_payment_status_success",
        userId,
        metadata: { sessionId },
      });

      return NextResponse.json({ success: true, message: "Pagamento confirmado" });
    } else {
      logger.warn("⚠️ Pagamento não confirmado", {
        action: "stripe_update_payment_status_not_paid",
        userId,
        metadata: { sessionId, payment_status: session.payment_status },
      });
      return NextResponse.json(
        { error: "Pagamento não confirmado", payment_status: session.payment_status },
        { status: 400 }
      );
    }
  } catch (error) {
    logger.error("❌ Erro ao atualizar status de pagamento", {
      action: "stripe_update_payment_status_error",
      metadata: {
        error: error instanceof Error ? error.message : String(error),
      },
    });
    return NextResponse.json(
      { error: "Erro interno ao verificar pagamento" },
      { status: 500 }
    );
  }
}

