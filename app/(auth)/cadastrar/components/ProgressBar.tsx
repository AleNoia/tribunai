"use client";

import { cn } from "@/lib/utils";

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

const STEPS = [
  { number: 1, label: "Dados" },
  { number: 2, label: "Email" },
  { number: 3, label: "Plano" },
  { number: 4, label: "Pagamento" },
];

export function ProgressBar({ currentStep, totalSteps }: ProgressBarProps) {
  return (
    <div className="w-full max-w-2xl mx-auto mb-12">
      {/* Progress Line */}
      <div className="relative">
        {/* Background Line */}
        <div className="absolute top-5 left-0 w-full h-0.5 bg-border" />

        {/* Active Line */}
        <div
          className="absolute top-5 left-0 h-0.5 bg-primary transition-all duration-500 ease-out"
          style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
        />

        {/* Steps */}
        <div className="relative flex justify-between">
          {STEPS.map((step) => {
            const isCompleted = step.number < currentStep;
            const isCurrent = step.number === currentStep;
            const isFuture = step.number > currentStep;

            return (
              <div key={step.number} className="flex flex-col items-center">
                {/* Circle */}
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all duration-300",
                    isCompleted &&
                      "bg-primary text-primary-foreground shadow-md",
                    isCurrent &&
                      "bg-primary text-primary-foreground shadow-lg ring-4 ring-primary/20 scale-110",
                    isFuture &&
                      "bg-muted text-muted-foreground border-2 border-border"
                  )}
                >
                  {isCompleted ? (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    step.number
                  )}
                </div>

                {/* Label */}
                <span
                  className={cn(
                    "mt-2 text-xs font-medium transition-colors duration-300",
                    (isCompleted || isCurrent) && "text-foreground",
                    isFuture && "text-muted-foreground"
                  )}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

