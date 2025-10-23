# Relatório de Acerto de Viagem - Documento Técnico de Implementação

## 1. Visão Geral do Sistema

### 1.1 Objetivo

Desenvolver um novo Relatório de Acerto de Viagem para otimizar o processo e facilitar o controle operacional, baseado no Relatório Analítico de Abastecimento existente, adicionando novos campos e funcionalidades específicas para o acerto de viagem.

### 1.2 Tecnologias Utilizadas

- **Frontend**: React + Next.js / Vue.js (conforme stack atual)
- **Backend**: API REST
- **Banco de Dados**: PostgreSQL / MySQL (conforme stack atual)
- **Exportação**: Bibliotecas para PDF (jsPDF), XLSX (ExcelJS), CSV
- **Tabelas**: TanStack Table / AG Grid ou similar
- **UI Components**: Biblioteca de componentes atual do sistema

### 1.3 Módulos Impactados

- **Relatórios** (novo relatório)
- **Transações de Abastecimento** (flags de pagamento)
- **Veículos** (visualização de dados consolidados)

---

## 2. Fluxos do Sistema

### 2.1 Fluxo Principal - Geração de Relatório

```
┌─────────────────────────────────────────────────────────────────────┐
│                    FLUXO: GERAR RELATÓRIO DE ACERTO                 │
└─────────────────────────────────────────────────────────────────────┘

1. Usuário acessa menu "Relatórios"
   └─> Clica em "Acerto de Viagens"

2. Sistema exibe tela com filtros vazios
   └─> Aguarda preenchimento dos filtros obrigatórios

3. Usuário preenche filtros
   ├─> Data Inicial (obrigatório)
   ├─> Data Final (obrigatório)
   ├─> Clientes (opcional)
   ├─> Estabelecimentos (opcional)
   ├─> Filiais (opcional)
   ├─> Operações (opcional)
   ├─> Combustíveis (opcional)
   ├─> Veículos (opcional)
   ├─> Motoristas (opcional)
   ├─> Centros de Custo (opcional)
   ├─> Estado (opcional)
   ├─> Cidade (opcional)
   ├─> Número de Frota (opcional)
   ├─> Tipos de Bomba (default: Todas)
   ├─> Com Nota Fiscal? (default: Todas)
   ├─> Tipo de Transação (default: Todas)
   ├─> Tempo em Operação (checkbox)
   └─> Status de Pagamento (default: Todas)

4. Usuário clica em "Gerar"

5. Sistema valida filtros
   ├─> ✗ Falta data inicial/final → Mostra erro
   └─> ✓ Filtros válidos → Continua

6. Sistema busca dados no backend
   ├─> Aplica todos os filtros
   ├─> Calcula totalizadores
   ├─> Agrupa transações por veículo
   └─> Calcula indicadores por veículo

7. Sistema renderiza tabela principal
   └─> Exibe resumo por veículo (linhas colapsadas)

8. Sistema exibe indicadores gerais no cabeçalho
   ├─> Total de Litragem
   ├─> Valor Total
   ├─> Tempo em Operação
   ├─> Média
   └─> Custo/U.M

9. Relatório pronto para interação
   └─> Usuário pode expandir veículos, alterar flags, exportar
```

### 2.2 Fluxo - Expandir Detalhes do Veículo

```
┌─────────────────────────────────────────────────────────────────────┐
│              FLUXO: EXPANDIR TRANSAÇÕES DE UM VEÍCULO               │
└─────────────────────────────────────────────────────────────────────┘

1. Usuário visualiza tabela principal com veículos

2. Usuário clica no ícone de expansão de um veículo
   └─> Ícone muda de "▶" para "▼"

3. Sistema carrega transações do veículo (se ainda não carregadas)
   └─> Pode ser lazy loading ou já vir no payload inicial

4. Sistema renderiza tabela aninhada logo abaixo da linha
   └─> Exibe todas as transações com detalhes

5. Tabela aninhada mostra colunas:
   ├─> Flag de Status (Pago/Não Pago)
   ├─> Transação
   ├─> Estabelecimento
   ├─> Cidade
   ├─> Motorista
   ├─> Hodômetro/Horímetro
   ├─> U.M
   ├─> Litragem
   ├─> Combustível
   ├─> Preço Transação
   ├─> Preço Negociado
   ├─> Valor Total
   ├─> Economia em Litros
   ├─> Economia em Reais
   ├─> Número NFe
   ├─> Tempo em Operação
   ├─> U.M
   ├─> Média
   ├─> Custo/U.M
   └─> Hodômetro

6. Usuário pode:
   ├─> Alterar flags de pagamento
   ├─> Visualizar detalhes de cada transação
   └─> Colapsar novamente clicando no ícone
```

### 2.3 Fluxo - Alterar Status de Pagamento

```
┌─────────────────────────────────────────────────────────────────────┐
│              FLUXO: ALTERAR FLAG DE PAGAMENTO                       │
└─────────────────────────────────────────────────────────────────────┘

1. Usuário visualiza transações expandidas de um veículo

2. Usuário clica na flag de status de uma transação
   └─> Flag atual: 🟢 Pago ou 🔴 Não Pago

3. Sistema abre modal de confirmação
   └─> Título: "Alterar Status de Pagamento"

4. Modal exibe:
   ├─> Informação da transação
   ├─> Status atual
   ├─> Radio buttons ou Checkbox:
   │   ├─> ⚪ Pago
   │   └─> ⚪ Não Pago
   └─> Botões:
       ├─> [Cancelar]
       └─> [Confirmar]

5. Usuário seleciona novo status

6. Usuário clica em "Confirmar"

7. Sistema atualiza status no backend
   ├─> Salva novo status
   ├─> Registra data/hora da alteração
   ├─> Registra usuário responsável
   └─> Retorna sucesso

8. Sistema atualiza interface
   ├─> Muda cor da flag visualmente
   ├─> Recalcula totalizadores (se filtro "Pagas" ativo)
   ├─> Atualiza indicadores gerais
   └─> Fecha modal

9. Sistema mostra toast de sucesso
   └─> "Status atualizado com sucesso"

10. Se usuário clicar em "Cancelar"
    └─> Fecha modal sem fazer alterações
```

