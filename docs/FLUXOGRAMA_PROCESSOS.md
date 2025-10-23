# Fluxograma - Sistema de Processos

## 📋 Legenda

- 🖥️ Tela/Página
- 🔌 Endpoint API
- 📦 Componente
- 🗄️ Banco de Dados
- ⚠️ Problema Identificado

---

## 1. Fluxo de Listagem

```
┌─────────────────────────────────────────────────────┐
│  🖥️ /dashboard/processos (page.tsx)                │
│                                                     │
│  Estado:                                            │
│  • processos: ProcessoAcompanhado[]                │
│  • loading: boolean                                │
│  • error: string | null                            │
└──────────────────┬──────────────────────────────────┘
                   │
                   │ useEffect + fetchProcessos()
                   │
                   ▼
┌─────────────────────────────────────────────────────┐
│  🔌 GET /api/processos (route.ts)                   │
│                                                     │
│  1. Autentica usuário (Supabase Auth)              │
│  2. Busca user_id interno (tabela users)           │
│  3. Query JOIN user_processes + processes           │
│  ⚠️ PROBLEMA: Traz campo movimentos (pesado)       │
└──────────────────┬──────────────────────────────────┘
                   │
                   │ supabaseAdmin.from('user_processes')
                   │               .select('*, processes(*)')
                   │
                   ▼
┌─────────────────────────────────────────────────────┐
│  🗄️ BANCO DE DADOS                                 │
│                                                     │
│  user_processes                   processes         │
│  ├─ id                           ├─ id             │
│  ├─ user_id      ┌──────────────►├─ numero         │
│  ├─ process_id ──┘               ├─ tribunal       │
│  ├─ apelido                      ├─ partes         │
│  └─ notificar                    ├─ movimentos ⚠️  │
│                                  └─ classe...       │
└──────────────────┬──────────────────────────────────┘
                   │
                   │ Response: { processos: [...] }
                   │
                   ▼
┌─────────────────────────────────────────────────────┐
│  🖥️ /dashboard/processos                           │
│                                                     │
│  Renderiza:                                         │
│  ├─ Cards de Estatísticas                          │
│  │  ├─ Total de Processos                          │
│  │  ├─ Com Notificações                            │
│  │  └─ Tribunais Únicos                            │
│  │                                                  │
│  └─ 📦 ProcessosTable                              │
│     ├─ Lista processos em tabela                   │
│     ├─ 📦 EditProcessoDialog (por linha)          │
│     └─ 📦 DeleteProcessoDialog (por linha)        │
└─────────────────────────────────────────────────────┘
```

---

## 2. Fluxo de Adição de Processo

