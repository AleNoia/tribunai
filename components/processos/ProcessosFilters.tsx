"use client";

import { useState, useEffect } from "react";
import { Search, Filter, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { ProcessoAcompanhado } from "@/lib/schemas/processo";

export interface ProcessosFiltersState {
  numero: string;
  tribunal: string;
  parte: string;
  notificacoes: "todas" | "ativas" | "desativadas";
}

interface ProcessosFiltersProps {
  processos: ProcessoAcompanhado[];
  onFilterChange: (filters: ProcessosFiltersState) => void;
}

export function ProcessosFilters({
  processos,
  onFilterChange,
}: ProcessosFiltersProps) {
  const [filters, setFilters] = useState<ProcessosFiltersState>({
    numero: "",
    tribunal: "todos",
    parte: "",
    notificacoes: "todas",
  });

  const [showFilters, setShowFilters] = useState(false);

  // Extrair tribunais únicos
  const tribunaisUnicos = Array.from(
    new Set(processos.map((p) => p.tribunal))
  ).sort();

  // Atualizar filtros quando mudarem
  useEffect(() => {
    onFilterChange(filters);
  }, [filters, onFilterChange]);

  const handleFilterChange = (
    key: keyof ProcessosFiltersState,
    value: string
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      numero: "",
      tribunal: "todos",
      parte: "",
      notificacoes: "todas",
    });
  };

  const hasActiveFilters =
    filters.numero !== "" ||
    filters.tribunal !== "todos" ||
    filters.parte !== "" ||
    filters.notificacoes !== "todas";

  const activeFiltersCount = [
    filters.numero,
    filters.tribunal !== "todos" ? filters.tribunal : "",
    filters.parte,
    filters.notificacoes !== "todas" ? filters.notificacoes : "",
  ].filter(Boolean).length;

  return (
    <div className="space-y-4">
      {/* Search Bar & Filter Toggle */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Busca por número */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por número do processo..."
            value={filters.numero}
            onChange={(e) => handleFilterChange("numero", e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Botão Toggle Filtros */}
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="relative"
        >
          <Filter className="h-4 w-4 mr-2" />
          Filtros
          {activeFiltersCount > 0 && (
            <Badge
              variant="default"
              className="ml-2 h-5 min-w-5 rounded-full px-1 text-xs"
            >
              {activeFiltersCount}
            </Badge>
          )}
        </Button>

        {/* Limpar Filtros */}
        {hasActiveFilters && (
          <Button variant="ghost" size="icon" onClick={clearFilters}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Expanded Filters */}
      {showFilters && (
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Filtro por Tribunal */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Tribunal</label>
                <Select
                  value={filters.tribunal}
                  onValueChange={(value) =>
                    handleFilterChange("tribunal", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os tribunais" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os tribunais</SelectItem>
                    {tribunaisUnicos.map((tribunal) => (
                      <SelectItem key={tribunal} value={tribunal}>
                        {tribunal}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Filtro por Parte */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Parte</label>
                <div className="relative">
                  <Input
                    placeholder="Nome do autor ou réu..."
                    value={filters.parte}
                    onChange={(e) =>
                      handleFilterChange("parte", e.target.value)
                    }
                  />
                </div>
              </div>

              {/* Filtro por Notificações */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Notificações</label>
                <Select
                  value={filters.notificacoes}
                  onValueChange={(value: any) =>
                    handleFilterChange("notificacoes", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todas">Todas</SelectItem>
                    <SelectItem value="ativas">Ativas</SelectItem>
                    <SelectItem value="desativadas">Desativadas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">Filtros ativos:</span>
          {filters.numero && (
            <Badge variant="secondary" className="gap-1">
              Número: {filters.numero}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => handleFilterChange("numero", "")}
              />
            </Badge>
          )}
          {filters.tribunal !== "todos" && (
            <Badge variant="secondary" className="gap-1">
              Tribunal: {filters.tribunal}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => handleFilterChange("tribunal", "todos")}
              />
            </Badge>
          )}
          {filters.parte && (
            <Badge variant="secondary" className="gap-1">
              Parte: {filters.parte}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => handleFilterChange("parte", "")}
              />
            </Badge>
          )}
          {filters.notificacoes !== "todas" && (
            <Badge variant="secondary" className="gap-1">
              Notificações:{" "}
              {filters.notificacoes === "ativas" ? "Ativas" : "Desativadas"}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => handleFilterChange("notificacoes", "todas")}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
