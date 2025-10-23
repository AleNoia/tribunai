# Relatório de Acerto de Viagem - Checklist de Implementação

## 📊 Progresso Geral

```
┌─────────────────────────────────────────────────┐
│ ▓▓▓░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  0% │
│                                                 │
│ Backend:     0/14  ░░░░░░░░░░░░░░░░░░░░        │
│ Frontend:    0/15  ░░░░░░░░░░░░░░░░░░░░        │
│ Integração:  0/7   ░░░░░░░░░░░░░░░░░░░░        │
│ Testes:      0/11  ░░░░░░░░░░░░░░░░░░░░        │
│ Deploy:      0/5   ░░░░░░░░░░░░░░░░░░░░        │
│                                                 │
│ Total:       0/52  tarefas concluídas           │
└─────────────────────────────────────────────────┘
```

---

## 🗄️ 1. Banco de Dados

### 1.1 Migrations

- [ ] **DB-001** Criar migration `add_payment_status_to_transactions.sql`

  - [ ] Adicionar coluna `status_pagamento` (VARCHAR, DEFAULT 'nao_pago')
  - [ ] Adicionar coluna `data_pagamento` (TIMESTAMP, NULL)
  - [ ] Adicionar coluna `usuario_alteracao_status` (VARCHAR, NULL)
  - [ ] Adicionar coluna `data_alteracao_status` (TIMESTAMP, NULL)
  - [ ] Criar índice em `status_pagamento`
  - [ ] Adicionar constraint CHECK para validar valores
  - [ ] Adicionar comentários nas colunas
  - [ ] Testar migration em ambiente de desenvolvimento

- [ ] **DB-002** Criar migration `create_payment_status_audit_log.sql`

  - [ ] Criar tabela `auditoria_status_pagamento`
  - [ ] Definir colunas (id, transacao_id, status_anterior, status_novo, usuario, data, ip, observacao)
  - [ ] Adicionar foreign key para `transacoes_abastecimento`
  - [ ] Criar índices (transacao_id, data_alteracao, usuario)
  - [ ] Adicionar comentários
  - [ ] Testar migration em ambiente de desenvolvimento

- [ ] **DB-003** Criar migration `create_trigger_audit_payment_status.sql`
  - [ ] Criar função `audit_payment_status_change()`
  - [ ] Criar trigger `trg_audit_payment_status`
  - [ ] Testar trigger com UPDATE de status
  - [ ] Verificar inserção automática na tabela de auditoria
  - [ ] Testar rollback do trigger

### 1.2 Dados Iniciais

- [ ] **DB-004** Popular dados históricos (se necessário)
  - [ ] Script para definir status padrão de transações antigas
  - [ ] Executar em produção com backup prévio

### 1.3 Validação

- [ ] **DB-005** Verificar integridade
  - [ ] Todas as transações têm status válido
  - [ ] Índices criados corretamente
  - [ ] Foreign keys funcionando
  - [ ] Triggers ativados
  - [ ] Performance das queries otimizada

---

## 🔧 2. Backend - APIs

### 2.1 API: Gerar Relatório

- [ ] **BE-001** Criar `/api/relatorios/acerto-viagem/route.ts`

  - [ ] Implementar handler GET
  - [ ] Criar schema Zod para validação de filtros
  - [ ] Implementar extração de query params
  - [ ] Validar filtros obrigatórios (data_inicio, data_fim)
  - [ ] Implementar chamada à função `buscarDadosRelatorio()`
  - [ ] Implementar cálculo de indicadores gerais
  - [ ] Formatar resposta JSON
  - [ ] Adicionar tratamento de erros
  - [ ] Adicionar logs estruturados
  - [ ] Testar com Postman/Insomnia