```
┌─────────────────────────────────────────────────────┐
│  🖥️ /dashboard/processos                           │
│                                                     │
│  Usuário clica:                                     │
│  [+ Acompanhar Processo]                           │
└──────────────────┬──────────────────────────────────┘
                   │
                   │ onClick
                   │
                   ▼
┌─────────────────────────────────────────────────────┐
│  📦 AddProcessoDialog                               │
│                                                     │
│  Form:                                              │
│  • Número do Processo (required)                   │
│  • Tribunal (required)                             │
│  • Apelido (optional)                              │
│  • Notificar (switch, default: true)               │
│                                                     │
│  Validação: addProcessoSchema (Zod)                │
└──────────────────┬──────────────────────────────────┘
                   │
                   │ onSubmit → POST /api/processos
                   │ Body: { numero, tribunal, apelido, notificar }
                   │
                   ▼
┌─────────────────────────────────────────────────────┐
│  🔌 POST /api/processos (route.ts)                  │
│                                                     │
│  1. Autentica usuário                              │
│  2. Valida input com Zod                           │
│  3. ⚠️ Verifica se já acompanha (JOIN problemático)│
│  4. Verifica se processo existe na tabela global   │
│  5. Se NÃO existe:                                 │
│     ├─ buscarDadosDataJud(numero) ⚠️ duplicada    │
│     └─ Cria novo em processes                      │
│  6. Cria vínculo em user_processes                 │
└──────────────────┬──────────────────────────────────┘
                   │
                   │ (Se processo não existe)
                   │
                   ▼
┌─────────────────────────────────────────────────────┐
│  🔌 buscarDadosDataJud() [INTERNO]                 │
│                                                     │
│  1. Limpa número (remove formatação)               │
│  2. Monta query Elasticsearch                      │
│  3. POST para API DataJud                          │
│  ⚠️ PROBLEMA: API Key hardcoded                    │
│     "APIKey cDZHYzlZa0JadVREZDJ..."                │
│  4. Retorna dados ou null                          │
└──────────────────┬──────────────────────────────────┘
                   │
                   │ Dados do processo
                   │
                   ▼
┌─────────────────────────────────────────────────────┐
│  🗄️ INSERT em processes                            │
│                                                     │
│  {                                                  │
│    numero, tribunal,                               │
│    partes: dadosDataJud?.partes || {},            │
│    ultima_movimentacao: {...},                     │
│    classe, sistema, formato,                       │
│    data_ajuizamento, grau,                         │
│    orgao_julgador, assuntos,                       │
│    movimentos: dadosDataJud?.movimentos           │
│  }                                                  │
└──────────────────┬──────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────┐
│  🗄️ INSERT em user_processes                       │
│                                                     │
│  {                                                  │
│    user_id: internalUserId,                        │
│    process_id: processId,                          │
│    apelido, notificar                              │
│  }                                                  │
└──────────────────┬──────────────────────────────────┘
                   │
                   │ Response: { processo: {...} }
                   │
                   ▼
┌─────────────────────────────────────────────────────┐
│  📦 AddProcessoDialog                               │
│                                                     │
│  • toast.success("Processo adicionado!")           │
│  • reset() form                                    │
│  • setOpen(false)                                  │
│  • onSuccess() → fetchProcessos()                  │
└──────────────────┬──────────────────────────────────┘
                   │
                   │ Lista atualizada
                   │
                   ▼
┌─────────────────────────────────────────────────────┐
│  🖥️ /dashboard/processos                           │
│                                                     │
│  Processo aparece na tabela                        │
└─────────────────────────────────────────────────────┘
```

---

## 3. Fluxo de Detalhes do Processo

```
┌─────────────────────────────────────────────────────┐
│  🖥️ /dashboard/processos                           │
│                                                     │
│  📦 ProcessosTable                                 │
│  ├─ Linha clicável                                 │
│  └─ onClick → router.push(`/processos/${id}`)     │
└──────────────────┬──────────────────────────────────┘
                   │
                   │ Navegação
                   │
                   ▼
┌─────────────────────────────────────────────────────┐
│  🖥️ /dashboard/processos/[id] (page.tsx)          │
│                                                     │
│  Estado:                                            │
│  • processo: ProcessoAcompanhado | null            │
│  • loading: boolean                                │
│  • updating: boolean                               │
└──────────────────┬──────────────────────────────────┘
                   │
                   │ useEffect + fetchProcesso()
                   │
                   ▼
┌─────────────────────────────────────────────────────┐
│  🔌 GET /api/processos/[id] (route.ts)             │
│                                                     │
│  1. Autentica usuário                              │
│  2. Query user_processes JOIN processes            │
│  3. Verifica se pertence ao usuário                │
│  4. Retorna dados completos (com movimentos)       │
└──────────────────┬──────────────────────────────────┘
                   │
                   │ Response: { processo: {...} }
                   │
                   ▼
┌─────────────────────────────────────────────────────┐
│  🖥️ /dashboard/processos/[id]                      │
│                                                     │
│  Renderiza:                                         │
│  ├─ Header com botão "Voltar"                      │
│  ├─ Botão [Atualizar do DataJud] ────────┐        │
│  ├─ Card: Informações Principais          │        │
│  ├─ Card: Assuntos                        │        │
│  ├─ Card: Partes                          │        │
│  └─ Card: Movimentações (timeline)        │        │
└───────────────────────────────────────────┼────────┘
                                            │
                          onClick           │
                    atualizarProcessoDataJud│
                                            │
                                            ▼
                    ┌────────────────────────────────┐
                    │ ⚠️ PROBLEMA CRÍTICO            │
                    │                                │
                    │ Busca no CLIENTE:              │
                    │ const resultado =              │
                    │   await buscarProcesso(numero) │
                    │                                │
                    │ Expõe API key no browser!      │
                    └────────────┬───────────────────┘
                                 │
                                 │ Dados do DataJud
                                 │
                                 ▼
┌─────────────────────────────────────────────────────┐
│  🔌 POST /api/processos/[id]/atualizar-datajud     │
│                                                     │
│  Body: { dadosDataJud }                            │
│                                                     │
│  1. Autentica usuário                              │
│  2. Verifica ownership do processo                 │
│  3. UPDATE em processes com novos dados            │
│  4. UPDATE timestamp em user_processes             │
└──────────────────┬──────────────────────────────────┘
                   │
                   │ Response: { success: true }
                   │
                   ▼
┌─────────────────────────────────────────────────────┐
│  🖥️ /dashboard/processos/[id]                      │
│                                                     │
│  • toast.success("Atualizado!")                    │
│  • fetchProcesso() → Recarrega dados               │
└─────────────────────────────────────────────────────┘
```

