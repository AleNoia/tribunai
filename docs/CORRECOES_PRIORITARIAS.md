# Correções Prioritárias - Implementação Imediata

## 🎯 Objetivo

Resolver os **5 problemas mais críticos** identificados na revisão do fluxo de processos.

**Tempo estimado:** 4-5 horas  
**Prioridade:** 🔴 URGENTE

---

## Problema #1: API Key Exposta no Cliente

### 🔴 Código Atual (INSEGURO)

**Arquivo:** `app/dashboard/processos/[id]/page.tsx` (linha 79)

```typescript
const atualizarProcessoDataJud = async () => {
  // ❌ PROBLEMA: Busca no cliente expõe API key
  const resultado = await buscarProcesso(processo.numero);

  if (!resultado.success || !resultado.processo) {
    throw new Error(resultado.error || "Erro ao buscar dados no DataJud");
  }

  // Depois envia para o servidor...
  const response = await fetch(`/api/processos/${id}/atualizar-datajud`, {
    method: "POST",
    body: JSON.stringify({ dadosDataJud: resultado.processo }),
  });
};
```

### ✅ Correção

**1. Modificar `app/dashboard/processos/[id]/page.tsx`:**

```typescript
const atualizarProcessoDataJud = async () => {
  if (!processo?.numero) return;

  try {
    setUpdating(true);
    toast.info("Buscando dados atualizados no DataJud...");

    // ✅ SOLUÇÃO: Backend busca os dados
    const response = await fetch(`/api/processos/${id}/atualizar-datajud`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        numero: processo.numero, // Apenas envia o número
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Erro ao atualizar processo");
    }

    logger.info("Processo atualizado do DataJud", {
      action: "update_processo_datajud",
      metadata: { id },
    });

    toast.success("Dados atualizados com sucesso!");
    await fetchProcesso();
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Erro desconhecido";

    logger.error("Erro ao atualizar do DataJud", {
      action: "update_processo_datajud_error",
      metadata: { error: errorMessage, id },
    });

    toast.error(errorMessage);
  } finally {
    setUpdating(false);
  }
};
```

