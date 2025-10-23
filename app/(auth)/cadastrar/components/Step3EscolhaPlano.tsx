"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface Plan {
  id: string;
  name: string;
  price: string;
  interval: string;
  badge?: string;
  features: string[];
}

const PLANS: Plan[] = [
  {
    id: "free",
    name: "FREE",
    price: "R$0",
    interval: "",
    features: ["✓ Básico", "✓ 5 consultas", "✓ Suporte"],
  },
  {
    id: "monthly",
    name: "MENSAL",
    price: "R$20",
    interval: "/mês",
    badge: "🏆 POPULAR",
    features: ["✓ Completo", "✓ Ilimitado", "✓ Suporte prioritário"],
  },
  {
    id: "annual",
    name: "ANUAL",
    price: "R$180",
    interval: "/ano",
    badge: "💎 MELHOR",
    features: ["✓ Completo", "✓ Ilimitado", "✓ Prioridade", "✓ 2 meses grátis"],
  },
];

interface Step3Props {
  selectedPlan: string;
  setSelectedPlan: (plan: string | undefined) => void;
}

export function Step3EscolhaPlano({
  selectedPlan,
  setSelectedPlan,
}: Step3Props) {
  const handleSelect = (planId: string) => {
    setSelectedPlan(planId);
  };

  return (
    <div className="w-full mx-auto space-y-6">
      {/* Grid de Planos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {PLANS.map((plan, index) => {
          const isSelected = selectedPlan === plan.id;

          return (
            <Card
              key={plan.id}
              className={cn(
                "relative p-6 cursor-pointer transition-all duration-300 hover:scale-105",
                isSelected && "ring-2 ring-primary shadow-lg",
                !isSelected && "hover:shadow-md"
              )}
              onClick={() => handleSelect(plan.id)}
            >
              {/* Badge */}
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-3 py-1 rounded-md text-xs font-medium shadow-md">
                  {plan.badge}
                </div>
              )}

              {/* Header */}
              <div className="text-center space-y-2 mb-6">
                <h3 className="text-xl font-semibold">{plan.name}</h3>
                <div>
                  <span className="text-3xl font-bold">{plan.price}</span>
                  <span className="text-sm text-muted-foreground">
                    {plan.interval}
                  </span>
                </div>
              </div>

              {/* Features */}
              <div className="space-y-2 mb-6">
                {plan.features.map((feature, i) => (
                  <p key={i} className="text-sm text-muted-foreground">
                    {feature}
                  </p>
                ))}
              </div>

              {/* Button */}
              <Button
                variant={isSelected ? "default" : "outline"}
                className="w-full"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelect(plan.id);
                }}
              >
                {isSelected ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Selecionado
                  </>
                ) : (
                  "Escolher"
                )}
              </Button>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
