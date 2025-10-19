import { ProcessoSearchResult } from "./types"

export async function buscarProcesso(numeroProcesso: string): Promise<ProcessoSearchResult> {
  try {
    // Chama a API Route do Next.js ao invés de chamar a API do DataJud diretamente
    // Isso evita problemas de CORS, pois a requisição é feita no servidor
    const response = await fetch("/api/buscar-processo", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ numeroProcesso }),
    })

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Erro ao buscar processo:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro desconhecido ao buscar processo."
    }
  }
}

export function formatarNumeroProcesso(numero: string): string {
  const limpo = numero.replace(/\D/g, "")
  if (limpo.length !== 20) return numero
  
  // Formato: NNNNNNN-DD.AAAA.J.TR.OOOO
  return `${limpo.slice(0, 7)}-${limpo.slice(7, 9)}.${limpo.slice(9, 13)}.${limpo.slice(13, 14)}.${limpo.slice(14, 16)}.${limpo.slice(16, 20)}`
}

export function formatarData(dataISO: string): string {
  if (!dataISO) return "Data não informada"
  
  try {
    const data = new Date(dataISO)
    return data.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    })
  } catch {
    return dataISO
  }
}

