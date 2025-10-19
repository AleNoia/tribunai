"use client";

import { useState } from "react";
import { SearchForm } from "@/components/search-form";
import { ProcessCard } from "@/components/process-card";
import { ProcessSkeleton } from "@/components/process-skeleton";
import { ThemeToggle } from "@/components/theme-toggle";
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
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-3">
            <Scale className="h-8 w-8" />
            <div>
              <h1 className="text-3xl font-bold">DataJud CNJ</h1>
              <p className="text-sm text-muted-foreground">
                Consulta Processual
              </p>
            </div>
          </div>
          <ThemeToggle />
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
            <div className="text-center text-muted-foreground mt-16">
              <Scale className="h-16 w-16 mx-auto mb-4 opacity-20" />
              <p className="text-lg">
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
      <footer className="mt-16 py-6 border-t">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>
            Powered by DataJud - API Pública do Conselho Nacional de Justiça
          </p>
        </div>
      </footer>
    </div>
  );
}