### 2.4 Fluxo - Aplicar Filtro de Status de Pagamento

```
┌─────────────────────────────────────────────────────────────────────┐
│            FLUXO: FILTRAR POR STATUS DE PAGAMENTO                   │
└─────────────────────────────────────────────────────────────────────┘

1. Relatório já está gerado e visível

2. Usuário altera filtro "Status de Pagamento"
   ├─> Opções: Todas | Pagas | Não Pagas
   └─> Seleciona "Pagas"

3. Usuário clica em "Gerar" novamente
   (ou sistema aplica automaticamente)

4. Sistema recarrega dados
   └─> Filtra apenas transações com status "Pago"

5. Sistema recalcula:
   ├─> Totalizadores por veículo
   ├─> Indicadores gerais
   └─> Remove veículos sem transações "Pagas"

6. Sistema atualiza tabela
   └─> Mostra apenas dados filtrados

7. Flags visíveis são todas verdes (Pagas)
```

### 2.5 Fluxo - Exportar Relatório

```
┌─────────────────────────────────────────────────────────────────────┐
│                  FLUXO: EXPORTAR RELATÓRIO                          │
└─────────────────────────────────────────────────────────────────────┘

1. Relatório está gerado e visível

2. Usuário clica em botão "Exportar"
   └─> Dropdown abre com opções:
       ├─> 📄 Exportar PDF
       ├─> 📊 Exportar XLSX
       └─> 📋 Exportar CSV

3. Usuário seleciona formato (ex: XLSX)

4. Sistema coleta dados visíveis na tela
   ├─> Respeita filtros aplicados
   ├─> Inclui apenas colunas visíveis
   ├─> Inclui totalizadores
   └─> Inclui indicadores gerais

5. Sistema gera arquivo
   ├─> PDF: Tabela formatada com quebras de página
   ├─> XLSX: Planilha com fórmulas e formatação
   └─> CSV: Dados tabulados simples

6. Sistema inicia download do arquivo
   └─> Nome: "Acerto_Viagem_[DataInicio]_[DataFim].[ext]"

7. Sistema mostra toast de sucesso
   └─> "Relatório exportado com sucesso"
```

---

## 3. Estrutura de Dados

### 3.1 Resposta da API - Estrutura JSON

```json
{
  "success": true,
  "data": {
    "indicadores_gerais": {
      "total_litragem": 15234.5,
      "valor_total": 85420.75,
      "tempo_total_operacao": 1250.5,
      "unidade_medida_tempo": "horas",
      "media_geral": 12.18,
      "custo_por_unidade": 68.34
    },
    "veiculos": [
      {
        "id": "uuid-veiculo-1",
        "cliente": "Empresa XYZ Ltda",
        "placa": "ABC-1234",
        "marca": "Mercedes-Benz",
        "modelo": "Actros 2651",
        "cor": "Branco",
        "descricao": "Cavalo Mecânico",
        "consumo_arla": 145.3,
        "totalizadores": {
          "total_litragem": 2500.0,
          "valor_total": 14250.0,
          "tempo_operacao": 180.5,
          "unidade_medida": "horas",
          "media": 13.85,
          "custo_por_unidade": 78.95
        },
        "transacoes": [
          {
            "id": "uuid-transacao-1",
            "transacao_codigo": "TRX-2024-001234",
            "estabelecimento": "Posto Shell BR-101",
            "cidade": "São Paulo",
            "uf": "SP",
            "motorista": "João da Silva",
            "hodometro_horimetro": 125430,
            "unidade_medida_hodometro": "km",
            "litragem": 350.0,
            "combustivel": "Diesel S10",
            "preco_transacao": 5.85,
            "preco_negociado": 5.75,
            "valor_total": 2012.5,
            "economia_litros": 35.0,
            "economia_reais": 201.25,
            "numero_nfe": "123456789012345678901234567890123456789012344",
            "tempo_operacao": 25.5,
            "unidade_medida_tempo": "horas",
            "media_consumo": 13.73,
            "custo_por_unidade": 78.92,
            "hodometro": 125430,
            "status_pagamento": "pago",
            "data_pagamento": "2024-10-15T14:30:00Z",
            "usuario_alteracao": "usuario@empresa.com",
            "data_alteracao_status": "2024-10-15T14:30:00Z",
            "data_transacao": "2024-10-10T08:15:00Z"
          }
        ]
      }
    ],
    "filtros_aplicados": {
      "data_inicio": "2024-10-01",
      "data_fim": "2024-10-31",
      "clientes": ["Empresa XYZ Ltda"],
      "status_pagamento": "todas"
    },
    "total_veiculos": 45,
    "total_transacoes": 523
  }
}
```

---

## 4. Alterações no Banco de Dados

### 4.1 Nova Coluna na Tabela de Transações

```sql
-- Migration: add_payment_status_to_transactions.sql

ALTER TABLE transacoes_abastecimento
ADD COLUMN status_pagamento VARCHAR(20) DEFAULT 'nao_pago',
ADD COLUMN data_pagamento TIMESTAMP,
ADD COLUMN usuario_alteracao_status VARCHAR(255),
ADD COLUMN data_alteracao_status TIMESTAMP;

-- Índice para otimização de queries
CREATE INDEX idx_transacoes_status_pagamento
ON transacoes_abastecimento(status_pagamento);

-- Check constraint para garantir valores válidos
ALTER TABLE transacoes_abastecimento
ADD CONSTRAINT chk_status_pagamento
CHECK (status_pagamento IN ('pago', 'nao_pago'));

-- Comentários para documentação
COMMENT ON COLUMN transacoes_abastecimento.status_pagamento
IS 'Status de pagamento da transação: pago ou nao_pago';

COMMENT ON COLUMN transacoes_abastecimento.data_pagamento
IS 'Data em que o pagamento foi confirmado';

COMMENT ON COLUMN transacoes_abastecimento.usuario_alteracao_status
IS 'Usuário que realizou a última alteração do status';

COMMENT ON COLUMN transacoes_abastecimento.data_alteracao_status
IS 'Data/hora da última alteração de status';
```

### 4.2 Tabela de Auditoria (Opcional mas Recomendado)