**2. Modificar `app/api/processos/[id]/atualizar-datajud/route.ts`:**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { logger } from "@/lib/logger";
import { buscarProcesso } from "@/lib/datajud"; // ✅ Usar lib compartilhada

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { numero } = body;

    if (!numero) {
      return NextResponse.json(
        { error: "Número do processo não fornecido" },
        { status: 400 }
      );
    }

    // Autenticar usuário
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    // Buscar user_id interno
    const { data: internalUser, error: userError } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("auth_user_id", user.id)
      .maybeSingle();

    if (userError || !internalUser) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    // Verificar ownership
    const { data: userProcess, error: fetchError } = await supabaseAdmin
      .from("user_processes")
      .select("process_id")
      .eq("id", id)
      .eq("user_id", internalUser.id)
      .maybeSingle();

    if (fetchError || !userProcess) {
      return NextResponse.json(
        { error: "Processo não encontrado" },
        { status: 404 }
      );
    }

    // ✅ BUSCAR DADOS DO DATAJUD NO SERVIDOR
    const resultado = await buscarProcesso(numero);

    if (!resultado.success || !resultado.processo) {
      return NextResponse.json(
        { error: resultado.error || "Erro ao buscar dados no DataJud" },
        { status: 400 }
      );
    }

    const dadosDataJud = resultado.processo;

    // Atualizar processo
    const { error: updateError } = await supabaseAdmin
      .from("processes")
      .update({
        partes: dadosDataJud.partes || {},
        ultima_movimentacao:
          dadosDataJud.movimentos && dadosDataJud.movimentos.length > 0
            ? {
                data: dadosDataJud.movimentos[0].dataHora,
                descricao: dadosDataJud.movimentos[0].nome,
              }
            : null,
        classe: dadosDataJud.classe || null,
        sistema: dadosDataJud.sistema || null,
        formato: dadosDataJud.formato || null,
        data_ajuizamento: dadosDataJud.dataAjuizamento || null,
        grau: dadosDataJud.grau || null,
        orgao_julgador: dadosDataJud.orgaoJulgador || null,
        assuntos: dadosDataJud.assuntos || null,
        movimentos: dadosDataJud.movimentos || null,
        atualizado_em: new Date().toISOString(),
      })
      .eq("id", userProcess.process_id);

    if (updateError) {
      logger.error("Erro ao atualizar processo", {
        action: "update_processo_datajud",
        metadata: {
          processId: userProcess.process_id,
          error: updateError.message,
        },
      });
      return NextResponse.json(
        { error: "Erro ao atualizar processo no banco de dados" },
        { status: 500 }
      );
    }

    // Atualizar timestamp
    await supabaseAdmin
      .from("user_processes")
      .update({ atualizado_em: new Date().toISOString() })
      .eq("id", id);

    logger.info("Processo atualizado com dados do DataJud", {
      action: "update_processo_datajud",
      metadata: { id, processId: userProcess.process_id },
    });

    return NextResponse.json({
      success: true,
      message: "Processo atualizado com sucesso",
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    logger.error("Erro não tratado ao atualizar processo do DataJud", {
      action: "update_processo_datajud",
      metadata: { error: errorMessage },
    });

    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
```

**3. Remover import de `buscarProcesso` do cliente:**

```typescript
// ❌ Remover esta linha de page.tsx:
import { buscarProcesso } from "@/lib/datajud";
```

---

## Problema #2: API Key Hardcoded

### 🔴 Código Atual

**Arquivo:** `app/api/processos/route.ts` (linha 27-28)

```typescript
headers: {
  "Content-Type": "application/json",
  Authorization: "APIKey cDZHYzlZa0JadVREZDJCendQbXY6SkJlTzNjLV9TRENyQk1RdnFKZGRQdw==",
},
```

### ✅ Correção

**1. Criar `.env.local` (desenvolvimento):**

```bash
# DataJud API
DATAJUD_API_KEY=cDZHYzlZa0JadVREZDJCendQbXY6SkJlTzNjLV9TRENyQk1RdnFKZGRQdw==
```

**2. Criar `.env.production` (produção):**

```bash
# DataJud API
DATAJUD_API_KEY=cDZHYzlZa0JadVREZDJCendQbXY6SkJlTzNjLV9TRENyQk1RdnFKZGRQdw==
```

**3. Adicionar ao `.gitignore`:**

```gitignore
# Env files
.env*.local
.env.production
```

**4. Modificar `lib/datajud.ts`:**

```typescript
export async function buscarProcesso(numero: string) {
  try {
    const numeroLimpo = numero.replace(/\D/g, "");
    const apiUrl = obterUrlTribunal(numeroLimpo);

    // ✅ SOLUÇÃO: Usar variável de ambiente
    const apiKey = process.env.DATAJUD_API_KEY;

    if (!apiKey) {
      throw new Error("DATAJUD_API_KEY não configurada");
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
        Authorization: `APIKey ${apiKey}`, // ✅ Usar variável
      },
      body: JSON.stringify(query),
    });

    // ... resto do código
  }
}
```

**5. Remover função duplicada de `app/api/processos/route.ts`:**

```typescript
// ❌ DELETAR toda esta função (linhas 10-51):
async function buscarDadosDataJud(
  numero: string
): Promise<DataJudProcesso | null> {
  // ...
}

// ✅ Importar da lib:
import { buscarProcesso } from "@/lib/datajud";

// ✅ No código do POST, trocar:
// const dadosDataJud = await buscarDadosDataJud(numero);
const resultado = await buscarProcesso(numero);
const dadosDataJud = resultado.success ? resultado.processo : null;
```

---

## Problema #3: JOIN Pesado na Listagem

### 🔴 Código Atual

**Arquivo:** `app/api/processos/route.ts` (linha 113)

```typescript
const { data: userProcesses } = await supabaseAdmin.from("user_processes")
  .select(`
    id,
    apelido,
    notificar,
    criado_em,
    atualizado_em,
    processes (
      id,
      numero,
      tribunal,
      partes,
      ultima_movimentacao,
      atualizado_em,
      classe,
      sistema,
      formato,
      data_ajuizamento,
      grau,
      orgao_julgador,
      assuntos,
      movimentos  // ❌ Muito pesado!
    )
  `);