- [ ] **BE-002** Implementar `buscarDadosRelatorio()`

  - [ ] Criar query SQL base
  - [ ] Adicionar filtros dinâmicos (clientes, estabelecimentos, etc.)
  - [ ] Adicionar filtro de status de pagamento
  - [ ] Otimizar com JOINs adequados
  - [ ] Adicionar paginação (opcional)
  - [ ] Testar com diferentes combinações de filtros
  - [ ] Medir performance (objetivo: < 2s)

- [ ] **BE-003** Implementar `agruparPorVeiculo()`

  - [ ] Agrupar transações por veículo_id
  - [ ] Calcular totalizadores por veículo
  - [ ] Calcular médias e custos
  - [ ] Calcular consumo de ARLA
  - [ ] Formatar estrutura de resposta
  - [ ] Testar com dados reais

- [ ] **BE-004** Implementar `calcularIndicadoresGerais()`
  - [ ] Somar total de litragem
  - [ ] Somar valor total
  - [ ] Somar tempo em operação
  - [ ] Calcular média geral
  - [ ] Calcular custo por unidade de medida
  - [ ] Testar precisão dos cálculos

### 2.2 API: Alterar Status de Pagamento

- [ ] **BE-005** Criar `/api/transacoes/[id]/status-pagamento/route.ts`

  - [ ] Implementar handler PATCH
  - [ ] Criar schema Zod para validação
  - [ ] Validar ID da transação
  - [ ] Validar novo status (pago/nao_pago)
  - [ ] Atualizar status no banco
  - [ ] Registrar data_pagamento (se status = pago)
  - [ ] Registrar usuario_alteracao_status
  - [ ] Registrar data_alteracao_status
  - [ ] Retornar dados atualizados
  - [ ] Adicionar tratamento de erros (404, 400, 500)
  - [ ] Adicionar logs estruturados
  - [ ] Testar com Postman/Insomnia

- [ ] **BE-006** Implementar autenticação
  - [ ] Verificar token/sessão do usuário
  - [ ] Extrair email/nome do usuário autenticado
  - [ ] Registrar usuário responsável pela alteração
  - [ ] Retornar 401 se não autenticado

### 2.3 API: Exportar Relatório

- [ ] **BE-007** Criar `/api/relatorios/acerto-viagem/exportar/route.ts`

  - [ ] Implementar handler POST
  - [ ] Validar formato (pdf, xlsx, csv)
  - [ ] Receber dados do relatório no body
  - [ ] Chamar função de geração adequada
  - [ ] Retornar arquivo com headers corretos
  - [ ] Adicionar nome de arquivo dinâmico
  - [ ] Testar download de cada formato

- [ ] **BE-008** Implementar `gerarPDF()`

  - [ ] Instalar biblioteca (jsPDF ou PDFKit)
  - [ ] Criar template de PDF
  - [ ] Adicionar cabeçalho com indicadores
  - [ ] Adicionar tabela de veículos
  - [ ] Adicionar tabelas de transações (se expandidas)
  - [ ] Adicionar rodapé com data/hora de geração
  - [ ] Configurar quebras de página
  - [ ] Testar com dados reais

- [ ] **BE-009** Implementar `gerarXLSX()`

  - [ ] Instalar biblioteca ExcelJS
  - [ ] Criar workbook
  - [ ] Adicionar worksheet "Indicadores"
  - [ ] Adicionar worksheet "Veículos"
  - [ ] Adicionar worksheet "Transações"
  - [ ] Formatar células (moeda, número, data)
  - [ ] Adicionar fórmulas (se necessário)
  - [ ] Congelar primeira linha
  - [ ] Auto-ajustar largura das colunas
  - [ ] Testar com dados reais

- [ ] **BE-010** Implementar `gerarCSV()`
  - [ ] Gerar string CSV com separador `;` ou `,`
  - [ ] Adicionar cabeçalhos das colunas
  - [ ] Escapar caracteres especiais
  - [ ] Definir encoding UTF-8
  - [ ] Testar abertura no Excel/LibreOffice

