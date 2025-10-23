"use client";

import { useState, FormEvent } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

interface SearchFormProps {
  onSearch: (numeroProcesso: string) => void;
  isLoading: boolean;
}

export function SearchForm({ onSearch, isLoading }: SearchFormProps) {
  const [numeroProcesso, setNumeroProcesso] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (numeroProcesso.trim()) {
      onSearch(numeroProcesso.trim());
    }
  };

  const formatInput = (value: string) => {
    // Remove tudo que não é número
    const numeros = value.replace(/\D/g, "");

    // Limita a 20 dígitos
    const limitado = numeros.slice(0, 20);

    // Formata: NNNNNNN-DD.AAAA.J.TR.OOOO
    if (limitado.length <= 7) return limitado;
    if (limitado.length <= 9)
      return `${limitado.slice(0, 7)}-${limitado.slice(7)}`;
    if (limitado.length <= 13)
      return `${limitado.slice(0, 7)}-${limitado.slice(7, 9)}.${limitado.slice(
        9
      )}`;
    if (limitado.length <= 14)
      return `${limitado.slice(0, 7)}-${limitado.slice(7, 9)}.${limitado.slice(
        9,
        13
      )}.${limitado.slice(13)}`;
    if (limitado.length <= 16)
      return `${limitado.slice(0, 7)}-${limitado.slice(7, 9)}.${limitado.slice(
        9,
        13
      )}.${limitado.slice(13, 14)}.${limitado.slice(14)}`;
    return `${limitado.slice(0, 7)}-${limitado.slice(7, 9)}.${limitado.slice(
      9,
      13
    )}.${limitado.slice(13, 14)}.${limitado.slice(14, 16)}.${limitado.slice(
      16
    )}`;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatInput(e.target.value);
    setNumeroProcesso(formatted);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-3xl mx-auto">
      <div className="flex gap-3">
        <Input
          type="text"
          placeholder="Digite o número do processo (ex: 0000000-00.0000.0.00.0000)"
          value={numeroProcesso}
          onChange={handleChange}
          disabled={isLoading}
          className="flex-1"
        />
        <Button
          type="submit"
          disabled={isLoading || numeroProcesso.length < 20}
        >
          <Search className="h-4 w-4" />
          {isLoading ? "Buscando..." : "Buscar"}
        </Button>
      </div>
      <p className="text-sm text-muted-foreground mt-3 text-center">
        Informe o número CNJ com 20 dígitos
      </p>
    </form>
  );
}
