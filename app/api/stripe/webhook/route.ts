import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { logger } from "@/lib/logger";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    logger.error("Webhook signature verification failed", { error: err });
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        const plan = session.metadata?.plan;

        if (!userId || !plan) {
          throw new Error("Missing metadata");
        }

        // Atualizar plano do usuário
        const updateData: Record<string, any> = {
          selected_plan: plan,
          payment_status: "active",
          updated_at: new Date().toISOString(),
        };

        // Tentar adicionar IDs do Stripe se disponíveis (opcionais)
        if (session.customer) {
          updateData.stripe_customer_id = session.customer as string;
        }
        if (session.subscription) {
          updateData.stripe_subscription_id = session.subscription as string;
        }

        const { error: webhookError } = await supabaseAdmin
          .from("users")
          .update(updateData)
          .eq("auth_user_id", userId);

        // Se erro por coluna não existir, tentar novamente sem essas colunas
        if (webhookError && (webhookError.message.includes("stripe_customer_id") || 
            webhookError.message.includes("stripe_subscription_id"))) {
          logger.warn("⚠️ Colunas do Stripe não existem no webhook, atualizando apenas campos essenciais", {
            action: "webhook_fallback",
            userId,
          });

          await supabaseAdmin
            .from("users")
            .update({
              selected_plan: plan,
              payment_status: "active",
              updated_at: new Date().toISOString(),
            })
            .eq("auth_user_id", userId);
        } else if (webhookError) {
          logger.error("Erro ao atualizar usuário no webhook", {
            action: "webhook_update_error",
            userId,
            metadata: { error: webhookError.message },
          });
        }

        logger.info("Subscription activated", { userId, plan });
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        // Tentar buscar por stripe_customer_id (opcional)
        const { data: user } = await supabaseAdmin
          .from("users")
          .select("id, auth_user_id, stripe_customer_id")
          .eq("stripe_customer_id", customerId)
          .maybeSingle();

        if (!user) {
          logger.warn("Não foi possível encontrar usuário para atualização de assinatura", {
            action: "webhook_subscription_updated_no_user",
            metadata: { customerId },
          });
          break;
        }

        await supabaseAdmin
          .from("users")
          .update({
            payment_status: subscription.status,
            updated_at: new Date().toISOString(),
          })
          .eq("auth_user_id", user.auth_user_id);

        logger.info("Subscription updated", {
          userId: user.id,
          status: subscription.status,
        });
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        // Tentar buscar por stripe_customer_id (opcional)
        const { data: user } = await supabaseAdmin
          .from("users")
          .select("id, auth_user_id, stripe_customer_id")
          .eq("stripe_customer_id", customerId)
          .maybeSingle();

        // Se a coluna não existir, buscar de outra forma (implementar conforme necessário)
        // Por agora, só logar
        if (!user) {
          logger.warn("Não foi possível encontrar usuário para cancelamento", {
            action: "webhook_subscription_deleted_no_user",
            metadata: { customerId },
          });
          break;
        }

        await supabaseAdmin
          .from("users")
          .update({
            selected_plan: "free",
            payment_status: "cancelled",
            updated_at: new Date().toISOString(),
          })
          .eq("auth_user_id", user.auth_user_id);

        logger.info("Subscription cancelled", { userId: user.id });
        break;
      }

      default:
        logger.info("Unhandled event type", { type: event.type });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    logger.error("Webhook processing error", { error });
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}