```sql
-- Migration: create_payment_status_audit_log.sql

CREATE TABLE auditoria_status_pagamento (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transacao_id UUID NOT NULL,
  status_anterior VARCHAR(20),
  status_novo VARCHAR(20) NOT NULL,
  usuario VARCHAR(255) NOT NULL,
  data_alteracao TIMESTAMP DEFAULT NOW(),
  ip_origem VARCHAR(45),
  observacao TEXT,

  CONSTRAINT fk_transacao
    FOREIGN KEY (transacao_id)
    REFERENCES transacoes_abastecimento(id)
    ON DELETE CASCADE
);

-- Índices
CREATE INDEX idx_audit_transacao ON auditoria_status_pagamento(transacao_id);
CREATE INDEX idx_audit_data ON auditoria_status_pagamento(data_alteracao);
CREATE INDEX idx_audit_usuario ON auditoria_status_pagamento(usuario);

-- Comentários
COMMENT ON TABLE auditoria_status_pagamento
IS 'Registro de auditoria de alterações de status de pagamento';
```

### 4.3 Trigger para Auditoria Automática

```sql
-- Migration: create_trigger_audit_payment_status.sql

CREATE OR REPLACE FUNCTION audit_payment_status_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Registra mudança apenas se o status foi realmente alterado
  IF (TG_OP = 'UPDATE' AND OLD.status_pagamento IS DISTINCT FROM NEW.status_pagamento) THEN
    INSERT INTO auditoria_status_pagamento (
      transacao_id,
      status_anterior,
      status_novo,
      usuario,
      observacao
    ) VALUES (
      NEW.id,
      OLD.status_pagamento,
      NEW.status_pagamento,
      NEW.usuario_alteracao_status,
      CONCAT('Status alterado de ', OLD.status_pagamento, ' para ', NEW.status_pagamento)
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_audit_payment_status
  AFTER UPDATE ON transacoes_abastecimento
  FOR EACH ROW
  EXECUTE FUNCTION audit_payment_status_change();
```

---

## 5. APIs Necessárias

### 5.1 API: `/api/relatorios/acerto-viagem` (GET)

**Arquivo**: `app/api/relatorios/acerto-viagem/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// Schema de validação
const RelatorioFilterSchema = z.object({
  data_inicio: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  data_fim: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  clientes: z.array(z.string()).optional(),
  estabelecimentos: z.array(z.string()).optional(),
  filiais: z.array(z.string()).optional(),
  operacoes: z.array(z.string()).optional(),
  combustiveis: z.array(z.string()).optional(),
  veiculos: z.array(z.string()).optional(),
  motoristas: z.array(z.string()).optional(),
  centros_custo: z.array(z.string()).optional(),
  estados: z.array(z.string()).optional(),
  cidades: z.array(z.string()).optional(),
  numero_frota: z.string().optional(),
  tipo_bomba: z.enum(["todas", "internas", "externas"]).default("todas"),
  com_nota_fiscal: z.enum(["todas", "sim", "nao"]).default("todas"),
  tipo_transacao: z.enum(["todas", "manual", "compra"]).default("todas"),
  tempo_operacao: z.boolean().default(false),
  status_pagamento: z.enum(["todas", "pagas", "nao_pagas"]).default("todas"),
});

export async function GET(req: NextRequest) {
  try {
    // Extrair query params
    const searchParams = req.nextUrl.searchParams;
    const filters = {
      data_inicio: searchParams.get("data_inicio"),
      data_fim: searchParams.get("data_fim"),
      clientes: searchParams.getAll("clientes[]"),
      estabelecimentos: searchParams.getAll("estabelecimentos[]"),
      filiais: searchParams.getAll("filiais[]"),
      operacoes: searchParams.getAll("operacoes[]"),
      combustiveis: searchParams.getAll("combustiveis[]"),
      veiculos: searchParams.getAll("veiculos[]"),
      motoristas: searchParams.getAll("motoristas[]"),
      centros_custo: searchParams.getAll("centros_custo[]"),
      estados: searchParams.getAll("estados[]"),
      cidades: searchParams.getAll("cidades[]"),
      numero_frota: searchParams.get("numero_frota"),
      tipo_bomba: searchParams.get("tipo_bomba") || "todas",
      com_nota_fiscal: searchParams.get("com_nota_fiscal") || "todas",
      tipo_transacao: searchParams.get("tipo_transacao") || "todas",
      tempo_operacao: searchParams.get("tempo_operacao") === "true",
      status_pagamento: searchParams.get("status_pagamento") || "todas",
    };

    // Validar filtros
    const validatedFilters = RelatorioFilterSchema.parse(filters);

    // Buscar dados no banco
    const dados = await buscarDadosRelatorio(validatedFilters);

    // Calcular indicadores
    const indicadores = calcularIndicadoresGerais(dados);

    // Montar resposta
    return NextResponse.json({
      success: true,
      data: {
        indicadores_gerais: indicadores,
        veiculos: dados,
        filtros_aplicados: validatedFilters,
        total_veiculos: dados.length,
        total_transacoes: dados.reduce(
          (acc, v) => acc + v.transacoes.length,
          0
        ),
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: "Filtros inválidos",
          details: error.errors,
        },
        { status: 400 }
      );
    }

    console.error("Erro ao gerar relatório:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Erro ao gerar relatório",
      },
      { status: 500 }
    );
  }
}

// Função auxiliar para buscar dados
async function buscarDadosRelatorio(filters: any) {
  // Implementar query SQL com base nos filtros
  // Este é um exemplo simplificado

  let query = `
    SELECT 
      v.id as veiculo_id,
      v.placa,
      v.marca,
      v.modelo,
      v.cor,
      v.descricao,
      c.nome as cliente,
      t.*
    FROM transacoes_abastecimento t
    INNER JOIN veiculos v ON t.veiculo_id = v.id
    INNER JOIN clientes c ON v.cliente_id = c.id
    WHERE t.data_transacao BETWEEN $1 AND $2
  `;

  const params: any[] = [filters.data_inicio, filters.data_fim];
  let paramIndex = 3;

  // Adicionar filtros opcionais
  if (filters.status_pagamento === "pagas") {
    query += ` AND t.status_pagamento = 'pago'`;
  } else if (filters.status_pagamento === "nao_pagas") {
    query += ` AND t.status_pagamento = 'nao_pago'`;
  }

  if (filters.clientes && filters.clientes.length > 0) {
    query += ` AND c.id = ANY($${paramIndex})`;
    params.push(filters.clientes);
    paramIndex++;
  }

  // ... adicionar outros filtros ...

  query += ` ORDER BY v.placa, t.data_transacao`;

  // Executar query
  const result = await db.query(query, params);

  // Agrupar por veículo
  return agruparPorVeiculo(result.rows);
}

// Função auxiliar para agrupar dados por veículo
function agruparPorVeiculo(rows: any[]) {
  const veiculosMap = new Map();

  rows.forEach((row) => {
    const veiculoId = row.veiculo_id;

    if (!veiculosMap.has(veiculoId)) {
      veiculosMap.set(veiculoId, {
        id: veiculoId,
        cliente: row.cliente,
        placa: row.placa,
        marca: row.marca,
        modelo: row.modelo,
        cor: row.cor,
        descricao: row.descricao,
        consumo_arla: 0, // Calcular
        totalizadores: {
          total_litragem: 0,
          valor_total: 0,
          tempo_operacao: 0,
          unidade_medida: "horas",
          media: 0,
          custo_por_unidade: 0,
        },
        transacoes: [],
      });
    }

    const veiculo = veiculosMap.get(veiculoId);

    // Adicionar transação
    veiculo.transacoes.push({
      id: row.id,
      transacao_codigo: row.codigo,
      estabelecimento: row.estabelecimento,
      cidade: row.cidade,
      uf: row.uf,
      motorista: row.motorista,
      hodometro_horimetro: row.hodometro,
      unidade_medida_hodometro: row.unidade_medida_hodometro,
      litragem: row.litragem,
      combustivel: row.combustivel,
      preco_transacao: row.preco_transacao,
      preco_negociado: row.preco_negociado,
      valor_total: row.valor_total,
      economia_litros: row.economia_litros,
      economia_reais: row.economia_reais,
      numero_nfe: row.numero_nfe,
      tempo_operacao: row.tempo_operacao,
      unidade_medida_tempo: row.unidade_medida_tempo,
      media_consumo: row.media_consumo,
      custo_por_unidade: row.custo_por_unidade,
      hodometro: row.hodometro,
      status_pagamento: row.status_pagamento,
      data_pagamento: row.data_pagamento,
      usuario_alteracao: row.usuario_alteracao_status,
      data_alteracao_status: row.data_alteracao_status,
      data_transacao: row.data_transacao,
    });

    // Atualizar totalizadores
    veiculo.totalizadores.total_litragem += row.litragem || 0;
    veiculo.totalizadores.valor_total += row.valor_total || 0;
    veiculo.totalizadores.tempo_operacao += row.tempo_operacao || 0;
  });

  // Calcular médias
  veiculosMap.forEach((veiculo) => {
    const qtdTransacoes = veiculo.transacoes.length;
    if (qtdTransacoes > 0) {
      veiculo.totalizadores.media =
        veiculo.totalizadores.total_litragem / qtdTransacoes;
      veiculo.totalizadores.custo_por_unidade =
        veiculo.totalizadores.valor_total /
        veiculo.totalizadores.tempo_operacao;
    }
  });

  return Array.from(veiculosMap.values());
}

// Função auxiliar para calcular indicadores gerais
function calcularIndicadoresGerais(veiculos: any[]) {
  let total_litragem = 0;
  let valor_total = 0;
  let tempo_total_operacao = 0;
  let total_transacoes = 0;

  veiculos.forEach((veiculo) => {
    total_litragem += veiculo.totalizadores.total_litragem;
    valor_total += veiculo.totalizadores.valor_total;
    tempo_total_operacao += veiculo.totalizadores.tempo_operacao;
    total_transacoes += veiculo.transacoes.length;
  });

  return {
    total_litragem,
    valor_total,
    tempo_total_operacao,
    unidade_medida_tempo: "horas",
    media_geral: total_transacoes > 0 ? total_litragem / total_transacoes : 0,
    custo_por_unidade:
      tempo_total_operacao > 0 ? valor_total / tempo_total_operacao : 0,
  };
}
```

