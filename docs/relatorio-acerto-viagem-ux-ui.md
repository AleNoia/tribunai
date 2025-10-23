# Relatório de Acerto de Viagem - Guia UX/UI

## 1. Visão Geral

### 1.1 Objetivo da Interface

Criar uma experiência intuitiva e eficiente para gestores e operadores visualizarem, controlarem e gerenciarem o acerto de viagens de frotas, com foco em:

- **Clareza visual** dos dados de transações e veículos
- **Navegação hierárquica** (veículos → transações)
- **Feedback imediato** em alterações de status
- **Facilidade de exportação** de relatórios

### 1.2 Personas

**Persona 1: Gestor de Frota**

- Precisa de visão consolidada dos custos
- Exporta relatórios semanalmente
- Necessita identificar rapidamente transações não pagas

**Persona 2: Operador Administrativo**

- Atualiza status de pagamento das transações
- Filtra dados por períodos e clientes
- Confere informações de abastecimento

---

## 2. Wireframes

### 2.1 Tela Principal - Vista Completa

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  SISTEMA                                    [Usuário ▼]  [Notificações 🔔]  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ← Relatórios                                                                │
│                                                                              │
│  📊 Relatório de Acerto de Viagem                                           │
│  Visualize e gerencie o acerto de viagens dos veículos                      │
│                                                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│  ╔═══════════════════════════════════════════════════════════════════════╗  │
│  ║  🔍 FILTROS                                                           ║  │
│  ╠═══════════════════════════════════════════════════════════════════════╣  │
│  ║                                                                       ║  │
│  ║  ┌──────────────┬──────────────┬──────────────┬──────────────┐      ║  │
│  ║  │ Data Inicial*│ Data Final*  │  Clientes    │Estabelecimen.│      ║  │
│  ║  │ [01/10/2024] │ [31/10/2024] │ [Selecione..] │ [Selecione..]│      ║  │
│  ║  └──────────────┴──────────────┴──────────────┴──────────────┘      ║  │
│  ║                                                                       ║  │
│  ║  ┌──────────────┬──────────────┬──────────────┬──────────────┐      ║  │
│  ║  │   Filiais    │  Operações   │ Combustíveis │   Veículos   │      ║  │
│  ║  │ [Selecione..] │ [Selecione..]│ [Selecione..]│ [Selecione..]│      ║  │
│  ║  └──────────────┴──────────────┴──────────────┴──────────────┘      ║  │
│  ║                                                                       ║  │
│  ║  ┌──────────────┬──────────────┬──────────────┬──────────────┐      ║  │
│  ║  │  Motoristas  │Centros Custo │    Estado    │    Cidade    │      ║  │
│  ║  │ [Selecione..] │ [Selecione..]│ [SP ▼]       │ [Selecione..]│      ║  │
│  ║  └──────────────┴──────────────┴──────────────┴──────────────┘      ║  │
│  ║                                                                       ║  │
│  ║  ┌──────────────┬──────────────┬──────────────┬──────────────┐      ║  │
│  ║  │ Nº de Frota  │ Tipo Bomba   │ Nota Fiscal? │Tipo Transação│      ║  │
│  ║  │ [Digite...]  │ [Todas ▼]    │ [Todas ▼]    │ [Todas ▼]    │      ║  │
│  ║  └──────────────┴──────────────┴──────────────┴──────────────┘      ║  │
│  ║                                                                       ║  │
│  ║  ┌──────────────────────────────────────┐                           ║  │
│  ║  │ Status de Pagamento: [Todas ▼]       │                           ║  │
│  ║  └──────────────────────────────────────┘                           ║  │
│  ║                                                                       ║  │
│  ║  ☐ Incluir Tempo em Operação                                         ║  │
│  ║                                                                       ║  │
│  ║  [🔍 Gerar]  [🗑️ Limpar]                                              ║  │
│  ║                                                                       ║  │
│  ╚═══════════════════════════════════════════════════════════════════════╝  │
│                                                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│  ╔═══════════════════════════════════════════════════════════════════════╗  │
│  ║  📊 INDICADORES GERAIS                         [📥 Exportar ▼]       ║  │
│  ╠═══════════════════════════════════════════════════════════════════════╣  │
│  ║                                                                       ║  │
│  ║  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌───────────┐  ║  │
│  ║  │   LITRAGEM   │ │  VALOR TOTAL │ │ TEMPO OPERAÇÃO│ │   MÉDIA   │  ║  │
│  ║  │              │ │              │ │               │ │           │  ║  │
│  ║  │  15.234,50 L │ │ R$ 85.420,75 │ │  1.250,5 h    │ │  12,18    │  ║  │
│  ║  └──────────────┘ └──────────────┘ └──────────────┘ └───────────┘  ║  │
│  ║                                                                       ║  │
│  ║  ┌──────────────┐                                                    ║  │
│  ║  │ CUSTO/U.M    │                                                    ║  │
│  ║  │              │                                                    ║  │
│  ║  │  R$ 68,34    │                                                    ║  │
│  ║  └──────────────┘                                                    ║  │
│  ║                                                                       ║  │
│  ╚═══════════════════════════════════════════════════════════════════════╝  │
│                                                                              │
│  Legenda:  🟢 Pago    🔴 Não Pago                                           │
│                                                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│  ╔═══════════════════════════════════════════════════════════════════════╗  │
│  ║  🚗 VEÍCULOS (45 veículos, 523 transações)                           ║  │
│  ╠═══════════════════════════════════════════════════════════════════════╣  │
│  ║                                                                       ║  │
│  ║  ┌─┬────────────┬──────┬──────────┬─────────┬──────┬──────┬────────┐║  │
│  ║  │▼│Cliente     │Placa │Marca     │Modelo   │Cor   │Desc. │Cons...│║  │
│  ║  ├─┼────────────┼──────┼──────────┼─────────┼──────┼──────┼────────┤║  │
│  ║  │▶│Empresa XYZ │ABC..│Mercedes..│Actros...│Branco│Cavalo│145,30 │║  │
│  ║  │ │            │      │          │         │      │      │        │║  │
│  ║  │ │ Total Litragem: 2.500,00 L │ Valor Total: R$ 14.250,00       │║  │
│  ║  │ │ Tempo: 180,5 h │ Média: 13,85 │ Custo/U.M: R$ 78,95           │║  │
│  ║  ├─┼────────────┼──────┼──────────┼─────────┼──────┼──────┼────────┤║  │
│  ║  │▶│Empresa ABC │DEF..│Volvo     │FH 540   │Prata │Cavalo│98,45  │║  │
│  ║  └─┴────────────┴──────┴──────────┴─────────┴──────┴──────┴────────┘║  │
│  ║                                                                       ║  │
│  ╚═══════════════════════════════════════════════════════════════════════╝  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Vista Expandida - Transações do Veículo

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ╔═══════════════════════════════════════════════════════════════════════╗  │
│  ║  🚗 VEÍCULOS (45 veículos, 523 transações)                           ║  │
│  ╠═══════════════════════════════════════════════════════════════════════╣  │
│  ║                                                                       ║  │
│  ║  ┌─┬────────────┬──────┬──────────┬─────────┬──────┬──────┬────────┐║  │
│  ║  │▼│Empresa XYZ │ABC..│Mercedes..│Actros...│Branco│Cavalo│145,30 │║  │
│  ║  │ │            │      │          │         │      │      │        │║  │
│  ║  │ │ Total Litragem: 2.500,00 L │ Valor Total: R$ 14.250,00       │║  │
│  ║  │ │ Tempo: 180,5 h │ Média: 13,85 │ Custo/U.M: R$ 78,95           │║  │
│  ║  ├─┴──────────────────────────────────────────────────────────────────║  │
│  ║  │  ┌───────────────────────────────────────────────────────────────┐│  │
│  ║  │  │ 📋 TRANSAÇÕES DO VEÍCULO ABC-1234                           ││  │
│  ║  │  ├───────────────────────────────────────────────────────────────┤│  │
│  ║  │  │                                                               ││  │
│  ║  │  │ ┌─┬───────┬─────────────┬────────┬──────────┬─────┬────────┐││  │
│  ║  │  │ │S│Trans. │Estabelec.   │Cidade  │Motorista │Hod. │Litr.   │││  │
│  ║  │  │ ├─┼───────┼─────────────┼────────┼──────────┼─────┼────────┤││  │
│  ║  │  │ │🟢│TRX-..│Posto Shell..│São P.. │João Silva│125k │350,00  │││  │
│  ║  │  │ │ │       │             │        │          │     │        │││  │
│  ║  │  │ │ │Combustível: Diesel S10 │Preço Trans: R$ 5,85  │Preço..│││  │
│  ║  │  │ │ │Valor Total: R$ 2.012,50 │Economia: 35L / R$ 201,25     │││  │
│  ║  │  │ │ │NFe: 1234...│Tempo Op: 25,5h│Média: 13,73│Custo:R$78,92 │││  │
│  ║  │  │ ├─┼───────┼─────────────┼────────┼──────────┼─────┼────────┤││  │
│  ║  │  │ │🔴│TRX-..│Posto Ipira..│Campinas│José Alves│127k │280,50  │││  │
│  ║  │  │ │ │       │             │        │          │     │        │││  │
│  ║  │  │ │ │Combustível: Diesel S10 │Preço Trans: R$ 5,92  │Preço..│││  │
│  ║  │  │ │ │Valor Total: R$ 1.661,36 │Economia: 28L / R$ 165,76     │││  │
│  ║  │  │ │ │NFe: -   │Tempo Op: 22,3h│Média: 12,57│Custo:R$74,48 │││  │
│  ║  │  │ └─┴───────┴─────────────┴────────┴──────────┴─────┴────────┘││  │
│  ║  │  │                                                               ││  │
│  ║  │  └───────────────────────────────────────────────────────────────┘│  │
│  ║  ├─┬────────────┬──────┬──────────┬─────────┬──────┬──────┬────────┤║  │
│  ║  │▶│Empresa ABC │DEF..│Volvo     │FH 540   │Prata │Cavalo│98,45  │║  │
│  ║  └─┴────────────┴──────┴──────────┴─────────┴──────┴──────┴────────┘║  │
│  ║                                                                       ║  │
│  ╚═══════════════════════════════════════════════════════════════════════╝  │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 2.3 Modal de Alteração de Status