### 2.4 Otimizações

- [ ] **BE-011** Cache de dados (opcional)

  - [ ] Implementar cache Redis para queries frequentes
  - [ ] Definir TTL adequado (ex: 5 minutos)
  - [ ] Invalidar cache ao alterar status

- [ ] **BE-012** Rate limiting
  - [ ] Limitar requisições de geração de relatório (ex: 10/min)
  - [ ] Limitar requisições de alteração de status (ex: 30/min)

---

## 🎨 3. Frontend - Componentes

### 3.1 Páginas

- [ ] **FE-001** Criar `/app/relatorios/acerto-viagem/page.tsx`
  - [ ] Criar estrutura básica da página
  - [ ] Adicionar título e descrição
  - [ ] Integrar componente de filtros
  - [ ] Integrar componente de indicadores
  - [ ] Integrar componente de tabela de veículos
  - [ ] Integrar botões de exportação
  - [ ] Implementar estado de loading
  - [ ] Implementar estado vazio
  - [ ] Implementar estado de erro
  - [ ] Adicionar feedback (toasts)
  - [ ] Testar responsividade

### 3.2 Componentes de Filtros

- [ ] **FE-002** Criar `components/relatorios/FiltrosRelatorio.tsx`

  - [ ] Criar estrutura do formulário
  - [ ] Adicionar inputs de data (obrigatórios)
  - [ ] Adicionar MultiSelect para clientes
  - [ ] Adicionar MultiSelect para estabelecimentos
  - [ ] Adicionar MultiSelect para filiais
  - [ ] Adicionar MultiSelect para operações
  - [ ] Adicionar MultiSelect para combustíveis
  - [ ] Adicionar MultiSelect para veículos
  - [ ] Adicionar MultiSelect para motoristas
  - [ ] Adicionar MultiSelect para centros de custo
  - [ ] Adicionar Select para estados
  - [ ] Adicionar MultiSelect para cidades
  - [ ] Adicionar Input para número de frota
  - [ ] Adicionar Select para tipo de bomba
  - [ ] Adicionar Select para nota fiscal
  - [ ] Adicionar Select para tipo de transação
  - [ ] Adicionar Checkbox para tempo em operação
  - [ ] Adicionar Select para status de pagamento
  - [ ] Adicionar botão "Gerar"
  - [ ] Adicionar botão "Limpar"
  - [ ] Implementar validação de campos obrigatórios
  - [ ] Implementar lógica de limpar filtros
  - [ ] Testar estados (vazio, preenchido, loading, erro)

- [ ] **FE-003** Criar/Adaptar `components/ui/multi-select.tsx` (se não existir)
  - [ ] Dropdown com checkbox para múltiplas seleções
  - [ ] Campo de busca dentro do dropdown
  - [ ] Chips para exibir selecionados
  - [ ] Botão "Limpar seleção"
  - [ ] Placeholder configurável
  - [ ] Testar com listas grandes (100+ itens)

### 3.3 Componentes de Indicadores

- [ ] **FE-004** Criar `components/relatorios/IndicadoresGerais.tsx`
  - [ ] Criar grid de cards
  - [ ] Card: Total de Litragem
  - [ ] Card: Valor Total
  - [ ] Card: Tempo em Operação
  - [ ] Card: Média Geral
  - [ ] Card: Custo por U.M
  - [ ] Formatar números (moeda, casas decimais)
  - [ ] Implementar skeleton loader
  - [ ] Testar responsividade (empilhar em mobile)

### 3.4 Componentes de Tabela

- [ ] **FE-005** Criar `components/relatorios/TabelaVeiculos.tsx`

  - [ ] Criar estrutura de tabela
  - [ ] Adicionar coluna de expansão (ícone ▶/▼)
  - [ ] Adicionar colunas: Cliente, Placa, Marca, Modelo, Cor, Descrição
  - [ ] Adicionar colunas de totalizadores
  - [ ] Implementar lógica de expansão/collapse
  - [ ] Renderizar tabela aninhada ao expandir
  - [ ] Implementar estado vazio
  - [ ] Implementar hover states
  - [ ] Adicionar scroll horizontal (se necessário)
  - [ ] Testar com muitos veículos (50+)

