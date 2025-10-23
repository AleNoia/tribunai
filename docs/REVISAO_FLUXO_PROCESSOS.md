Im# Revisão do Fluxo de Processos

## 📊 Visão Geral da Arquitetura

### Estrutura de Telas

- `/dashboard/processos` - Lista de processos acompanhados
- `/dashboard/processos/[id]` - Detalhes de um processo específico

### Estrutura de Endpoints

- `GET /api/processos` - Listar processos do usuário
- `POST /api/processos` - Adicionar novo processo
- `GET /api/processos/[id]` - Buscar processo específico
- `PATCH /api/processos/[id]` - Editar acompanhamento
- `DELETE /api/processos/[id]` - Remover acompanhamento
- `POST /api/processos/[id]/atualizar-datajud` - Atualizar dados do DataJud

---

## ✅ Pontos Positivos

### 1. Arquitetura Bem Estruturada

- Separação clara entre `processes` (dados globais) e `user_processes` (acompanhamentos)
- Uso de Supabase Admin para bypass de RLS onde necessário
- Schemas Zod para validação consistente

### 2. Tratamento de Erros Robusto

- Logging adequado em todos os endpoints
- Mensagens de erro claras para o usuário
- Try-catch em todas as operações críticas

### 3. UX Bem Pensada

- Estados de loading claros
- Feedback toast para ações
- Empty states informativos
- Cards de estatísticas na listagem

### 4. Componentização Adequada

- Diálogos reutilizáveis (Add, Edit, Delete)
- Tabela isolada em componente próprio
- Uso de shadcn/ui para consistência

---

## 🔴 Problemas Críticos

### 1. **Duplicação de Campos no Retorno da API**

**Localização:** `app/api/processos/route.ts` (linhas 131-152)

```typescript
const processos = (userProcesses || []).map((up: any) => ({
  id: up.id,
  process_id: up.processes?.id,
  numero: up.processes?.numero,
  tribunal: up.processes?.tribunal,
  apelido: up.apelido,
  notificar: up.notificar,
  created_at: up.criado_em, // ❌ Duplicado
  updated_at: up.atualizado_em, // ❌ Duplicado
  criado_em: up.criado_em, // ❌ Duplicado
  atualizado_em: up.atualizado_em, // ❌ Duplicado
  // ...
}));
```

**Impacto:** Confusão no frontend sobre qual campo usar

**Solução:** Padronizar em snake_case ou camelCase

---

### 2. **Verificação de Processo Existente com Falha de JOIN**

**Localização:** `app/api/processos/route.ts` (linhas 221-227)

```typescript
const { data: existingUserProcess } = await supabase
  .from("user_processes")
  .select("id, processes(numero)")
  .eq("user_id", internalUserId)
  .eq("processes.numero", numero) // ❌ Isso pode não funcionar corretamente
  .maybeSingle();
```

**Problema:** O filtro em JOIN pode não funcionar como esperado no Supabase

**Solução Recomendada:**

```typescript
// 1. Buscar o processo na tabela global
const { data: existingProcess } = await supabaseAdmin
  .from("processes")
  .select("id")
  .eq("numero", numero)
  .maybeSingle();

// 2. Se existir, verificar se o usuário já acompanha
if (existingProcess) {
  const { data: userProcess } = await supabaseAdmin
    .from("user_processes")
    .select("id")
    .eq("user_id", internalUserId)
    .eq("process_id", existingProcess.id)
    .maybeSingle();

  if (userProcess) {
    return NextResponse.json(
      { error: "Você já acompanha este processo" },
      { status: 409 }
    );
  }
}
```

---

### 3. **Função Duplicada de Busca DataJud**

**Problema:** A função `buscarDadosDataJud` está implementada em:

- `app/api/processos/route.ts` (linhas 10-51)
- `lib/datajud.ts` (presumivelmente, já que é importada na página de detalhes)

**Impacto:** Código duplicado, difícil manutenção

**Solução:** Usar apenas a função de `lib/datajud.ts`

---

### 4. **Busca DataJud no Cliente**

**Localização:** `app/dashboard/processos/[id]/page.tsx` (linha 79)

```typescript
const resultado = await buscarProcesso(processo.numero);
```

**Problema:** API key do DataJud exposta no cliente

**Solução:** Mover para o endpoint `/api/processos/[id]/atualizar-datajud`

```typescript
// Cliente apenas chama:
const response = await fetch(`/api/processos/${id}/atualizar-datajud`, {
  method: "POST",
  body: JSON.stringify({ numero: processo.numero }),
});

// Backend faz a busca no DataJud
```

---

### 5. **Falta de Debounce/Throttle na Atualização DataJud**

**Problema:** Usuário pode clicar múltiplas vezes no botão de atualizar

**Solução:** Adicionar debounce ou cooldown

```typescript
const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
const COOLDOWN_MS = 30000; // 30 segundos

const atualizarProcessoDataJud = async () => {
  if (lastUpdate && Date.now() - lastUpdate.getTime() < COOLDOWN_MS) {
    toast.error("Aguarde antes de atualizar novamente");
    return;
  }

  setLastUpdate(new Date());
  // ... resto do código
};
```