---

## 4. Fluxo de Edição

```
┌─────────────────────────────────────────────────────┐
│  📦 ProcessosTable - Linha do processo             │
│                                                     │
│  [✏️ Editar] ─────────────────────────────────────┐│
└───────────────────────────────────────────────────┼┘
                                                    │
                                    onClick         │
                                                    │
                                                    ▼
┌─────────────────────────────────────────────────────┐
│  📦 EditProcessoDialog                              │
│                                                     │
│  Form (pre-populado):                              │
│  • Apelido: processo.apelido                       │
│  • Notificar: processo.notificar                   │
│                                                     │
│  Validação: editProcessoSchema (Zod)               │
└──────────────────┬──────────────────────────────────┘
                   │
                   │ onSubmit → PATCH /api/processos/[id]
                   │ Body: { apelido, notificar }
                   │
                   ▼
┌─────────────────────────────────────────────────────┐
│  🔌 PATCH /api/processos/[id] (route.ts)           │
│                                                     │
│  1. Autentica usuário                              │
│  2. Valida input com Zod                           │
│  3. Verifica ownership                             │
│  4. UPDATE user_processes                          │
│     SET apelido = ?, notificar = ?                 │
│     WHERE id = ? AND user_id = ?                   │
└──────────────────┬──────────────────────────────────┘
                   │
                   │ Response: { processo: {...} }
                   │
                   ▼
┌─────────────────────────────────────────────────────┐
│  📦 EditProcessoDialog                              │
│                                                     │
│  • toast.success("Atualizado!")                    │
│  • setOpen(false)                                  │
│  • onSuccess() → fetchProcessos()                  │
└──────────────────┬──────────────────────────────────┘
                   │
                   │ Lista atualizada
                   │
                   ▼
┌─────────────────────────────────────────────────────┐
│  📦 ProcessosTable                                 │
│                                                     │
│  Mostra apelido/notificação atualizados            │
└─────────────────────────────────────────────────────┘
```

---

## 5. Fluxo de Exclusão