- [ ] **FE-006** Criar `components/relatorios/TabelaTransacoes.tsx`

  - [ ] Criar estrutura de tabela aninhada
  - [ ] Adicionar coluna de flag de status
  - [ ] Adicionar todas as colunas de transação
  - [ ] Implementar clique na flag (abrir modal)
  - [ ] Formatar valores (moeda, números)
  - [ ] Destacar economia em verde
  - [ ] Implementar hover states
  - [ ] Testar com muitas transações (100+)

- [ ] **FE-007** Criar `components/relatorios/ModalStatusPagamento.tsx`
  - [ ] Criar estrutura do modal (Dialog)
  - [ ] Adicionar informações da transação
  - [ ] Adicionar radio group (Pago / Não Pago)
  - [ ] Adicionar botão "Cancelar"
  - [ ] Adicionar botão "Confirmar"
  - [ ] Implementar lógica de confirmação
  - [ ] Implementar loading state
  - [ ] Exibir alerta de mudança
  - [ ] Implementar feedback de sucesso/erro
  - [ ] Testar focus trap
  - [ ] Testar navegação por teclado (Escape, Enter)

### 3.5 Componentes de Exportação

- [ ] **FE-008** Criar `components/relatorios/BotoesExportar.tsx`
  - [ ] Criar dropdown de exportação
  - [ ] Opção: Exportar PDF
  - [ ] Opção: Exportar XLSX
  - [ ] Opção: Exportar CSV
  - [ ] Implementar lógica de download
  - [ ] Implementar loading durante exportação
  - [ ] Adicionar feedback (toast)
  - [ ] Testar download de cada formato

---

## 🔗 4. Integração Frontend ↔ Backend

### 4.1 Conexões de API

- [ ] **INT-001** Conectar filtros com API

  - [ ] Montar query params a partir dos filtros
  - [ ] Fazer requisição GET para `/api/relatorios/acerto-viagem`
  - [ ] Tratar resposta de sucesso
  - [ ] Tratar erros (400, 404, 500)
  - [ ] Exibir toasts apropriados

- [ ] **INT-002** Conectar alteração de status com API

  - [ ] Fazer requisição PATCH para `/api/transacoes/[id]/status-pagamento`
  - [ ] Enviar novo status no body
  - [ ] Tratar resposta de sucesso
  - [ ] Atualizar UI localmente (otimistic update)
  - [ ] Recarregar dados se necessário
  - [ ] Tratar erros

- [ ] **INT-003** Conectar exportação com API
  - [ ] Fazer requisição POST para `/api/relatorios/acerto-viagem/exportar`
  - [ ] Enviar dados e formato no body
  - [ ] Processar blob response
  - [ ] Iniciar download do arquivo
  - [ ] Tratar erros

### 4.2 Estados e Cache

- [ ] **INT-004** Implementar gerenciamento de estado

  - [ ] Estado de filtros
  - [ ] Estado de dados do relatório
  - [ ] Estado de veículos expandidos
  - [ ] Estado de loading
  - [ ] Estado de erros

- [ ] **INT-005** Implementar cache local (opcional)
  - [ ] Cachear dados do relatório (localStorage ou React Query)
  - [ ] Invalidar cache ao alterar status
  - [ ] Definir TTL adequado

---

## 🧪 5. Testes

### 5.1 Testes Unitários

- [ ] **TEST-001** Testes de validação de filtros (backend)

  - [ ] Testar filtros obrigatórios
  - [ ] Testar formato de datas
  - [ ] Testar valores inválidos

