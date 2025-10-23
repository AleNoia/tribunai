"use client";

import { useState } from "react";
import { SearchForm } from "@/components/search-form";
import { ProcessCard } from "@/components/process-card";
import { ProcessSkeleton } from "@/components/process-skeleton";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserNav } from "@/components/auth/user-nav";
import { NotificationBell } from "@/components/notificacoes/NotificationBell";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { buscarProcesso } from "@/lib/datajud";
import { DataJudProcesso } from "@/lib/types";
import { AlertCircle, Scale } from "lucide-react";

export default function Home() {
  const [processo, setProcesso] = useState<DataJudProcesso | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async (numeroProcesso: string) => {
    setIsLoading(true);
    setError(null);
    setProcesso(null);

    const result = await buscarProcesso(numeroProcesso);

    if (result.success && result.processo) {
      setProcesso(result.processo);
    } else {
      setError(result.error || "Erro ao buscar processo");
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        {/* Header */}
        <header className="flex items-center justify-between mb-16 pb-6 border-b border-border">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-md">
              <Scale className="h-6 w-6 text-foreground" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold">DataJud CNJ</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Consulta Processual
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <NotificationBell />
            <UserNav />
            <ThemeToggle />
          </div>
        </header>

        {/* Search Section */}
        <div className="mb-8">
          <SearchForm onSearch={handleSearch} isLoading={isLoading} />
        </div>

        {/* Results */}
        <div className="mt-8">
          {isLoading && <ProcessSkeleton />}

          {error && !isLoading && (
            <div className="w-full max-w-2xl mx-auto">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Erro</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </div>
          )}

          {processo && !isLoading && <ProcessCard processo={processo} />}

          {!processo && !error && !isLoading && (
            <div className="text-center text-muted-foreground mt-24 px-4">
              <div className="p-6 bg-muted/50 rounded-lg inline-block mb-4">
                <Scale
                  className="h-12 w-12 mx-auto text-muted-foreground/40"
                  aria-hidden="true"
                />
              </div>
              <p className="text-base font-medium text-foreground">
                Digite um número de processo para iniciar a consulta
              </p>
              <p className="text-sm mt-2">
                Utilize a API Pública do DataJud (CNJ)
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-24 py-6 border-t border-border">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>
            Powered by DataJud - API Pública do Conselho Nacional de Justiça
          </p>
        </div>
      </footer>
    </div>
  );
}