### 5.2 API: `/api/transacoes/[id]/status-pagamento` (PATCH)

**Arquivo**: `app/api/transacoes/[id]/status-pagamento/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const UpdateStatusSchema = z.object({
  status: z.enum(["pago", "nao_pago"]),
  usuario: z.string(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    // Validar dados
    const validated = UpdateStatusSchema.parse(body);

    // Atualizar no banco
    const result = await db.query(
      `
      UPDATE transacoes_abastecimento
      SET 
        status_pagamento = $1,
        data_pagamento = CASE WHEN $1 = 'pago' THEN NOW() ELSE NULL END,
        usuario_alteracao_status = $2,
        data_alteracao_status = NOW()
      WHERE id = $3
      RETURNING *
    `,
      [validated.status, validated.usuario, id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Transação não encontrada",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0],
      message: "Status atualizado com sucesso",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: "Dados inválidos",
          details: error.errors,
        },
        { status: 400 }
      );
    }

    console.error("Erro ao atualizar status:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Erro ao atualizar status",
      },
      { status: 500 }
    );
  }
}
```

### 5.3 API: `/api/relatorios/acerto-viagem/exportar` (POST)

```typescript
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const ExportSchema = z.object({
  formato: z.enum(["pdf", "xlsx", "csv"]),
  dados: z.any(), // Os dados já processados do relatório
  filtros: z.any(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = ExportSchema.parse(body);

    let arquivo: Buffer;
    let contentType: string;
    let filename: string;

    switch (validated.formato) {
      case "pdf":
        arquivo = await gerarPDF(validated.dados);
        contentType = "application/pdf";
        filename = `Acerto_Viagem_${Date.now()}.pdf`;
        break;

      case "xlsx":
        arquivo = await gerarXLSX(validated.dados);
        contentType =
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
        filename = `Acerto_Viagem_${Date.now()}.xlsx`;
        break;

      case "csv":
        arquivo = await gerarCSV(validated.dados);
        contentType = "text/csv";
        filename = `Acerto_Viagem_${Date.now()}.csv`;
        break;
    }

    return new NextResponse(arquivo, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Erro ao exportar:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Erro ao exportar relatório",
      },
      { status: 500 }
    );
  }
}

// Funções auxiliares de geração de arquivos
async function gerarPDF(dados: any): Promise<Buffer> {
  // Implementar com jsPDF ou PDFKit
  // Exemplo simplificado
  const PDFDocument = require("pdfkit");
  const doc = new PDFDocument();

  // Configurar PDF...

  return doc;
}

async function gerarXLSX(dados: any): Promise<Buffer> {
  // Implementar com ExcelJS
  const ExcelJS = require("exceljs");
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Acerto de Viagem");

  // Configurar planilha...

  return await workbook.xlsx.writeBuffer();
}

async function gerarCSV(dados: any): Promise<Buffer> {
  // Implementar CSV simples
  let csv = "Cliente,Placa,Marca,Modelo,...\n";

  dados.veiculos.forEach((veiculo: any) => {
    veiculo.transacoes.forEach((transacao: any) => {
      csv += `${veiculo.cliente},${veiculo.placa},...\n`;
    });
  });

  return Buffer.from(csv, "utf-8");
}
```