---

## ⚠️ Problemas de Performance

### 6. **JOIN Pesado na Listagem**

**Localização:** `app/api/processos/route.ts` (linhas 89-118)

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
      movimentos  // ❌ Isso pode ser MUITO pesado
    )
  `);
```

**Problema:** O campo `movimentos` pode ter dezenas/centenas de itens

**Solução:** Criar dois endpoints:

- `GET /api/processos` - Retorna resumo (sem movimentos)
- `GET /api/processos/[id]` - Retorna detalhes completos

---

### 7. **Falta de Paginação**

**Problema:** Se o usuário acompanhar 100+ processos, a tela ficará lenta

**Solução:** Implementar paginação server-side

```typescript
// Endpoint
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const offset = (page - 1) * limit;

  const { data, count } = await supabaseAdmin
    .from("user_processes")
    .select("*", { count: "exact" })
    .range(offset, offset + limit - 1);

  return NextResponse.json({
    processos: data,
    pagination: {
      page,
      limit,
      total: count,
      totalPages: Math.ceil((count || 0) / limit),
    },
  });
}
```

---

## 🎯 Melhorias de UX

### 8. **Falta de Filtros e Busca**

**Problema:** Difícil encontrar processo específico em lista grande

**Solução:** Adicionar filtros:

- Busca por número/apelido
- Filtro por tribunal
- Filtro por notificações ativas/desativas
- Ordenação por última atualização/data adição

---

### 9. **Loading States Inconsistentes**

**Problema:** Na página de detalhes, não há skeleton loader

**Solução:** Usar `ProcessSkeleton` ou criar novo skeleton específico

---

### 10. **Falta de Confirmação ao Sair com Edição**

**Problema:** Usuário pode perder dados ao fechar o dialog sem salvar

**Solução:** Adicionar `beforeunload` ou verificação de form dirty

```typescript
const {
  formState: { isDirty },
} = useForm();

const handleOpenChange = (newOpen: boolean) => {
  if (!newOpen && isDirty && !isLoading) {
    if (!confirm("Descartar alterações?")) {
      return;
    }
  }
  setOpen(newOpen);
};
```

---

## 🔒 Problemas de Segurança

### 11. **API Key Hardcoded**

**Localização:** `app/api/processos/route.ts` (linhas 27-28)

```typescript
Authorization: "APIKey cDZHYzlZa0JadVREZDJCendQbXY6SkJlTzNjLV9TRENyQk1RdnFKZGRQdw==";
```

**Solução:** Mover para variável de ambiente

```typescript
Authorization: `APIKey ${process.env.DATAJUD_API_KEY}`;
```

---

### 12. **Falta de Rate Limiting**

**Problema:** Usuário pode fazer spam de requisições à API

**Solução:** Implementar rate limiting com Upstash ou middleware Next.js

---

## 📋 Melhorias de Código

### 13. **Type Safety Melhorável**

**Problema:** Uso de `any` em vários lugares

```typescript
const processos = (userProcesses || []).map((up: any) => ({ // ❌
```

**Solução:** Criar interfaces TypeScript adequadas

```typescript
interface UserProcessWithProcess {
  id: string;
  apelido: string | null;
  notificar: boolean;
  criado_em: string;
  atualizado_em: string;
  processes: {
    id: string;
    numero: string;
    tribunal: string;
    // ...
  };
}

const processos = (userProcesses || []).map((up: UserProcessWithProcess) => ({
```

---

### 14. **Falta de Testes**

**Problema:** Sem testes unitários ou de integração

**Solução:** Adicionar testes para:

- Schemas Zod
- Endpoints da API
- Componentes de UI
- Fluxos completos

---

### 15. **Código Duplicado de Autenticação**

**Problema:** Todo endpoint repete o mesmo código de auth

**Solução:** Criar middleware ou helper

```typescript
// lib/api-helpers.ts
export async function getAuthenticatedUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("Não autorizado");
  }

  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("id")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (userError || !userData) {
    throw new Error("Usuário não encontrado");
  }

  return { authUser: user, internalUserId: userData.id };
}

// Uso:
export async function GET(req: NextRequest) {
  try {
    const { internalUserId } = await getAuthenticatedUser();
    // ... resto do código
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}
```

---

## 🚀 Novas Funcionalidades Sugeridas

### 16. **Cache de Dados do DataJud**

Evitar chamadas repetidas à API externa:

```typescript
// Adicionar campo na tabela processes:
// datajud_updated_at TIMESTAMP

// Só buscar se passou mais de X horas:
const CACHE_HOURS = 24;
const needsUpdate =
  !processo.datajud_updated_at ||
  Date.now() - new Date(processo.datajud_updated_at).getTime() >
    CACHE_HOURS * 3600000;
```

---

### 17. **Sincronização Automática em Background**

Atualizar processos automaticamente via Cron Job:

```typescript
// app/api/cron/sync-processos/route.ts
export async function GET() {
  // Verificar secret do Vercel Cron
  // Buscar todos os processos com notificar=true
  // Atualizar dados do DataJud
  // Enviar notificações se houver mudanças
}
```

---

### 18. **Notificações de Movimentações**

Implementar sistema de diff e notificações:

```typescript
// Comparar movimentos antigos com novos
const novosMovimentos = novosDados.movimentos.filter(
  (m) => !dadosAntigos.movimentos.some((old) => old.dataHora === m.dataHora)
);

// Enviar email/push se houver novos movimentos
if (novosMovimentos.length > 0 && processo.notificar) {
  await sendNotification(user.email, {
    processo: processo.numero,
    movimentos: novosMovimentos,
  });
}
```

---

### 19. **Export de Dados**

Permitir exportar lista de processos em PDF/CSV:

```typescript
// Componente
<Button onClick={exportToPDF}>
  <Download className="mr-2" />
  Exportar PDF
</Button>
```

---

### 20. **Timeline Visual**

Criar visualização de movimentações em timeline:

```typescript
// Componente TimelineProcesso
{
  processo.movimentos?.map((mov, idx) => (
    <TimelineItem
      key={idx}
      date={mov.dataHora}
      title={mov.nome}
      description={mov.complementosTabelados}
    />
  ));
}
```

---

## 📝 Checklist de Refatoração Prioritária

### Prioridade Alta 🔴

- [ ] Remover busca DataJud do cliente (item #4)
- [ ] Mover API key para .env (item #11)
- [ ] Corrigir verificação de processo existente (item #2)
- [ ] Remover função duplicada buscarDadosDataJud (item #3)

### Prioridade Média 🟡

- [ ] Padronizar nomes de campos na API (item #1)
- [ ] Otimizar JOIN na listagem (item #6)
- [ ] Adicionar paginação (item #7)
- [ ] Criar helper de autenticação (item #15)
- [ ] Adicionar rate limiting (item #12)

### Prioridade Baixa 🟢

- [ ] Adicionar filtros e busca (item #8)
- [ ] Melhorar loading states (item #9)
- [ ] Adicionar confirmação ao sair (item #10)
- [ ] Implementar testes (item #14)
- [ ] Adicionar novas funcionalidades (#16-20)

---

## 🏗️ Arquitetura Recomendada (Melhorada)

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENTE (Next.js)                     │
├─────────────────────────────────────────────────────────┤
│  /dashboard/processos                                    │
│    ├─ ProcessosTable (resumo, sem movimentos)           │
│    ├─ AddProcessoDialog                                 │
│    └─ Filtros/Busca                                     │
│                                                          │
│  /dashboard/processos/[id]                              │
│    ├─ Informações completas                             │
│    ├─ Timeline de movimentações                         │
│    └─ Botão de atualização (com cooldown)              │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                   API ROUTES (Next.js)                   │
├─────────────────────────────────────────────────────────┤
│  GET  /api/processos                                     │
│       └─ Lista resumida (paginada, sem movimentos)      │
│                                                          │
│  POST /api/processos                                     │
│       └─ Adiciona processo + busca DataJud (server)     │
│                                                          │
│  GET  /api/processos/[id]                               │
│       └─ Detalhes completos (com movimentos)            │
│                                                          │
│  PATCH /api/processos/[id]                              │
│       └─ Atualiza apelido/notificações                  │
│                                                          │
│  DELETE /api/processos/[id]                             │
│       └─ Remove acompanhamento                          │
│                                                          │
│  POST /api/processos/[id]/atualizar-datajud            │
│       └─ Busca DataJud no server (não no cliente!)     │
│       └─ Implementa rate limiting (1x a cada 30s)      │
│                                                          │
│  GET /api/cron/sync-processos (novo)                   │
│       └─ Atualiza todos processos com notificar=true   │
│       └─ Envia notificações de novas movimentações     │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                  LIB/HELPERS                             │
├─────────────────────────────────────────────────────────┤
│  lib/auth-helpers.ts (novo)                             │
│    └─ getAuthenticatedUser()                            │
│                                                          │
│  lib/datajud.ts                                         │
│    └─ buscarProcesso() - única implementação            │
│                                                          │
│  lib/rate-limit.ts (novo)                              │
│    └─ checkRateLimit()                                  │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                  BANCO DE DADOS                          │
├─────────────────────────────────────────────────────────┤
│  processes                                               │
│    ├─ datajud_updated_at (novo)                        │
│    └─ movimentos (apenas em detalhes)                  │
│                                                          │
│  user_processes                                         │
│    └─ (sem mudanças)                                    │
└─────────────────────────────────────────────────────────┘
```

---

## 🎓 Conclusão

O fluxo atual está funcional e bem estruturado, mas há espaço para melhorias significativas em:

1. **Segurança** - API key exposta no cliente
2. **Performance** - JOINs pesados e falta de paginação
3. **Manutenibilidade** - Código duplicado de auth e busca DataJud
4. **UX** - Falta de filtros, busca e rate limiting visual

Recomendo implementar as melhorias na ordem da prioridade listada acima.