```
┌─────────────────────────────────────────────────────┐
│  📦 ProcessosTable - Linha do processo             │
│                                                     │
│  [🗑️ Excluir] ────────────────────────────────────┐│
└───────────────────────────────────────────────────┼┘
                                                    │
                                    onClick         │
                                                    │
                                                    ▼
┌─────────────────────────────────────────────────────┐
│  📦 DeleteProcessoDialog (AlertDialog)              │
│                                                     │
│  Confirmação:                                       │
│  "Remover acompanhamento do processo               │
│   [numero]? Esta ação não pode ser desfeita."      │
│                                                     │
│  [Cancelar]  [Remover]                             │
└──────────────────┬──────────────────────────────────┘
                   │
                   │ onClick Remover
                   │ → DELETE /api/processos/[id]
                   │
                   ▼
┌─────────────────────────────────────────────────────┐
│  🔌 DELETE /api/processos/[id] (route.ts)          │
│                                                     │
│  1. Autentica usuário                              │
│  2. Verifica ownership                             │
│  3. DELETE FROM user_processes                     │
│     WHERE id = ? AND user_id = ?                   │
│                                                     │
│  NOTA: Não deleta de processes (tabela global)     │
└──────────────────┬──────────────────────────────────┘
                   │
                   │ Response: { success: true }
                   │
                   ▼
┌─────────────────────────────────────────────────────┐
│  📦 DeleteProcessoDialog                            │
│                                                     │
│  • toast.success("Processo removido!")             │
│  • setOpen(false)                                  │
│  • onSuccess() → fetchProcessos()                  │
└──────────────────┬──────────────────────────────────┘
                   │
                   │ Lista atualizada
                   │
                   ▼
┌─────────────────────────────────────────────────────┐
│  📦 ProcessosTable                                 │
│                                                     │
│  Processo removido da lista                        │
└─────────────────────────────────────────────────────┘
```

---

## 6. Diagrama de Arquitetura Completo

```
┌──────────────────────────────────────────────────────────────────┐
│                        CAMADA DE APRESENTAÇÃO                     │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  /dashboard/processos                  /dashboard/processos/[id] │
│  ┌──────────────────────┐             ┌─────────────────────┐   │
│  │ • Lista de processos │             │ • Detalhes completos│   │
│  │ • Cards estatísticas │             │ • Timeline          │   │
│  │ • Botão adicionar    │             │ • Atualizar DataJud │   │
│  └──────────────────────┘             └─────────────────────┘   │
│           │                                      │               │
│           │ ProcessosTable                       │               │
│           ├─ AddProcessoDialog                   │               │
│           ├─ EditProcessoDialog                  │               │
│           └─ DeleteProcessoDialog                │               │
│                                                                   │
└───────────────────┬──────────────────────────────┬───────────────┘
                    │                              │
         ┌──────────┴──────────┐        ┌─────────┴────────┐
         │  Fetch processos     │        │ Fetch processo   │
         │  Add/Edit/Delete     │        │ Atualizar        │
         └──────────┬───────────┘        └─────────┬────────┘
                    │                              │
┌───────────────────┴──────────────────────────────┴───────────────┐
│                        CAMADA DE API                              │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  /api/processos                  /api/processos/[id]             │
│  ├─ GET (listar)                 ├─ GET (detalhes)               │
│  └─ POST (adicionar)             ├─ PATCH (editar)               │
│                                  ├─ DELETE (remover)              │
│                                  └─ /atualizar-datajud            │
│                                     └─ POST                       │
│                                                                   │
│  Helpers:                                                         │
│  ├─ getAuthenticatedUser() ⚠️ (não existe, criar)               │
│  ├─ buscarDadosDataJud() ⚠️ (duplicada)                         │
│  └─ obterUrlTribunal()                                           │
│                                                                   │
└───────────────────┬──────────────────────────────┬───────────────┘
                    │                              │
         ┌──────────┴──────────┐        ┌─────────┴────────┐
         │  Supabase Client     │        │ DataJud API      │
         │  Supabase Admin      │        │ ⚠️ Key exposta   │
         └──────────┬───────────┘        └──────────────────┘
                    │
┌───────────────────┴──────────────────────────────────────────────┐
│                        CAMADA DE DADOS                            │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Supabase PostgreSQL                                             │
│                                                                   │
│  ┌──────────────────┐              ┌──────────────────────┐     │
│  │  users           │              │  processes (global)   │     │
│  ├──────────────────┤              ├──────────────────────┤     │
│  │ id (PK)          │              │ id (PK)              │     │
│  │ auth_user_id     │◄─┐       ┌──│ numero (unique)      │     │
│  │ email            │  │       │  │ tribunal             │     │
│  └──────────────────┘  │       │  │ partes (jsonb)       │     │
│                        │       │  │ movimentos (jsonb) ⚠️│     │
│  ┌──────────────────┐  │       │  │ classe (jsonb)       │     │
│  │ user_processes   │  │       │  │ sistema (jsonb)      │     │
│  ├──────────────────┤  │       │  │ ...                  │     │
│  │ id (PK)          │  │       │  └──────────────────────┘     │
│  │ user_id (FK) ────┼──┘       │                               │
│  │ process_id (FK) ─┼──────────┘                               │
│  │ apelido          │                                           │
│  │ notificar        │                                           │
│  │ criado_em        │                                           │
│  │ atualizado_em    │                                           │
│  └──────────────────┘                                           │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘

Legenda:
─► Relação de chave estrangeira
⚠️ Ponto de atenção/problema
```