---

## 6. Componentes Frontend

### 6.1 Página Principal

**Arquivo**: `app/relatorios/acerto-viagem/page.tsx`

```tsx
"use client";

import { useState } from "react";
import { FiltrosRelatorio } from "@/components/relatorios/FiltrosRelatorio";
import { TabelaVeiculos } from "@/components/relatorios/TabelaVeiculos";
import { IndicadoresGerais } from "@/components/relatorios/IndicadoresGerais";
import { BotoesExportar } from "@/components/relatorios/BotoesExportar";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function AcertoViagemPage() {
  const [filtros, setFiltros] = useState({});
  const [dados, setDados] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleGerarRelatorio = async () => {
    // Validar filtros obrigatórios
    if (!filtros.data_inicio || !filtros.data_fim) {
      toast.error("Preencha as datas de início e fim");
      return;
    }

    setLoading(true);

    try {
      // Montar query string
      const queryParams = new URLSearchParams();
      Object.entries(filtros).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          value.forEach((v) => queryParams.append(`${key}[]`, v));
        } else if (value) {
          queryParams.append(key, String(value));
        }
      });

      const response = await fetch(
        `/api/relatorios/acerto-viagem?${queryParams.toString()}`
      );
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error);
      }

      setDados(result.data);
      toast.success("Relatório gerado com sucesso!");
    } catch (error) {
      toast.error("Erro ao gerar relatório");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleLimpar = () => {
    setFiltros({});
    setDados(null);
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Relatório de Acerto de Viagem</h1>
        <p className="text-muted-foreground mt-2">
          Visualize e gerencie o acerto de viagens dos veículos
        </p>
      </div>

      {/* Filtros */}
      <FiltrosRelatorio
        filtros={filtros}
        onChange={setFiltros}
        onGerar={handleGerarRelatorio}
        onLimpar={handleLimpar}
        loading={loading}
      />

      {/* Indicadores Gerais */}
      {dados && (
        <>
          <div className="flex justify-between items-center">
            <IndicadoresGerais indicadores={dados.indicadores_gerais} />
            <BotoesExportar dados={dados} filtros={filtros} />
          </div>

          {/* Legenda de Flags */}
          <div className="flex items-center gap-4 text-sm">
            <span className="font-medium">Legenda:</span>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-green-500" />
              <span>Pago</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-red-500" />
              <span>Não Pago</span>
            </div>
          </div>

          {/* Tabela Principal */}
          <TabelaVeiculos
            veiculos={dados.veiculos}
            onUpdateStatus={() => handleGerarRelatorio()}
          />
        </>
      )}

      {/* Estado Vazio */}
      {!dados && !loading && (
        <div className="text-center py-16 text-muted-foreground">
          <p>
            Preencha os filtros e clique em "Gerar" para visualizar o relatório
          </p>
        </div>
      )}
    </div>
  );
}
```

### 6.2 Componente de Filtros

**Arquivo**: `components/relatorios/FiltrosRelatorio.tsx`