```
                     ┌───────────────────────────────────────┐
                     │  Alterar Status de Pagamento      [X]│
                     ├───────────────────────────────────────┤
                     │                                       │
                     │  Transação: TRX-2024-001234           │
                     │  Valor: R$ 2.012,50                   │
                     │                                       │
                     │  ─────────────────────────────────    │
                     │                                       │
                     │  Selecione o novo status:             │
                     │                                       │
                     │   ◉  🟢  Pago                         │
                     │                                       │
                     │   ○  🔴  Não Pago                     │
                     │                                       │
                     │  ─────────────────────────────────    │
                     │                                       │
                     │  ℹ️ O status será alterado de         │
                     │     Não Pago para Pago                │
                     │                                       │
                     │  ─────────────────────────────────    │
                     │                                       │
                     │            [Cancelar]  [Confirmar]    │
                     │                                       │
                     └───────────────────────────────────────┘
```

### 2.4 Dropdown de Exportação

```
                                              ┌────────────────────┐
                                              │ 📥 Exportar        │
                                              ├────────────────────┤
                                              │ 📄 Exportar PDF    │
                                              │ 📊 Exportar XLSX   │
                                              │ 📋 Exportar CSV    │
                                              └────────────────────┘
```

---

## 3. Fluxos de Usuário

