export interface DataJudMovimento {
  dataHora: string
  nome: string
  complementosTabelados?: Array<{
    descricao: string
  }>
}

export interface DataJudProcesso {
  numeroProcesso: string
  classe?: {
    codigo: number
    nome: string
  }
  sistema?: {
    codigo: number
    nome: string
  }
  formato?: {
    codigo: number
    nome: string
  }
  tribunal?: string
  dataAjuizamento?: string
  grau?: string
  orgaoJulgador?: {
    codigo: number
    nome: string
  }
  assuntos?: Array<{
    codigo: number
    nome: string
  }>
  movimentos?: DataJudMovimento[]
  partes?: {
    autor?: string[]
    reu?: string[]
    [key: string]: string[] | undefined
  }
}

export interface DataJudResponse {
  hits: {
    total: {
      value: number
    }
    hits: Array<{
      _source: DataJudProcesso
    }>
  }
}

export interface ProcessoSearchResult {
  success: boolean
  processo?: DataJudProcesso
  error?: string
}