```

### ✅ Correção

**Modificar `app/api/processos/route.ts`:**

```typescript
// ✅ SOLUÇÃO: Remover movimentos da listagem
const { data: userProcesses } = await supabaseAdmin
  .from("user_processes")
  .select(
    `
    id,
    apelido,
    notificar,
    criado_em,
    atualizado_em,
    processes (
      id,
      numero,
      tribunal,
      partes,
      ultima_movimentacao,
      atualizado_em,
      classe,
      sistema,
      formato,
      data_ajuizamento,
      grau,
      orgao_julgador,
      assuntos
    )
  `
  )
  .eq("user_id", internalUserId)
  .order("atualizado_em", { ascending: false });

// Movimentos completos só no endpoint de detalhes (/api/processos/[id])
```

**Remover do tipo de retorno:**

```typescript
const processos = (userProcesses || []).map((up: any) => ({
  id: up.id,
  process_id: up.processes?.id,
  numero: up.processes?.numero,
  tribunal: up.processes?.tribunal,
  apelido: up.apelido,
  notificar: up.notificar,
  criado_em: up.criado_em,
  atualizado_em: up.atualizado_em,
  ultima_movimentacao: up.processes?.ultima_movimentacao,
  partes: up.processes?.partes,
  classe: up.processes?.classe,
  sistema: up.processes?.sistema,
  formato: up.processes?.formato,
  dataAjuizamento: up.processes?.data_ajuizamento,
  grau: up.processes?.grau,
  orgaoJulgador: up.processes?.orgao_julgador,
  assuntos: up.processes?.assuntos,
  // ✅ Remover: movimentos: up.processes?.movimentos,
}));
```

---

## Problema #4: Verificação de Duplicata Quebrada

### 🔴 Código Atual

**Arquivo:** `app/api/processos/route.ts` (linha 221-227)

```typescript
// ❌ PROBLEMA: JOIN com filtro pode não funcionar
const { data: existingUserProcess } = await supabase
  .from("user_processes")
  .select("id, processes(numero)")
  .eq("user_id", internalUserId)
  .eq("processes.numero", numero)
  .maybeSingle();
```

### ✅ Correção

**Modificar `app/api/processos/route.ts`:**

```typescript
// ✅ SOLUÇÃO: Separar em 2 queries

// 1. Buscar processo na tabela global
const { data: existingProcess } = await supabaseAdmin
  .from("processes")
  .select("id")
  .eq("numero", numero)
  .maybeSingle();

let processId: string;

if (existingProcess) {
  // 2. Verificar se usuário já acompanha
  const { data: existingUserProcess } = await supabaseAdmin
    .from("user_processes")
    .select("id")
    .eq("user_id", internalUserId)
    .eq("process_id", existingProcess.id)
    .maybeSingle();

  if (existingUserProcess) {
    return NextResponse.json(
      { error: "Você já acompanha este processo" },
      { status: 409 }
    );
  }

  processId = existingProcess.id;
} else {
  // Processo não existe, criar novo
  const resultado = await buscarProcesso(numero);
  const dadosDataJud = resultado.success ? resultado.processo : null;

  const { data: newProcess, error: createError } = await supabaseAdmin
    .from("processes")
    .insert({
      numero,
      tribunal,
      partes: dadosDataJud?.partes || {},
      ultima_movimentacao:
        dadosDataJud?.movimentos && dadosDataJud.movimentos.length > 0
          ? {
              data: dadosDataJud.movimentos[0].dataHora,
              descricao: dadosDataJud.movimentos[0].nome,
            }
          : null,
      classe: dadosDataJud?.classe || null,
      sistema: dadosDataJud?.sistema || null,
      formato: dadosDataJud?.formato || null,
      data_ajuizamento: dadosDataJud?.dataAjuizamento || null,
      grau: dadosDataJud?.grau || null,
      orgao_julgador: dadosDataJud?.orgaoJulgador || null,
      assuntos: dadosDataJud?.assuntos || null,
      movimentos: dadosDataJud?.movimentos || null,
    })
    .select("id")
    .single();

  if (createError || !newProcess) {
    logger.error("Erro ao criar processo", {
      action: "create_processo_error",
      userId: user.id,
      metadata: { error: createError?.message },
    });
    return NextResponse.json(
      { error: "Erro ao criar processo" },
      { status: 500 }
    );
  }

  processId = newProcess.id;
}

