import { DataJudProcesso } from "@/lib/types";
import { formatarNumeroProcesso, formatarData } from "@/lib/datajud";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Scale, Building2, FileText } from "lucide-react";

interface ProcessCardProps {
  processo: DataJudProcesso;
}

export function ProcessCard({ processo }: ProcessCardProps) {
  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* Dados Básicos do Processo */}
      <Card>
        <CardHeader className="space-y-3">
          <CardTitle className="text-xl font-semibold flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-md">
              <Scale className="h-5 w-5 text-foreground" aria-hidden="true" />
            </div>
            <span>
              Processo {formatarNumeroProcesso(processo.numeroProcesso)}
            </span>
          </CardTitle>
          <CardDescription>
            Informações básicas do processo judicial
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {processo.classe && (
              <div className="flex items-start gap-3">
                <div className="p-2 bg-muted rounded-md">
                  <FileText
                    className="h-4 w-4 text-muted-foreground"
                    aria-hidden="true"
                  />
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">
                    Classe
                  </p>
                  <p className="text-base font-medium">
                    {processo.classe.nome}
                  </p>
                </div>
              </div>
            )}

            {processo.tribunal && (
              <div className="flex items-start gap-3">
                <div className="p-2 bg-muted rounded-md">
                  <Building2
                    className="h-4 w-4 text-muted-foreground"
                    aria-hidden="true"
                  />
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">
                    Tribunal
                  </p>
                  <p className="text-base font-medium">{processo.tribunal}</p>
                </div>
              </div>
            )}

            {processo.dataAjuizamento && (
              <div className="flex items-start gap-3">
                <div className="p-2 bg-muted rounded-md">
                  <Calendar
                    className="h-4 w-4 text-muted-foreground"
                    aria-hidden="true"
                  />
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">
                    Data de Ajuizamento
                  </p>
                  <p className="text-base font-medium">
                    {formatarData(processo.dataAjuizamento)}
                  </p>
                </div>
              </div>
            )}

            {processo.grau && (
              <div className="flex items-start gap-3">
                <div className="p-2 bg-muted rounded-md">
                  <Scale
                    className="h-4 w-4 text-muted-foreground"
                    aria-hidden="true"
                  />
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">
                    Grau
                  </p>
                  <p className="text-base font-medium">{processo.grau}</p>
                </div>
              </div>
            )}
          </div>

          {processo.orgaoJulgador && (
            <div className="pt-4">
              <p className="text-xs font-medium text-muted-foreground mb-2">
                Órgão Julgador
              </p>
              <p className="text-base font-medium">
                {processo.orgaoJulgador.nome}
              </p>
            </div>
          )}

          {processo.assuntos && processo.assuntos.length > 0 && (
            <div className="pt-4">
              <p className="text-xs font-medium text-muted-foreground mb-3">
                Assuntos
              </p>
              <div className="flex flex-wrap gap-2">
                {processo.assuntos.map((assunto, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="font-normal"
                  >
                    {assunto.nome}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Movimentações */}
      {processo.movimentos && processo.movimentos.length > 0 && (
        <Card>
          <CardHeader className="space-y-3">
            <CardTitle className="text-xl font-semibold">
              Movimentações Processuais
            </CardTitle>
            <CardDescription>
              {processo.movimentos.length} movimentação(ões) encontrada(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {processo.movimentos.map((movimento, index) => (
                <article
                  key={index}
                  className="border-l-2 border-primary pl-4 py-3 hover:bg-muted/50 transition-colors duration-200 rounded-r-md"
                >
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex-1">
                      <p className="font-medium text-base">{movimento.nome}</p>
                      {movimento.complementosTabelados &&
                        movimento.complementosTabelados.length > 0 && (
                          <ul className="mt-3 space-y-1 list-none">
                            {movimento.complementosTabelados.map(
                              (complemento, idx) => (
                                <li
                                  key={idx}
                                  className="text-sm text-muted-foreground pl-4"
                                >
                                  • {complemento.descricao}
                                </li>
                              )
                            )}
                          </ul>
                        )}
                    </div>
                    <time className="flex items-center gap-2 text-xs text-muted-foreground whitespace-nowrap bg-muted px-3 py-1.5 rounded-md">
                      <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
                      {formatarData(movimento.dataHora)}
                    </time>
                  </div>
                </article>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
