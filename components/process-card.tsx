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
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Dados Básicos do Processo */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Scale className="h-6 w-6" />
            Processo {formatarNumeroProcesso(processo.numeroProcesso)}
          </CardTitle>
          <CardDescription>
            Informações básicas do processo judicial
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {processo.classe && (
              <div className="flex items-start gap-2">
                <FileText className="h-5 w-5 mt-0.5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Classe</p>
                  <p className="text-sm text-muted-foreground">
                    {processo.classe.nome}
                  </p>
                </div>
              </div>
            )}

            {processo.tribunal && (
              <div className="flex items-start gap-2">
                <Building2 className="h-5 w-5 mt-0.5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Tribunal</p>
                  <p className="text-sm text-muted-foreground">
                    {processo.tribunal}
                  </p>
                </div>
              </div>
            )}

            {processo.dataAjuizamento && (
              <div className="flex items-start gap-2">
                <Calendar className="h-5 w-5 mt-0.5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Data de Ajuizamento</p>
                  <p className="text-sm text-muted-foreground">
                    {formatarData(processo.dataAjuizamento)}
                  </p>
                </div>
              </div>
            )}

            {processo.grau && (
              <div className="flex items-start gap-2">
                <Scale className="h-5 w-5 mt-0.5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Grau</p>
                  <p className="text-sm text-muted-foreground">
                    {processo.grau}
                  </p>
                </div>
              </div>
            )}
          </div>

          {processo.orgaoJulgador && (
            <div>
              <p className="text-sm font-medium mb-1">Órgão Julgador</p>
              <p className="text-sm text-muted-foreground">
                {processo.orgaoJulgador.nome}
              </p>
            </div>
          )}

          {processo.assuntos && processo.assuntos.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-2">Assuntos</p>
              <div className="flex flex-wrap gap-2">
                {processo.assuntos.map((assunto, index) => (
                  <Badge key={index} variant="secondary">
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
          <CardHeader>
            <CardTitle>Movimentações Processuais</CardTitle>
            <CardDescription>
              {processo.movimentos.length} movimentação(ões) encontrada(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {processo.movimentos.map((movimento, index) => (
                <div
                  key={index}
                  className="border-l-2 border-primary pl-4 py-2 hover:bg-muted/50 transition-colors rounded-r-lg"
                >
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{movimento.nome}</p>
                      {movimento.complementosTabelados &&
                        movimento.complementosTabelados.length > 0 && (
                          <div className="mt-2 space-y-1">
                            {movimento.complementosTabelados.map(
                              (complemento, idx) => (
                                <p
                                  key={idx}
                                  className="text-sm text-muted-foreground pl-4"
                                >
                                  • {complemento.descricao}
                                </p>
                              )
                            )}
                          </div>
                        )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground whitespace-nowrap">
                      <Calendar className="h-4 w-4" />
                      {formatarData(movimento.dataHora)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