```tsx
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { MultiSelect } from "@/components/ui/multi-select";

interface FiltrosRelatorioProps {
  filtros: any;
  onChange: (filtros: any) => void;
  onGerar: () => void;
  onLimpar: () => void;
  loading: boolean;
}

export function FiltrosRelatorio({
  filtros,
  onChange,
  onGerar,
  onLimpar,
  loading,
}: FiltrosRelatorioProps) {
  const updateFiltro = (key: string, value: any) => {
    onChange({ ...filtros, [key]: value });
  };

  return (
    <div className="border rounded-lg p-6 space-y-4">
      <h2 className="text-lg font-semibold mb-4">Filtros</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Data Inicial */}
        <div className="space-y-2">
          <Label htmlFor="data_inicio">
            Data Inicial <span className="text-red-500">*</span>
          </Label>
          <Input
            id="data_inicio"
            type="date"
            value={filtros.data_inicio || ""}
            onChange={(e) => updateFiltro("data_inicio", e.target.value)}
            required
          />
        </div>

        {/* Data Final */}
        <div className="space-y-2">
          <Label htmlFor="data_fim">
            Data Final <span className="text-red-500">*</span>
          </Label>
          <Input
            id="data_fim"
            type="date"
            value={filtros.data_fim || ""}
            onChange={(e) => updateFiltro("data_fim", e.target.value)}
            required
          />
        </div>

        {/* Clientes */}
        <div className="space-y-2">
          <Label>Clientes</Label>
          <MultiSelect
            options={[]} // Buscar da API
            value={filtros.clientes || []}
            onChange={(value) => updateFiltro("clientes", value)}
            placeholder="Selecione clientes..."
          />
        </div>

        {/* Estabelecimentos */}
        <div className="space-y-2">
          <Label>Estabelecimentos</Label>
          <MultiSelect
            options={[]}
            value={filtros.estabelecimentos || []}
            onChange={(value) => updateFiltro("estabelecimentos", value)}
            placeholder="Selecione estabelecimentos..."
          />
        </div>

        {/* Filiais */}
        <div className="space-y-2">
          <Label>Filiais</Label>
          <MultiSelect
            options={[]}
            value={filtros.filiais || []}
            onChange={(value) => updateFiltro("filiais", value)}
            placeholder="Selecione filiais..."
          />
        </div>

        {/* Operações */}
        <div className="space-y-2">
          <Label>Operações</Label>
          <MultiSelect
            options={[]}
            value={filtros.operacoes || []}
            onChange={(value) => updateFiltro("operacoes", value)}
            placeholder="Selecione operações..."
          />
        </div>

        {/* Combustíveis */}
        <div className="space-y-2">
          <Label>Combustíveis</Label>
          <MultiSelect
            options={[]}
            value={filtros.combustiveis || []}
            onChange={(value) => updateFiltro("combustiveis", value)}
            placeholder="Selecione combustíveis..."
          />
        </div>

        {/* Veículos */}
        <div className="space-y-2">
          <Label>Veículos</Label>
          <MultiSelect
            options={[]}
            value={filtros.veiculos || []}
            onChange={(value) => updateFiltro("veiculos", value)}
            placeholder="Selecione veículos..."
          />
        </div>

        {/* Motoristas */}
        <div className="space-y-2">
          <Label>Motoristas</Label>
          <MultiSelect
            options={[]}
            value={filtros.motoristas || []}
            onChange={(value) => updateFiltro("motoristas", value)}
            placeholder="Selecione motoristas..."
          />
        </div>

        {/* Centros de Custo */}
        <div className="space-y-2">
          <Label>Centros de Custo</Label>
          <MultiSelect
            options={[]}
            value={filtros.centros_custo || []}
            onChange={(value) => updateFiltro("centros_custo", value)}
            placeholder="Selecione centros de custo..."
          />
        </div>

        {/* Estado */}
        <div className="space-y-2">
          <Label>Estado</Label>
          <Select
            value={filtros.estado || ""}
            onValueChange={(value) => updateFiltro("estado", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="SP">São Paulo</SelectItem>
              <SelectItem value="RJ">Rio de Janeiro</SelectItem>
              {/* ... outros estados */}
            </SelectContent>
          </Select>
        </div>

        {/* Cidade */}
        <div className="space-y-2">
          <Label>Cidade</Label>
          <MultiSelect
            options={[]}
            value={filtros.cidades || []}
            onChange={(value) => updateFiltro("cidades", value)}
            placeholder="Selecione cidades..."
          />
        </div>

        {/* Número de Frota */}
        <div className="space-y-2">
          <Label>Número de Frota</Label>
          <Input
            value={filtros.numero_frota || ""}
            onChange={(e) => updateFiltro("numero_frota", e.target.value)}
            placeholder="Digite o número..."
          />
        </div>

        {/* Tipos de Bomba */}
        <div className="space-y-2">
          <Label>Tipos de Bomba</Label>
          <Select
            value={filtros.tipo_bomba || "todas"}
            onValueChange={(value) => updateFiltro("tipo_bomba", value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas</SelectItem>
              <SelectItem value="internas">Somente Bombas Internas</SelectItem>
              <SelectItem value="externas">Somente Bombas Externas</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Com Nota Fiscal */}
        <div className="space-y-2">
          <Label>Com Nota Fiscal?</Label>
          <Select
            value={filtros.com_nota_fiscal || "todas"}
            onValueChange={(value) => updateFiltro("com_nota_fiscal", value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas</SelectItem>
              <SelectItem value="sim">Sim</SelectItem>
              <SelectItem value="nao">Não</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Tipo de Transação */}
        <div className="space-y-2">
          <Label>Tipo de Transação</Label>
          <Select
            value={filtros.tipo_transacao || "todas"}
            onValueChange={(value) => updateFiltro("tipo_transacao", value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas</SelectItem>
              <SelectItem value="manual">Manual</SelectItem>
              <SelectItem value="compra">Compra</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Status de Pagamento */}
        <div className="space-y-2">
          <Label>Status de Pagamento</Label>
          <Select
            value={filtros.status_pagamento || "todas"}
            onValueChange={(value) => updateFiltro("status_pagamento", value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas</SelectItem>
              <SelectItem value="pagas">Pagas</SelectItem>
              <SelectItem value="nao_pagas">Não Pagas</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tempo em Operação */}
      <div className="flex items-center space-x-2">
        <Checkbox
          id="tempo_operacao"
          checked={filtros.tempo_operacao || false}
          onCheckedChange={(checked) => updateFiltro("tempo_operacao", checked)}
        />
        <Label
          htmlFor="tempo_operacao"
          className="text-sm font-normal cursor-pointer"
        >
          Incluir Tempo em Operação
        </Label>
      </div>

      {/* Botões */}
      <div className="flex gap-2 pt-4">
        <Button onClick={onGerar} disabled={loading}>
          {loading ? "Gerando..." : "Gerar"}
        </Button>
        <Button onClick={onLimpar} variant="outline" disabled={loading}>
          Limpar
        </Button>
      </div>
    </div>
  );
}
```

### 6.3 Componente de Tabela de Veículos

**Arquivo**: `components/relatorios/TabelaVeiculos.tsx`

