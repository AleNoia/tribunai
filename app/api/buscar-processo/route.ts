import { NextRequest, NextResponse } from "next/server";
import { obterUrlTribunal, obterNomeTribunal } from "@/lib/tribunais";

export async function POST(request: NextRequest) {
  try {
    const { numeroProcesso } = await request.json();

    // Remove caracteres especiais do número do processo
    const numeroLimpo = numeroProcesso.replace(/\D/g, "");

    if (numeroLimpo.length !== 20) {
      return NextResponse.json(
        {
          success: false,
          error: "Número de processo inválido. Deve conter 20 dígitos.",
        },
        { status: 400 }
      );
    }

    // Obtém a URL do tribunal baseado no código no número do processo
    const apiUrl = obterUrlTribunal(numeroLimpo);

    const query = {
      query: {
        match: {
          numeroProcesso: numeroLimpo,
        },
      },
    };

    // ✅ SOLUÇÃO: Usar variável de ambiente
    const apiKey = process.env.DATAJUD_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          error: "DATAJUD_API_KEY não configurada",
        },
        { status: 500 }
      );
    }

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `APIKey ${apiKey}`,
      },
      body: JSON.stringify(query),
    });

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          error: `Erro na API: ${response.status} - ${response.statusText}`,
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    if (data.hits.total.value === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Processo não encontrado.",
        },
        { status: 404 }
      );
    }

    const processo = data.hits.hits[0]._source;

    // Adiciona o nome do tribunal se não estiver presente
    if (!processo.tribunal) {
      processo.tribunal = obterNomeTribunal(numeroLimpo);
    }

    return NextResponse.json({
      success: true,
      processo,
    });
  } catch (error) {
    console.error("Erro ao buscar processo:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Erro desconhecido ao buscar processo.",
      },
      { status: 500 }
    );
  }
}