// Criar vínculo user_processes
const { data: userProcess, error: linkError } = await supabaseAdmin
  .from("user_processes")
  .insert({
    user_id: internalUserId,
    process_id: processId,
    apelido: apelido || null,
    notificar,
  })
  .select(/* ... */)
  .single();

// ... resto do código
```

---

## Problema #5: Código de Autenticação Duplicado

### 🔴 Problema

Todos os endpoints repetem o mesmo código:

```typescript
const supabase = await createClient();
const {
  data: { user },
  error: authError,
} = await supabase.auth.getUser();
if (authError || !user) {
  return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
}

const { data: userData, error: userError } = await supabase
  .from("users")
  .select("id")
  .eq("auth_user_id", user.id)
  .maybeSingle();

if (userError || !userData) {
  return NextResponse.json(
    { error: "Usuário não encontrado" },
    { status: 404 }
  );
}
```

### ✅ Correção

**1. Criar `lib/auth-helpers.ts`:**

```typescript
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { logger } from "@/lib/logger";

export interface AuthenticatedUser {
  authUser: {
    id: string;
    email?: string;
  };
  internalUserId: string;
}

/**
 * Autentica o usuário e retorna IDs
 * @throws Error se não autenticado
 */
export async function getAuthenticatedUser(): Promise<AuthenticatedUser> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    logger.warn("Tentativa de acesso não autenticado", {
      action: "auth_failed",
      metadata: { error: authError?.message },
    });
    throw new Error("Não autorizado");
  }

  const { data: userData, error: userError } = await supabaseAdmin
    .from("users")
    .select("id")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (userError || !userData) {
    logger.error("Usuário autenticado mas não encontrado na tabela users", {
      action: "user_not_found",
      userId: user.id,
      metadata: { error: userError?.message },
    });
    throw new Error("Usuário não encontrado");
  }

  return {
    authUser: {
      id: user.id,
      email: user.email,
    },
    internalUserId: userData.id,
  };
}

/**
 * Wrapper para handlers de API com autenticação
 */
export function withAuth(
  handler: (
    req: any,
    context: any,
    auth: AuthenticatedUser
  ) => Promise<NextResponse>
) {
  return async (req: any, context: any) => {
    try {
      const auth = await getAuthenticatedUser();
      return await handler(req, context, auth);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Erro de autenticação";
      const status = message === "Não autorizado" ? 401 : 404;
      return NextResponse.json({ error: message }, { status });
    }
  };
}
```

**2. Usar nos endpoints:**

```typescript
// ✅ ANTES (route.ts)
export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    // ... 15 linhas de código de auth ...

    // Lógica do endpoint
  } catch (error) {
    // ...
  }
}

// ✅ DEPOIS (route.ts)
import { withAuth } from "@/lib/auth-helpers";

