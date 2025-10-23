import { z } from "zod";

// Schema para validação do número do processo
export const numeroProcessoSchema = z
  .string()
  .min(1, "Número do processo é obrigatório")
  .min(20, "Número do processo é inválido")
  .max(20, "Número do processo é inválido");

// Schema para adicionar um novo acompanhamento
export const addProcessoSchema = z.object({
  numero: numeroProcessoSchema,
  tribunal: z.string().min(1, "Tribunal é obrigatório"),
  apelido: z.string().optional(),
  notificar: z.boolean().default(true),
});

// Schema para editar acompanhamento
export const editProcessoSchema = z.object({
  apelido: z.string().optional(),
  notificar: z.boolean(),
});

// Types
export type AddProcessoInput = z.infer<typeof addProcessoSchema>;
export type EditProcessoInput = z.infer<typeof editProcessoSchema>;

// Type para o processo completo (vindo do banco)
export interface ProcessoAcompanhado {
  id: string;
  numero: string;
  tribunal: string;
  apelido?: string | null;
  notificar: boolean;
  criado_em: string;
  atualizado_em: string;
  created_at: string;
  updated_at: string;
  ultima_movimentacao?: {
    data: string;
    descricao: string;
  } | null;
  partes?: {
    autor?: string[];
    reu?: string[];
    [key: string]: string[] | undefined;
  } | null;
  // Campos adicionais do DataJud
  classe?: {
    codigo: number;
    nome: string;
  } | null;
  sistema?: {
    codigo: number;
    nome: string;
  } | null;
  formato?: {
    codigo: number;
    nome: string;
  } | null;
  dataAjuizamento?: string | null;
  grau?: string | null;
  orgaoJulgador?: {
    codigo: number;
    nome: string;
  } | null;
  assuntos?: Array<{
    codigo: number;
    nome: string;
  }> | null;
  movimentos?: Array<{
    dataHora: string;
    nome: string;
    complementosTabelados?: Array<{
      descricao: string;
    }>;
  }> | null;
}