```tsx
"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight } from "lucide-react";
import { TabelaTransacoes } from "./TabelaTransacoes";

interface TabelaVeiculosProps {
  veiculos: any[];
  onUpdateStatus: () => void;
}

export function TabelaVeiculos({
  veiculos,
  onUpdateStatus,
}: TabelaVeiculosProps) {
  const [expandidos, setExpandidos] = useState<Set<string>>(new Set());

  const toggleExpand = (veiculoId: string) => {
    const novosExpandidos = new Set(expandidos);
    if (novosExpandidos.has(veiculoId)) {
      novosExpandidos.delete(veiculoId);
    } else {
      novosExpandidos.add(veiculoId);
    }
    setExpandidos(novosExpandidos);
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12"></TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Placa</TableHead>
            <TableHead>Marca</TableHead>
            <TableHead>Modelo</TableHead>
            <TableHead>Cor</TableHead>
            <TableHead>Descrição</TableHead>
            <TableHead className="text-right">Consumo Arla</TableHead>
            <TableHead className="text-right">Total Litragem</TableHead>
            <TableHead className="text-right">Valor Total</TableHead>
            <TableHead className="text-right">Tempo Operação</TableHead>
            <TableHead className="text-right">Média</TableHead>
            <TableHead className="text-right">Custo/U.M</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {veiculos.map((veiculo) => {
            const isExpanded = expandidos.has(veiculo.id);

            return (
              <>
                {/* Linha Principal do Veículo */}
                <TableRow key={veiculo.id} className="hover:bg-muted/50">
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleExpand(veiculo.id)}
                      className="p-0 h-8 w-8"
                    >
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </Button>
                  </TableCell>
                  <TableCell className="font-medium">
                    {veiculo.cliente}
                  </TableCell>
                  <TableCell>{veiculo.placa}</TableCell>
                  <TableCell>{veiculo.marca}</TableCell>
                  <TableCell>{veiculo.modelo}</TableCell>
                  <TableCell>{veiculo.cor}</TableCell>
                  <TableCell>{veiculo.descricao}</TableCell>
                  <TableCell className="text-right">
                    {veiculo.consumo_arla.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right">
                    {veiculo.totalizadores.total_litragem.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right">
                    R$ {veiculo.totalizadores.valor_total.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right">
                    {veiculo.totalizadores.tempo_operacao.toFixed(2)}{" "}
                    {veiculo.totalizadores.unidade_medida}
                  </TableCell>
                  <TableCell className="text-right">
                    {veiculo.totalizadores.media.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right">
                    R$ {veiculo.totalizadores.custo_por_unidade.toFixed(2)}
                  </TableCell>
                </TableRow>

                {/* Tabela Aninhada de Transações */}
                {isExpanded && (
                  <TableRow>
                    <TableCell colSpan={13} className="p-0">
                      <div className="bg-muted/30 p-4">
                        <TabelaTransacoes
                          transacoes={veiculo.transacoes}
                          onUpdateStatus={onUpdateStatus}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </>
            );
          })}
        </TableBody>
      </Table>

      {veiculos.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          Nenhum veículo encontrado com os filtros aplicados
        </div>
      )}
    </div>
  );
}
```

### 6.4 Componente de Tabela de Transações

**Arquivo**: `components/relatorios/TabelaTransacoes.tsx`

```tsx
"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ModalStatusPagamento } from "./ModalStatusPagamento";
import { useState } from "react";

interface TabelaTransacoesProps {
  transacoes: any[];
  onUpdateStatus: () => void;
}

export function TabelaTransacoes({
  transacoes,
  onUpdateStatus,
}: TabelaTransacoesProps) {
  const [modalAberto, setModalAberto] = useState(false);
  const [transacaoSelecionada, setTransacaoSelecionada] = useState(null);

  const handleClickFlag = (transacao: any) => {
    setTransacaoSelecionada(transacao);
    setModalAberto(true);
  };

  return (
    <>
      <div className="rounded-lg border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">Status</TableHead>
              <TableHead>Transação</TableHead>
              <TableHead>Estabelecimento</TableHead>
              <TableHead>Cidade</TableHead>
              <TableHead>Motorista</TableHead>
              <TableHead className="text-right">Hodômetro</TableHead>
              <TableHead>U.M</TableHead>
              <TableHead className="text-right">Litragem</TableHead>
              <TableHead>Combustível</TableHead>
              <TableHead className="text-right">Preço Trans.</TableHead>
              <TableHead className="text-right">Preço Neg.</TableHead>
              <TableHead className="text-right">Valor Total</TableHead>
              <TableHead className="text-right">Econ. Litros</TableHead>
              <TableHead className="text-right">Econ. Reais</TableHead>
              <TableHead>Nº NFe</TableHead>
              <TableHead className="text-right">Tempo Op.</TableHead>
              <TableHead className="text-right">Média</TableHead>
              <TableHead className="text-right">Custo/U.M</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transacoes.map((transacao) => (
              <TableRow key={transacao.id}>
                <TableCell>
                  <button
                    onClick={() => handleClickFlag(transacao)}
                    className="w-6 h-6 rounded-full cursor-pointer hover:scale-110 transition-transform"
                    style={{
                      backgroundColor:
                        transacao.status_pagamento === "pago"
                          ? "#22c55e"
                          : "#ef4444",
                    }}
                    title={`Status: ${
                      transacao.status_pagamento === "pago"
                        ? "Pago"
                        : "Não Pago"
                    }\nClique para alterar`}
                  />
                </TableCell>
                <TableCell className="font-mono text-sm">
                  {transacao.transacao_codigo}
                </TableCell>
                <TableCell>{transacao.estabelecimento}</TableCell>
                <TableCell>
                  {transacao.cidade}/{transacao.uf}
                </TableCell>
                <TableCell>{transacao.motorista}</TableCell>
                <TableCell className="text-right">
                  {transacao.hodometro_horimetro.toLocaleString()}
                </TableCell>
                <TableCell>{transacao.unidade_medida_hodometro}</TableCell>
                <TableCell className="text-right">
                  {transacao.litragem.toFixed(2)}
                </TableCell>
                <TableCell>{transacao.combustivel}</TableCell>
                <TableCell className="text-right">
                  R$ {transacao.preco_transacao.toFixed(2)}
                </TableCell>
                <TableCell className="text-right">
                  R$ {transacao.preco_negociado.toFixed(2)}
                </TableCell>
                <TableCell className="text-right font-medium">
                  R$ {transacao.valor_total.toFixed(2)}
                </TableCell>
                <TableCell className="text-right text-green-600">
                  {transacao.economia_litros.toFixed(2)}
                </TableCell>
                <TableCell className="text-right text-green-600">
                  R$ {transacao.economia_reais.toFixed(2)}
                </TableCell>
                <TableCell className="font-mono text-xs">
                  {transacao.numero_nfe || "-"}
                </TableCell>
                <TableCell className="text-right">
                  {transacao.tempo_operacao?.toFixed(2) || "-"}{" "}
                  {transacao.unidade_medida_tempo}
                </TableCell>
                <TableCell className="text-right">
                  {transacao.media_consumo.toFixed(2)}
                </TableCell>
                <TableCell className="text-right">
                  R$ {transacao.custo_por_unidade.toFixed(2)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Modal de Alteração de Status */}
      <ModalStatusPagamento
        aberto={modalAberto}
        onClose={() => setModalAberto(false)}
        transacao={transacaoSelecionada}
        onConfirm={onUpdateStatus}
      />
    </>
  );
}
```