- [ ] **TEST-002** Testes de cálculos

  - [ ] Testar `calcularIndicadoresGerais()` com diferentes datasets
  - [ ] Testar totalizadores por veículo
  - [ ] Validar precisão de médias

- [ ] **TEST-003** Testes de componentes (frontend)
  - [ ] Testar renderização de filtros
  - [ ] Testar expansão de tabelas
  - [ ] Testar modal de status
  - [ ] Testar validações de formulário

### 5.2 Testes de Integração

- [ ] **TEST-004** Fluxo completo: Gerar relatório
  - [ ] Preencher filtros → Clicar em Gerar → Verificar dados exibidos
- [ ] **TEST-005** Fluxo completo: Alterar status

  - [ ] Expandir veículo → Clicar na flag → Alterar status → Verificar atualização

- [ ] **TEST-006** Fluxo completo: Exportar relatório

  - [ ] Gerar relatório → Clicar em Exportar → Verificar download

- [ ] **TEST-007** Teste com filtro de status de pagamento
  - [ ] Filtrar "Pagas" → Verificar apenas transações pagas
  - [ ] Verificar recálculo de totalizadores

### 5.3 Testes de Performance

- [ ] **TEST-008** Testar com grande volume de dados

  - [ ] 500+ veículos
  - [ ] 5000+ transações
  - [ ] Medir tempo de resposta da API (< 3s)
  - [ ] Medir tempo de renderização (< 1s)

- [ ] **TEST-009** Testar exportação com grande volume
  - [ ] Exportar relatório com 1000+ linhas
  - [ ] Medir tempo de geração (< 10s)

### 5.4 Testes de Usabilidade

- [ ] **TEST-010** Testar responsividade

  - [ ] Desktop (1920x1080)
  - [ ] Tablet (768x1024)
  - [ ] Mobile (375x667)

- [ ] **TEST-011** Testar acessibilidade
  - [ ] Navegação por teclado
  - [ ] Leitores de tela (NVDA/JAWS)
  - [ ] Contraste de cores (WCAG AA)

---

## 📚 6. Documentação

- [ ] **DOC-001** Documentar APIs no Swagger/OpenAPI

  - [ ] Endpoint GET `/api/relatorios/acerto-viagem`
  - [ ] Endpoint PATCH `/api/transacoes/[id]/status-pagamento`
  - [ ] Endpoint POST `/api/relatorios/acerto-viagem/exportar`

- [ ] **DOC-002** Criar manual do usuário

  - [ ] Como gerar um relatório
  - [ ] Como usar os filtros
  - [ ] Como alterar status de pagamento
  - [ ] Como exportar relatórios

- [ ] **DOC-003** Documentar regras de negócio

  - [ ] Cálculo de indicadores
  - [ ] Cálculo de economia
  - [ ] Regras de status de pagamento

- [ ] **DOC-004** Criar FAQ
  - [ ] "Como filtrar apenas transações não pagas?"
  - [ ] "Por que os totalizadores mudaram ao alterar o status?"
  - [ ] "Qual a diferença entre os formatos de exportação?"

---

## 🚀 7. Deploy

### 7.1 Preparação

- [ ] **DEPLOY-001** Criar backup do banco de dados

  - [ ] Backup completo antes das migrations
  - [ ] Testar restore do backup

- [ ] **DEPLOY-002** Executar migrations em staging
  - [ ] Executar migrations de teste
  - [ ] Validar integridade dos dados
  - [ ] Testar rollback

### 7.2 Deploy em Produção

- [ ] **DEPLOY-003** Executar migrations em produção

  - [ ] Agendar janela de manutenção (se necessário)
  - [ ] Executar migrations
  - [ ] Validar dados

- [ ] **DEPLOY-004** Deploy do código

  - [ ] Build do frontend
  - [ ] Deploy do backend
  - [ ] Deploy do frontend
  - [ ] Verificar logs de erro