### 3.1 Fluxo: Gerar Relatório pela Primeira Vez

```
[Início]
   ↓
[Usuário acessa "Relatórios" → "Acerto de Viagem"]
   ↓
[Sistema exibe tela com filtros vazios]
   ↓
[Usuário preenche Data Inicial: 01/10/2024]
   ↓
[Usuário preenche Data Final: 31/10/2024]
   ↓
[Usuário seleciona Cliente: "Empresa XYZ Ltda"]
   ↓
[Usuário clica em "Gerar"]
   ↓
[Sistema valida filtros]
   ↓
┌─────────────────┐
│ Filtros válidos?│
└────┬─────┬──────┘
    Não   Sim
     ↓     ↓
   [Erro] [Sistema busca dados no backend]
     ↓     ↓
   [Mostra] [Sistema processa e agrupa dados]
   [Toast]  ↓
     ↓     [Sistema renderiza indicadores gerais]
     ↓     ↓
     ↓     [Sistema renderiza tabela de veículos (colapsada)]
     ↓     ↓
     └────→[Relatório exibido com sucesso]
            ↓
          [Fim]
```

### 3.2 Fluxo: Expandir Detalhes e Alterar Status

```
[Usuário visualiza relatório gerado]
   ↓
[Usuário clica no ícone ▶ de um veículo]
   ↓
[Sistema expande linha (▼)]
   ↓
[Sistema renderiza tabela aninhada com transações]
   ↓
[Usuário visualiza transações com flags 🟢/🔴]
   ↓
[Usuário identifica transação com flag 🔴 (Não Pago)]
   ↓
[Usuário clica na flag 🔴]
   ↓
[Sistema abre modal "Alterar Status de Pagamento"]
   ↓
[Modal exibe detalhes da transação]
   ↓
[Usuário seleciona ◉ Pago]
   ↓
[Usuário clica em "Confirmar"]
   ↓
[Sistema envia requisição PATCH ao backend]
   ↓
┌─────────────────┐
│  Sucesso API?   │
└────┬─────┬──────┘
    Não   Sim
     ↓     ↓
   [Erro] [Sistema atualiza flag visual: 🔴 → 🟢]
     ↓     ↓
   [Toast] [Sistema recalcula totalizadores (se necessário)]
   [Erro]  ↓
     ↓     [Sistema registra auditoria no backend]
     ↓     ↓
     ↓     [Sistema fecha modal]
     ↓     ↓
     ↓     [Toast: "Status atualizado com sucesso"]
     ↓     ↓
     └────→[Tabela atualizada]
            ↓
          [Fim]
```