---

## 7. Problemas por Camada

### 🖥️ Camada de Apresentação

```
[🔴] Busca DataJud no cliente (page.tsx:79)
[🟡] Sem skeleton loaders adequados
[🟡] Sem filtros/busca
[🟡] Sem paginação
```

### 🔌 Camada de API

```
[🔴] API key hardcoded (route.ts:27-28)
[🔴] Função duplicada buscarDadosDataJud
[🟡] JOIN pesado com movimentos
[🟡] Verificação de duplicata quebrada
[🟡] Código de auth repetido
```

### 🗄️ Camada de Dados

```
[🟡] Campo movimentos pode ser muito grande
[🟢] RLS configurado corretamente
[🟢] Índices nas FKs
```

---

## 8. Fluxo Ideal (Após Refatoração)

```
Cliente                    API Server              DataJud API        Database
  │                            │                        │                │
  │ Clica [Atualizar]          │                        │                │
  ├───POST /atualizar──────────►                        │                │
  │                            │                        │                │
  │                            ├──Busca API key──────────────────────────►
  │                            │  de .env               │                │
  │                            │                        │                │
  │                            ├──POST buscar───────────►                │
  │                            │  processo              │                │
  │                            │                        │                │
  │                            │◄─────Dados─────────────┤                │
  │                            │                        │                │
  │                            ├──UPDATE process─────────────────────────►
  │                            │                        │                │
  │◄────{success: true}────────┤                        │                │
  │                            │                        │                │
  │ Recarrega dados            │                        │                │
  ├───GET /processos/[id]──────►                        │                │
  │                            │                        │                │
  │                            ├──SELECT────────────────────────────────►
  │                            │                        │                │
  │◄────{processo}─────────────┤                        │                │
  │                            │                        │                │

✅ API key segura no servidor
✅ Cliente nunca acessa DataJud diretamente
✅ Rate limiting aplicado no servidor
```

---

## 📊 Resumo de Endpoints

| Método | Rota                                    | Autenticação | Cache | Status                   |
| ------ | --------------------------------------- | ------------ | ----- | ------------------------ |
| GET    | `/api/processos`                        | ✅           | ❌    | 🟡 JOIN pesado           |
| POST   | `/api/processos`                        | ✅           | N/A   | 🟡 Verificação duplicata |
| GET    | `/api/processos/[id]`                   | ✅           | ❌    | ✅ OK                    |
| PATCH  | `/api/processos/[id]`                   | ✅           | N/A   | ✅ OK                    |
| DELETE | `/api/processos/[id]`                   | ✅           | N/A   | ✅ OK                    |
| POST   | `/api/processos/[id]/atualizar-datajud` | ✅           | ❌    | ✅ OK                    |

**Total:** 6 endpoints, 2 necessitam otimização