### 6.5 Modal de Alteração de Status

**Arquivo**: `components/relatorios/ModalStatusPagamento.tsx`

```tsx
"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface ModalStatusPagamentoProps {
  aberto: boolean;
  onClose: () => void;
  transacao: any;
  onConfirm: () => void;
}

export function ModalStatusPagamento({
  aberto,
  onClose,
  transacao,
  onConfirm,
}: ModalStatusPagamentoProps) {
  const [novoStatus, setNovoStatus] = useState(
    transacao?.status_pagamento || "nao_pago"
  );
  const [loading, setLoading] = useState(false);

  const handleConfirmar = async () => {
    setLoading(true);

    try {
      const response = await fetch(
        `/api/transacoes/${transacao.id}/status-pagamento`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: novoStatus,
            usuario: "usuario@exemplo.com", // Pegar do contexto de autenticação
          }),
        }
      );

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error);
      }

      toast.success("Status atualizado com sucesso!");
      onConfirm();
      onClose();
    } catch (error) {
      toast.error("Erro ao atualizar status");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (!transacao) return null;

  return (
    <Dialog open={aberto} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Alterar Status de Pagamento</DialogTitle>
          <DialogDescription>
            Transação: {transacao.transacao_codigo}
            <br />
            Valor: R$ {transacao.valor_total?.toFixed(2)}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <Label className="text-base font-medium mb-3 block">
            Selecione o novo status:
          </Label>

          <RadioGroup value={novoStatus} onValueChange={setNovoStatus}>
            <div className="flex items-center space-x-2 mb-3">
              <RadioGroupItem value="pago" id="pago" />
              <Label
                htmlFor="pago"
                className="flex items-center gap-2 cursor-pointer"
              >
                <div className="w-4 h-4 rounded-full bg-green-500" />
                Pago
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <RadioGroupItem value="nao_pago" id="nao_pago" />
              <Label
                htmlFor="nao_pago"
                className="flex items-center gap-2 cursor-pointer"
              >
                <div className="w-4 h-4 rounded-full bg-red-500" />
                Não Pago
              </Label>
            </div>
          </RadioGroup>

          {transacao.status_pagamento !== novoStatus && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md text-sm text-blue-800">
              ℹ️ O status será alterado de{" "}
              <strong>
                {transacao.status_pagamento === "pago" ? "Pago" : "Não Pago"}
              </strong>{" "}
              para{" "}
              <strong>{novoStatus === "pago" ? "Pago" : "Não Pago"}</strong>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button onClick={onClose} variant="outline" disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleConfirmar} disabled={loading}>
            {loading ? "Atualizando..." : "Confirmar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

---

## 7. Checklist de Implementação

### 7.1 Backend

- [ ] Criar migration para adicionar colunas de status de pagamento
- [ ] Criar tabela de auditoria
- [ ] Criar trigger de auditoria automática
- [ ] Implementar API `/api/relatorios/acerto-viagem` (GET)
- [ ] Implementar API `/api/transacoes/[id]/status-pagamento` (PATCH)
- [ ] Implementar API `/api/relatorios/acerto-viagem/exportar` (POST)
- [ ] Implementar função `buscarDadosRelatorio()`
- [ ] Implementar função `agruparPorVeiculo()`
- [ ] Implementar função `calcularIndicadoresGerais()`
- [ ] Implementar função `gerarPDF()`
- [ ] Implementar função `gerarXLSX()`
- [ ] Implementar função `gerarCSV()`
- [ ] Validar queries SQL com índices adequados
- [ ] Testar performance com grande volume de dados

### 7.2 Frontend

- [ ] Criar página `/relatorios/acerto-viagem`
- [ ] Criar componente `FiltrosRelatorio`
- [ ] Criar componente `TabelaVeiculos`
- [ ] Criar componente `TabelaTransacoes`
- [ ] Criar componente `IndicadoresGerais`
- [ ] Criar componente `BotoesExportar`
- [ ] Criar componente `ModalStatusPagamento`
- [ ] Implementar componente `MultiSelect` (se não existir)
- [ ] Implementar lógica de expansão/collapse de veículos
- [ ] Implementar alteração de status de pagamento
- [ ] Implementar exportação de relatórios
- [ ] Adicionar validações de formulário
- [ ] Adicionar feedback visual (toasts)
- [ ] Implementar loading states
- [ ] Testar responsividade
- [ ] Testar acessibilidade

### 7.3 Integração

- [ ] Conectar filtros com API
- [ ] Conectar tabela com API
- [ ] Conectar modal de status com API
- [ ] Conectar exportação com API
- [ ] Implementar cache de dados (opcional)
- [ ] Implementar otimização de queries
- [ ] Testar fluxo completo end-to-end

### 7.4 Testes

- [ ] Testar geração de relatório com todos os filtros
- [ ] Testar expansão de veículos
- [ ] Testar alteração de status
- [ ] Testar recálculo de totalizadores ao alterar status
- [ ] Testar exportação PDF
- [ ] Testar exportação XLSX
- [ ] Testar exportação CSV
- [ ] Testar com dados vazios
- [ ] Testar com grande volume de dados
- [ ] Testar validações de data obrigatória
- [ ] Testar casos de erro

### 7.5 Documentação

- [ ] Documentar APIs criadas
- [ ] Documentar estrutura de dados
- [ ] Criar manual do usuário
- [ ] Documentar regras de negócio
- [ ] Criar FAQ

---

## 8. Cronograma Estimado

### Sprint 1 (1 semana)

- **Dias 1-2**: Migrations e estrutura do banco
- **Dias 3-5**: Implementar APIs principais

### Sprint 2 (1 semana)

- **Dias 1-3**: Componentes de filtros e tabelas
- **Dias 4-5**: Modal de status e indicadores

### Sprint 3 (1 semana)

- **Dias 1-2**: Implementar exportação
- **Dias 3-5**: Testes e ajustes

### Sprint 4 (1 semana)

- **Dias 1-3**: Testes de integração e performance
- **Dias 4-5**: Documentação e deploy

---

**Documento criado em:** 22/10/2025  
**Versão:** 1.0  
**Status:** Pronto para Revisão