### 3.3 Fluxo: Filtrar por Status de Pagamento e Exportar

```
[Usuário visualiza relatório com status "Todas"]
   ↓
[Usuário altera filtro "Status de Pagamento" para "Pagas"]
   ↓
[Usuário clica em "Gerar"]
   ↓
[Sistema recarrega dados filtrados]
   ↓
[Sistema recalcula indicadores apenas com transações "Pagas"]
   ↓
[Sistema atualiza tabela (apenas veículos com transações pagas)]
   ↓
[Usuário visualiza relatório filtrado]
   ↓
[Todas as flags visíveis são 🟢]
   ↓
[Usuário clica em "Exportar ▼"]
   ↓
[Sistema exibe dropdown: PDF, XLSX, CSV]
   ↓
[Usuário seleciona "XLSX"]
   ↓
[Sistema coleta dados visíveis na tela]
   ↓
[Sistema gera arquivo XLSX]
   ↓
[Sistema inicia download: "Acerto_Viagem_01-10-2024_31-10-2024.xlsx"]
   ↓
[Toast: "Relatório exportado com sucesso"]
   ↓
[Fim]
```

---

## 4. Estados de Interação

### 4.1 Filtros

**Estado Inicial (Vazio)**

- Todos os campos vazios
- Datas com placeholders: "dd/mm/aaaa"
- Selects com "Selecione..."
- Botão "Gerar" habilitado (validação no clique)
- Botão "Limpar" desabilitado

**Estado Preenchido**

- Campos com valores selecionados
- Botões "Gerar" e "Limpar" habilitados

**Estado Loading**

- Botão "Gerar" mostra "Gerando..." com spinner
- Todos os campos de filtro desabilitados
- Botão "Limpar" desabilitado

**Estado Erro de Validação**

- Campos obrigatórios sem valor ficam com borda vermelha
- Mensagem de erro abaixo do campo: "Campo obrigatório"
- Toast de erro: "Preencha as datas de início e fim"

### 4.2 Tabela de Veículos

**Estado Colapsado (Default)**

- Ícone: ▶
- Mostra apenas linha resumo do veículo
- Mostra totalizadores do veículo

**Estado Expandido**

- Ícone: ▼
- Mostra linha resumo + tabela aninhada de transações
- Fundo da área expandida levemente diferente (bg-muted/30)

**Estado Hover**

- Linha muda de cor ao passar o mouse
- Cursor pointer sobre ícone de expansão

**Estado Vazio**

- Mensagem centralizada: "Nenhum veículo encontrado com os filtros aplicados"
- Ilustração ou ícone de lista vazia

### 4.3 Flag de Status

**Estado Pago**

