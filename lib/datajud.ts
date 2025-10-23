import { ProcessoSearchResult } from "./types"
import { obterUrlTribunal, obterNomeTribunal } from "./tribunais"

/**
 * Busca processo diretamente na API do DataJud
 * Deve ser usado APENAS no servidor (API routes)
 */
export async function buscarProcessoDataJud(numeroProcesso: string): Promise<ProcessoSearchResult> {
  try {
    // Remove caracteres especiais do número do processo
    const numeroLimpo = numeroProcesso.replace(/\D/g, "");

    if (numeroLimpo.length !== 20) {
      return {
        success: false,
        error: "Número de processo inválido. Deve conter 20 dígitos.",
      };
    }

    // Obtém a URL do tribunal baseado no código no número do processo
    const apiUrl = obterUrlTribunal(numeroLimpo);

    // Usar variável de ambiente
    const apiKey = process.env.DATAJUD_API_KEY;
    
    if (!apiKey) {
      return {
        success: false,
        error: "DATAJUD_API_KEY não configurada",
      };
    }

    const query = {
      query: {
        match: {
          numeroProcesso: numeroLimpo,
        },
      },
    };

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `APIKey ${apiKey}`,
      },
      body: JSON.stringify(query),
    });

    if (!response.ok) {
      return {
        success: false,
        error: `Erro na API: ${response.status} - ${response.statusText}`,
      };
    }

    const data = await response.json();

    if (data.hits.total.value === 0) {
      return {
        success: false,
        error: "Processo não encontrado.",
      };
    }

    const processo = data.hits.hits[0]._source;

    // Adiciona o nome do tribunal se não estiver presente
    if (!processo.tribunal) {
      processo.tribunal = obterNomeTribunal(numeroLimpo);
    }

    return {
      success: true,
      processo,
    };
  } catch (error) {
    console.error("Erro ao buscar processo:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro desconhecido ao buscar processo.",
    };
  }
}

/**
 * Busca processo através da API route do Next.js
 * Deve ser usado APENAS no cliente (componentes React)
 */
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