- [ ] **DEPLOY-005** Validação pós-deploy
  - [ ] Smoke tests em produção
  - [ ] Verificar logs de erro
  - [ ] Monitorar performance
  - [ ] Comunicar disponibilidade aos usuários

---

## 📊 8. Monitoramento

- [ ] **MON-001** Configurar logs estruturados

  - [ ] Logs de geração de relatório
  - [ ] Logs de alteração de status
  - [ ] Logs de exportação
  - [ ] Logs de erros

- [ ] **MON-002** Configurar alertas

  - [ ] Alerta de erro 500 > 5/min
  - [ ] Alerta de tempo de resposta > 5s
  - [ ] Alerta de falhas de exportação

- [ ] **MON-003** Criar dashboard de métricas
  - [ ] Quantidade de relatórios gerados por dia
  - [ ] Quantidade de alterações de status por dia
  - [ ] Quantidade de exportações por formato
  - [ ] Tempo médio de resposta das APIs

---

## 🐛 9. Bugs Conhecidos

| ID  | Descrição | Prioridade | Status | Responsável |
| --- | --------- | ---------- | ------ | ----------- |
| -   | -         | -          | -      | -           |

---

## ✅ 10. Critérios de Aceitação Final

### 10.1 Funcionalidades Principais

- [ ] Relatório é gerado corretamente com base nos filtros
- [ ] Todas as colunas de dados são exibidas corretamente
- [ ] Veículos podem ser expandidos/colapsados
- [ ] Transações são listadas corretamente ao expandir
- [ ] Status de pagamento pode ser alterado via modal
- [ ] Totalizadores são recalculados corretamente ao alterar status
- [ ] Filtro de status de pagamento funciona corretamente
- [ ] Indicadores gerais são calculados corretamente
- [ ] Exportação PDF funciona e contém todos os dados visíveis
- [ ] Exportação XLSX funciona e contém todos os dados visíveis
- [ ] Exportação CSV funciona e contém todos os dados visíveis

### 10.2 Performance

- [ ] API responde em < 3s para relatórios com até 500 veículos
- [ ] Frontend renderiza em < 1s
- [ ] Exportação completa em < 10s
- [ ] Sem vazamento de memória em sessões longas

### 10.3 UX/UI

- [ ] Interface segue o design aprovado
- [ ] Responsivo em desktop, tablet e mobile
- [ ] Feedback visual em todas as ações (toasts, loading)
- [ ] Sem erros no console do navegador
- [ ] Acessível via teclado
- [ ] Compatível com leitores de tela

### 10.4 Qualidade

- [ ] Cobertura de testes > 70%
- [ ] Sem erros de linter
- [ ] Sem warnings críticos
- [ ] Código revisado (code review)
- [ ] Documentação completa

---

## 📅 Cronograma de Execução

| Sprint   | Tarefas                                    | Prazo    | Status          |
| -------- | ------------------------------------------ | -------- | --------------- |
| Sprint 1 | DB-001 a DB-005, BE-001 a BE-004           | Semana 1 | 🔴 Não iniciado |
| Sprint 2 | BE-005 a BE-010, FE-001 a FE-003           | Semana 2 | 🔴 Não iniciado |
| Sprint 3 | FE-004 a FE-008, INT-001 a INT-003         | Semana 3 | 🔴 Não iniciado |
| Sprint 4 | TEST-001 a TEST-011, DOC-001 a DOC-004     | Semana 4 | 🔴 Não iniciado |
| Sprint 5 | DEPLOY-001 a DEPLOY-005, MON-001 a MON-003 | Semana 5 | 🔴 Não iniciado |

### Legenda de Status

- 🔴 Não iniciado
- 🟡 Em andamento
- 🟢 Concluído
- 🔵 Bloqueado
- ⚠️ Com problemas

---

**Última atualização:** 22/10/2025  
**Responsável pelo checklist:** [Nome]  
**Versão:** 1.0