- Círculo verde 🟢 (#22c55e)
- Tooltip: "Status: Pago\nClique para alterar"

**Estado Não Pago**

- Círculo vermelho 🔴 (#ef4444)
- Tooltip: "Status: Não Pago\nClique para alterar"

**Estado Hover**

- Aumenta 10% o tamanho (scale-110)
- Cursor pointer

**Estado Loading (durante alteração)**

- Spinner pequeno no lugar da flag
- Desabilitado para clique

### 4.4 Modal de Status

**Estado Normal**

- Modal aberto
- Radio button no status atual pré-selecionado
- Botão "Confirmar" habilitado

**Estado Loading**

- Botão "Confirmar" mostra "Atualizando..." com spinner
- Botão "Cancelar" desabilitado
- Radio buttons desabilitados

**Estado de Mudança**

- Box informativo azul aparece quando status é diferente do atual
- Texto: "ℹ️ O status será alterado de X para Y"

### 4.5 Indicadores Gerais

**Estado Normal**

- Cards com valores calculados
- Formato de moeda: R$ 85.420,75
- Formato de número: 15.234,50

**Estado Loading**

- Skeleton loader nos cards
- Animação pulsante

**Estado com Filtro Ativo**

- Texto adicional: "(\*) Valores calculados com base nos filtros aplicados"

---

## 5. Microcopy e Mensagens

### 5.1 Toasts de Sucesso

```
✅ Relatório gerado com sucesso!
✅ Status atualizado com sucesso
✅ Relatório exportado com sucesso
```

### 5.2 Toasts de Erro

```
❌ Preencha as datas de início e fim
❌ Erro ao gerar relatório
❌ Erro ao atualizar status
❌ Erro ao exportar relatório
❌ Nenhum dado encontrado para os filtros selecionados
```

### 5.3 Labels de Filtros

```
Data Inicial *          (asterisco indica obrigatório)
Data Final *
Clientes
Estabelecimentos
Filiais
Operações
Combustíveis
Veículos
Motoristas
Centros de Custo
Estado
Cidade
Número de Frota
Tipos de Bomba          (default: Todas)
Com Nota Fiscal?        (default: Todas)
Tipo de Transação       (default: Todas)
☐ Incluir Tempo em Operação
Status de Pagamento     (default: Todas)
```

### 5.4 Botões

```
[🔍 Gerar]              → Gera o relatório
[🗑️ Limpar]             → Limpa todos os filtros
[📥 Exportar ▼]         → Abre dropdown de exportação
[Cancelar]              → Cancela ação no modal
[Confirmar]             → Confirma ação no modal
```

### 5.5 Indicadores

```
LITRAGEM
15.234,50 L

VALOR TOTAL
R$ 85.420,75

TEMPO OPERAÇÃO
1.250,5 h

MÉDIA
12,18

CUSTO/U.M
R$ 68,34
```

### 5.6 Legenda

```
Legenda:  🟢 Pago    🔴 Não Pago
```

---

## 6. Design Tokens

### 6.1 Cores

```css
/* Status */
--status-pago: #22c55e; /* Verde */
--status-nao-pago: #ef4444; /* Vermelho */

/* Background */
--bg-primary: #ffffff;
--bg-secondary: #f8f9fa;
--bg-muted: #f1f3f5;
--bg-expanded: rgba(241, 243, 245, 0.3);

/* Borders */
--border-default: #e2e8f0;
--border-error: #ef4444;
--border-focus: #3b82f6;

/* Text */
--text-primary: #1e293b;
--text-secondary: #64748b;
--text-muted: #94a3b8;
--text-success: #22c55e;
--text-error: #ef4444;

/* Interactive */
--color-primary: #3b82f6;
--color-primary-hover: #2563eb;
--color-secondary: #64748b;
--color-secondary-hover: #475569;
```

### 6.2 Tipografia

```css
/* Headings */
--font-h1: 2rem / 2.5rem, 700; /* Título principal */
--font-h2: 1.5rem / 2rem, 600; /* Títulos de seção */
--font-h3: 1.25rem / 1.75rem, 600; /* Subtítulos */

/* Body */
--font-body: 1rem / 1.5rem, 400; /* Texto padrão */
--font-small: 0.875rem / 1.25rem, 400; /* Textos menores */
--font-mono: 0.875rem / 1.25rem, 400, "Courier New"; /* Códigos */

/* Labels */
--font-label: 0.875rem / 1.25rem, 500; /* Labels de formulário */
```

### 6.3 Espaçamentos

```css
/* Padding */
--padding-xs: 0.25rem; /* 4px */
--padding-sm: 0.5rem; /* 8px */
--padding-md: 1rem; /* 16px */
--padding-lg: 1.5rem; /* 24px */
--padding-xl: 2rem; /* 32px */

/* Gap */
--gap-xs: 0.25rem;
--gap-sm: 0.5rem;
--gap-md: 1rem;
--gap-lg: 1.5rem;
--gap-xl: 2rem;

/* Margins */
--margin-section: 2rem; /* Entre seções principais */
--margin-element: 1rem; /* Entre elementos */
```

### 6.4 Bordas e Sombras

```css
/* Border Radius */
--radius-sm: 0.25rem; /* 4px */
--radius-md: 0.5rem; /* 8px */
--radius-lg: 0.75rem; /* 12px */
--radius-full: 9999px; /* Círculo */

/* Shadows */
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
```

### 6.5 Animações

```css
/* Transitions */
--transition-fast: 150ms ease-in-out;
--transition-normal: 300ms ease-in-out;
--transition-slow: 500ms ease-in-out;

/* Hover Scale */
--scale-hover: scale(1.05);
--scale-active: scale(0.95);
```

---

## 7. Componentes Reutilizáveis

### 7.1 MultiSelect

- Dropdown com busca
- Chips para itens selecionados
- Checkbox para cada opção
- Placeholder: "Selecione..."
- "Busca avançada" (link opcional)

### 7.2 Card de Indicador

- Título acima do valor
- Valor grande e destacado
- Unidade de medida menor
- Ícone opcional à esquerda

### 7.3 Flag de Status

- Círculo colorido (verde/vermelho)
- Tooltip informativo
- Cursor pointer
- Animação hover (scale)
- Tamanho: 24x24px

### 7.4 Botão de Expansão

- Ícone: ▶ (colapsado) / ▼ (expandido)
- Tamanho: 32x32px
- Variant: ghost
- Transition suave na rotação do ícone

### 7.5 Toast

- Posição: top-right
- Auto-dismiss: 3-5 segundos
- Ícone de status (✅ / ❌ / ℹ️)
- Animação slide-in
- Botão fechar (X)

---

## 8. Responsividade

### 8.1 Desktop (> 1024px)

- Filtros em grid 4 colunas
- Indicadores em linha (5 cards)
- Tabela com scroll horizontal se necessário
- Todas as colunas visíveis

### 8.2 Tablet (768px - 1024px)

- Filtros em grid 2 colunas
- Indicadores em grid 2x3
- Tabela com scroll horizontal
- Algumas colunas podem ser ocultadas (configurável)

### 8.3 Mobile (< 768px)

- Filtros empilhados (1 coluna)
- Indicadores empilhados
- Tabela substituída por cards (opcional)
- Expansão em accordion
- Modal em fullscreen

---

## 9. Acessibilidade

### 9.1 Checklist WCAG 2.1 AA

- [ ] Contraste mínimo de 4.5:1 para texto
- [ ] Contraste mínimo de 3:1 para elementos interativos
- [ ] Todos os elementos interativos acessíveis via teclado
- [ ] Focus visible em todos os elementos
- [ ] Labels descritivos em todos os inputs
- [ ] Mensagens de erro anunciadas por leitores de tela
- [ ] Modais prendem foco (focus trap)
- [ ] Tooltips acessíveis via hover e focus
- [ ] Tabelas com headers adequados

### 9.2 Navegação por Teclado

```
Tab              → Navega entre elementos
Shift + Tab      → Navega para trás
Enter/Space      → Ativa botões e checkboxes
Escape           → Fecha modais e dropdowns
Arrow Keys       → Navega dentro de selects e radio groups
```

### 9.3 Screen Readers

- `aria-label` em ícones sem texto
- `aria-expanded` em botões de expansão
- `aria-live` para atualizações dinâmicas (toasts)
- `aria-describedby` para descrições de campos
- `role="status"` para indicadores

---

## 10. Casos de Uso Especiais

### 10.1 Grande Volume de Dados

**Problema**: Relatório com 500+ veículos e 5000+ transações

**Solução**:

- Paginação na tabela principal
- Lazy loading das transações (carregar só ao expandir)
- Virtualização de lista (react-window)
- Loading states para cada expansão

### 10.2 Sem Dados

**Cenário 1**: Filtros muito restritivos

- Mensagem: "Nenhum dado encontrado para os filtros selecionados"
- Sugestão: "Tente ampliar os filtros ou alterar o período"

**Cenário 2**: Primeiro acesso

- Mensagem: "Preencha os filtros e clique em 'Gerar' para visualizar o relatório"
- Ilustração de lista vazia

### 10.3 Conexão Lenta

- Skeleton loaders em vez de tela branca
- Timeout de 30s com mensagem de erro
- Retry button

### 10.4 Exportação Demorada

- Toast: "Gerando relatório... Isso pode levar alguns segundos"
- Progresso visual (opcional)
- Não bloquear interface durante exportação

---

## 11. Protótipo Interativo - Estrutura Figma/Adobe XD

### 11.1 Páginas

```
📄 Página 1: Tela Inicial (Filtros Vazios)
📄 Página 2: Relatório Gerado (Tabela Colapsada)
📄 Página 3: Veículo Expandido (com Transações)
📄 Página 4: Modal de Status Aberto
📄 Página 5: Dropdown de Exportação Aberto
📄 Página 6: Estado de Loading
📄 Página 7: Estado de Erro
📄 Página 8: Estado Vazio (Sem Dados)
```

### 11.2 Componentes

```
🧩 Componente: Input de Data
🧩 Componente: Select Simples
🧩 Componente: MultiSelect
🧩 Componente: Checkbox
🧩 Componente: Botão Primário
🧩 Componente: Botão Secundário
🧩 Componente: Card de Indicador
🧩 Componente: Flag de Status
🧩 Componente: Botão de Expansão
🧩 Componente: Toast
🧩 Componente: Modal
🧩 Componente: Dropdown
🧩 Componente: Skeleton Loader
```

### 11.3 Interações (Prototype)

```
Tela Inicial → [Gerar] → Relatório Gerado
Relatório Gerado → [▶] → Veículo Expandido
Veículo Expandido → [Flag] → Modal de Status
Modal de Status → [Confirmar] → Veículo Expandido (atualizado)
Relatório Gerado → [Exportar ▼] → Dropdown de Exportação
```

---

## 12. Animações e Transições

### 12.1 Expansão de Veículo

```css
.row-collapsed {
  max-height: 80px;
  transition: max-height 300ms ease-in-out;
}

.row-expanded {
  max-height: 2000px;
  transition: max-height 300ms ease-in-out;
}

.icon-chevron {
  transition: transform 300ms ease-in-out;
}

.icon-chevron.expanded {
  transform: rotate(90deg);
}
```

### 12.2 Modal

```css
.modal-overlay {
  animation: fadeIn 200ms ease-in;
}

.modal-content {
  animation: slideUp 300ms cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
```

### 12.3 Flag Hover

```css
.flag-status {
  transition: transform 150ms ease-in-out;
}

.flag-status:hover {
  transform: scale(1.1);
  cursor: pointer;
}
```

### 12.4 Toast

```css
.toast-enter {
  animation: slideInRight 300ms ease-out;
}

.toast-exit {
  animation: slideOutRight 200ms ease-in;
}

@keyframes slideInRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}
```

---

## 13. Assets Necessários

### 13.1 Ícones

```
🔍 Ícone de busca/lupa (Gerar)
🗑️ Ícone de lixeira (Limpar)
📥 Ícone de download (Exportar)
📄 Ícone de PDF
📊 Ícone de planilha (XLSX)
📋 Ícone de clipboard (CSV)
▶ Chevron right (colapsar)
▼ Chevron down (expandir)
🟢 Círculo verde (pago)
🔴 Círculo vermelho (não pago)
✅ Check mark (sucesso)
❌ X mark (erro)
ℹ️ Info mark (informação)
🚗 Ícone de veículo
📊 Ícone de gráfico/indicador
```

### 13.2 Ilustrações

```
📊 Ilustração de lista vazia (estado sem dados)
⏳ Ilustração de loading (opcional)
```

### 13.3 Fontes

```
Inter (preferencial para interfaces modernas)
Roboto (alternativa)
Courier New (para códigos de transação)
```

---

## 14. Métricas de UX

### 14.1 KPIs de Usabilidade

- **Time to First Report**: < 30 segundos
- **Error Rate**: < 5% em preenchimento de filtros
- **Success Rate de Alteração de Status**: > 95%
- **Satisfaction Score (CSAT)**: > 4/5

### 14.2 Pontos de Medição

- Tempo para gerar primeiro relatório
- Número de erros de validação
- Quantidade de cliques até exportar
- Taxa de uso de cada filtro
- Taxa de expansão de veículos
- Quantidade de alterações de status por sessão

---

**Documento criado em:** 22/10/2025  
**Versão:** 1.0  
**Status:** Pronto para Design