export const GET = withAuth(async (req, context, auth) => {
  try {
    const { internalUserId } = auth;

    // Lógica do endpoint diretamente
    const { data: userProcesses } = await supabaseAdmin
      .from("user_processes")
      .select("...")
      .eq("user_id", internalUserId);

    return NextResponse.json({ processos: userProcesses });
  } catch (error) {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
});
```

---

## 📋 Checklist de Implementação

### Sprint Urgente (4-5h)

```bash
[ ] 1. Problema #2 - API Key Hardcoded (15 min)
    [ ] Criar .env.local
    [ ] Criar .env.production
    [ ] Modificar lib/datajud.ts
    [ ] Testar localmente
    [ ] Adicionar .env* ao .gitignore

[ ] 2. Problema #1 - API Key Exposta (2h)
    [ ] Modificar page.tsx (remover buscarProcesso)
    [ ] Modificar route.ts (endpoint atualizar-datajud)
    [ ] Remover função duplicada de route.ts
    [ ] Testar fluxo completo
    [ ] Verificar no DevTools que não há chamadas ao DataJud

[ ] 3. Problema #3 - JOIN Pesado (30 min)
    [ ] Remover campo movimentos da listagem
    [ ] Atualizar tipo de retorno
    [ ] Testar performance
    [ ] Verificar que detalhes ainda funcionam

[ ] 4. Problema #4 - Verificação Duplicata (1h)
    [ ] Separar em 2 queries
    [ ] Testar cenários:
        [ ] Adicionar processo novo
        [ ] Adicionar processo existente (outro usuário)
        [ ] Tentar adicionar processo já acompanhado
    [ ] Verificar mensagens de erro

[ ] 5. Problema #5 - Código Duplicado Auth (1h)
    [ ] Criar lib/auth-helpers.ts
    [ ] Migrar GET /api/processos
    [ ] Migrar POST /api/processos
    [ ] Migrar demais endpoints
    [ ] Testar autenticação
```

---

## 🧪 Testes Manuais

Após implementar as correções, testar:

### Teste 1: Adicionar Processo

```
1. Login no sistema
2. Ir para /dashboard/processos
3. Clicar em "Acompanhar Processo"
4. Preencher formulário
5. ✅ Verificar que processo aparece na lista
6. ✅ Abrir DevTools → Network
7. ✅ Confirmar que NÃO há chamadas para datajud.cnj.jus.br do cliente
```

### Teste 2: Atualizar do DataJud

```
1. Abrir detalhes de um processo
2. Clicar em "Atualizar do DataJud"
3. ✅ Verificar toast de sucesso
4. ✅ Dados atualizados na tela
5. ✅ DevTools → Network: chamada apenas para /api/processos/[id]/atualizar-datajud
```

### Teste 3: Performance

```
1. Adicionar 10+ processos
2. Ir para /dashboard/processos
3. ✅ Abrir DevTools → Network
4. ✅ Verificar tamanho do response (deve ser menor sem movimentos)
5. ✅ Página deve carregar rápido (<1s)
```

### Teste 4: Duplicata

```
1. Adicionar processo X
2. Tentar adicionar processo X novamente
3. ✅ Deve mostrar erro "Você já acompanha este processo"
```

### Teste 5: Autenticação

```
1. Logout do sistema
2. Tentar acessar /api/processos diretamente
3. ✅ Deve retornar 401 Unauthorized
```

---

## 🚀 Deploy

### 1. Configurar Variáveis de Ambiente (Vercel/Plataforma)

```bash
DATAJUD_API_KEY=cDZHYzlZa0JadVREZDJCendQbXY6SkJlTzNjLV9TRENyQk1RdnFKZGRQdw==
```

### 2. Fazer Deploy

```bash
git add .
git commit -m "fix: correções críticas de segurança e performance"
git push origin main
```

### 3. Validar Produção

- [ ] Testar login
- [ ] Testar adicionar processo
- [ ] Testar atualizar do DataJud
- [ ] Verificar logs de erro

---

## 📊 Métricas Esperadas

### Antes

- 🔴 API key exposta no bundle JS (~50KB)
- 🔴 Response listagem: ~500KB (com movimentos)
- 🔴 Tempo de carregamento: 2-3s
- 🔴 Possibilidade de adicionar duplicatas

### Depois

- ✅ API key segura no servidor (0KB no bundle)
- ✅ Response listagem: ~100KB (sem movimentos)
- ✅ Tempo de carregamento: <1s
- ✅ Validação de duplicatas funcionando

**Melhoria estimada:** 80% redução no tamanho dos dados, 100% mais seguro

---

## 🆘 Troubleshooting

### Erro: "DATAJUD_API_KEY não configurada"

**Solução:** Verificar se `.env.local` existe e contém a chave

### Erro: "Você já acompanha este processo" (falso positivo)

**Solução:** Verificar se a query de duplicata está usando `process_id` correto

### Performance ainda lenta

**Solução:** Verificar no Network tab se o campo `movimentos` foi realmente removido

### Deploy falha com "Unauthorized"

**Solução:** Configurar `DATAJUD_API_KEY` nas variáveis de ambiente da plataforma

---

## 📝 Notas Finais

- ⚠️ Fazer backup do banco antes de aplicar mudanças
- ⚠️ Testar em ambiente de desenvolvimento primeiro
- ⚠️ Revisar logs após deploy
- ✅ Essas correções são **breaking changes mínimos**
- ✅ Frontend não precisa ser alterado significativamente
- ✅ Banco de dados não precisa migration

**Tempo total:** 4-5 horas  
**Risco:** Baixo (mudanças isoladas)  
**Impacto:** Alto (segurança + performance)
