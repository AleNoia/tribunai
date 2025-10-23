import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";
import { logger } from "@/lib/logger";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia",
});

export async function POST(req: NextRequest) {
  try {
    logger.info("📡 API Stripe Checkout - Requisição recebida", {
      action: "stripe_checkout_start",
    });

    const supabase = await createClient();

    logger.info("🔍 Verificando autenticação do usuário", {
      action: "stripe_checkout_auth_check",
    });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      logger.error("❌ Usuário não autenticado", {
        action: "stripe_checkout_no_user",
      });
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    logger.info("✅ Usuário autenticado", {
      action: "stripe_checkout_user_found",
      userId: user.id,
      metadata: { email: user.email },
    });

    const { plan } = await req.json();

    logger.info("📋 Plano recebido", {
      action: "stripe_checkout_plan_received",
      metadata: { plan },
    });

    if (!plan || !["monthly", "annual"].includes(plan)) {
      logger.error("❌ Plano inválido", {
        action: "stripe_checkout_invalid_plan",
        metadata: { plan },
      });
      return NextResponse.json({ error: "Plano inválido" }, { status: 400 });
    }

    const priceId =
      plan === "monthly"
        ? process.env.STRIPE_PRICE_MONTHLY!
        : process.env.STRIPE_PRICE_ANNUAL!;

    logger.info("💰 Price ID definido", {
      action: "stripe_checkout_price_id",
      metadata: { plan, priceId },
    });

    if (!priceId) {
      logger.error("❌ STRIPE_PRICE_* não configurado no .env.local", {
        action: "stripe_checkout_no_price_id",
        metadata: { plan },
      });
      return NextResponse.json(
        { error: "Configuração de preços do Stripe não encontrada" },
        { status: 500 }
      );
    }

    // Construir URL base a partir dos headers
    const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
    const host = req.headers.get("host") || "localhost:3000";
    const baseUrl = process.env.NEXT_PUBLIC_URL || `${protocol}://${host}`;

    logger.info("🔨 Criando sessão do Stripe...", {
      action: "stripe_checkout_creating_session",
      metadata: {
        plan,
        priceId,
        email: user.email,
        userId: user.id,
        baseUrl,
      },
    });

    const session = await stripe.checkout.sessions.create({
      customer_email: user.email,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${baseUrl}/sucesso?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/cadastrar`,
      metadata: {
        userId: user.id,
        plan,
      },
    });

    logger.info("✅ Sessão do Stripe criada com sucesso", {
      action: "stripe_checkout_session_created",
      metadata: {
        sessionId: session.id,
        url: session.url,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    logger.error("❌ Erro ao criar sessão do Stripe", {
      action: "stripe_checkout_error",
      metadata: {
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      },
    });
    console.error("Erro ao criar sessão:", error);
    return NextResponse.json(
      { error: "Erro ao criar sessão de pagamento" },
      { status: 500 }
    );
  }
}


