"use client";

import { cn } from "@/lib/utils";

interface PasswordStrengthIndicatorProps {
  password: string;
}

interface Requirement {
  label: string;
  test: (pwd: string) => boolean;
}

const requirements: Requirement[] = [
  {
    label: "Letra maiúscula",
    test: (pwd) => /[A-Z]/.test(pwd),
  },
  {
    label: "Letra minúscula",
    test: (pwd) => /[a-z]/.test(pwd),
  },
  {
    label: "Número",
    test: (pwd) => /[0-9]/.test(pwd),
  },
  {
    label: "Mínimo 6 caracteres",
    test: (pwd) => pwd.length >= 6,
  },
];

export function PasswordStrengthIndicator({
  password,
}: PasswordStrengthIndicatorProps) {
  return (
    <div className="space-y-2 mt-2">
      {requirements.map((req, index) => {
        const isMet = req.test(password);

        return (
          <div
            key={index}
            className={cn(
              "flex items-center gap-2 text-sm transition-all duration-200",
              isMet ? "text-green-600" : "text-muted-foreground"
            )}
          >
            <div
              className={cn(
                "w-4 h-4 rounded-full flex items-center justify-center transition-all duration-200",
                isMet
                  ? "bg-green-600"
                  : "bg-muted border-2 border-muted-foreground"
              )}
            >
              {isMet && (
                <svg
                  className="w-3 h-3 text-white"
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
              )}
            </div>
            <span>{req.label}</span>
          </div>
        );
      })}
    </div>
  );
}

