# Sistema de Monitoramento Automático de Processos

## Visão Geral

Sistema completo para monitoramento automático de movimentações processuais, comparando dados da API DataJud periodicamente e notificando usuários sobre atualizações.

## Arquitetura

### 1. Banco de Dados

#### Tabela `notifications`

```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  user_process_id UUID REFERENCES user_processes,
  process_id UUID REFERENCES processes,

  tipo VARCHAR(50), -- 'nova_movimentacao', 'atualizacao', 'alerta'
  titulo TEXT,
  mensagem TEXT,

  movimento_data TIMESTAMPTZ,
  movimento_nome TEXT,
  movimento_complementos JSONB,

  lida BOOLEAN DEFAULT false,
  lida_em TIMESTAMPTZ,
  criado_em TIMESTAMPTZ DEFAULT now()
);
```

**Índices otimizados:**

- `idx_notifications_user_id` - Buscar notificações do usuário
- `idx_notifications_lida` - Filtrar por lidas/não lidas
- `idx_notifications_user_lida` - Combinado para queries frequentes

**RLS (Row Level Security):**

- ✅ Usuários veem apenas suas notificações
- ✅ Sistema pode inserir via service role
- ✅ Usuários podem marcar como lida/deletar

### 2. Serviço de Monitoramento

**`lib/services/monitor-processos.ts`**

#### Funções principais:

##### `executarMonitoramento()`

Função principal que:

1. Busca todos os processos com notificações ativas
2. Para cada processo:
   - Consulta API DataJud
   - Compara com última movimentação registrada
   - Detecta novas movimentações
   - Atualiza banco de dados
   - Cria notificações
3. Retorna estatísticas da execução

##### `monitorarProcesso(processo)`

Monitora um processo específico:

- Busca dados atualizados no DataJud
- Detecta novas movimentações
- Atualiza tabela `processes`
- Cria notificações individuais (max 5)
- Cria notificação resumida se > 5 movimentações

##### `detectarNovasMovimentacoes(processo, movimentos)`

Compara movimentações:

- Se não há última movimentação → todas são novas
- Filtra movimentos com data posterior à última registrada
- Retorna array de novas movimentações

##### `criarNotificacao(userId, processId, movimento)`

Cria notificação no banco:

- Extrai dados da movimentação
- Formata título e mensagem
- Salva na tabela `notifications`

### 3. Cron Job

**`app/api/cron/monitor-processos/route.ts`**

#### Segurança:

```typescript
// Verificar token secreto
const authHeader = req.headers.get("authorization");
if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
  return 401 Unauthorized;
}
```

#### Resposta:

```json
{
  "success": true,
  "stats": {
    "total": 50,
    "sucesso": 48,
    "falhas": 2,
    "novasMovimentacoes": 12
  },
  "timestamp": "2025-10-22T12:00:00Z"
}
```

### 4. Configuração Vercel Cron

**`vercel.json`**

```json
{
  "crons": [
    {
      "path": "/api/cron/monitor-processos",
      "schedule": "0 */6 * * *"
    }
  ]
}
```

**Schedule:** Executa a cada 6 horas (00:00, 06:00, 12:00, 18:00)

**Formato cron:**

- `0` - minuto 0
- `*/6` - a cada 6 horas
- `*` - todos os dias
- `*` - todos os meses
- `*` - todos os dias da semana

### 5. APIs de Notificações

#### GET `/api/notificacoes`

Lista notificações do usuário

**Query params:**

- `apenas_nao_lidas=true` - Filtrar apenas não lidas
- `limit=50` - Limitar quantidade (padrão: 50)

**Resposta:**

```json
{
  "notificacoes": [
    {
      "id": "uuid",
      "tipo": "nova_movimentacao",
      "titulo": "Nova movimentação processual",
      "mensagem": "Processo 00012345...: Sentença publicada",
      "movimento_data": "2025-10-22T10:00:00Z",
      "lida": false,
      "criado_em": "2025-10-22T10:05:00Z",
      "user_processes": {
        "processes": {
          "numero": "00012345620244013202",
          "tribunal": "TJAL"
        }
      }
    }
  ],
  "nao_lidas": 5
}
```

#### PATCH `/api/notificacoes/[id]`

Marcar notificação como lida/não lida

**Body:**

```json
{
  "lida": true
}
```

#### DELETE `/api/notificacoes/[id]`

Deletar notificação

#### POST `/api/notificacoes/marcar-todas-lidas`

Marcar todas como lidas

### 6. Componentes UI

#### `<NotificationBell />`

- Sino de notificações no header
- Badge com contador de não lidas
- Atualização automática a cada 5 minutos
- Abre Sheet lateral com lista

#### `<NotificationList />`

- Lista de notificações
- Filtros: Todas / Não lidas
- Ações: Marcar lida, Deletar
- Click na notificação → navega para processo
- Botão "Marcar todas como lidas"

## Fluxo Completo

```
1. CRON JOB (a cada 6h)
   ↓
2. Vercel executa → /api/cron/monitor-processos
   ↓
3. executarMonitoramento()
   ↓
4. Para cada processo com notificações ativas:
   a. Buscar dados DataJud
   b. Comparar movimentações
   c. Detectar novas
   d. Atualizar banco
   e. Criar notificações
   ↓
5. Usuário acessa sistema
   ↓
6. NotificationBell busca contador
   ↓
7. Badge mostra quantidade não lidas
   ↓
8. Usuário clica → abre Sheet
   ↓
9. NotificationList carrega lista
   ↓
10. Usuário clica na notificação → navega para processo
    OU
11. Marca como lida / Deleta
```

## Variáveis de Ambiente

```env
# API DataJud
DATAJUD_API_KEY=sua_chave_api

# Segurança Cron
CRON_SECRET=token_secreto_gerado

# Supabase (já existentes)
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

## Deploy

### 1. Migração do Banco

```bash
# Executar migration
psql -h db.xxx.supabase.co -U postgres -d postgres < supabase/migrations/create_notifications_table.sql
```

### 2. Configurar Variáveis

Na Vercel:

1. Settings → Environment Variables
2. Adicionar `CRON_SECRET` (gerar com `openssl rand -base64 32`)
3. Adicionar `DATAJUD_API_KEY`

### 3. Deploy

```bash
# Deploy automático via Git push
git push origin main

# OU deploy manual
vercel --prod
```

### 4. Verificar Cron

Após deploy:

1. Vercel Dashboard → Projeto → Cron Jobs
2. Verificar "monitor-processos" aparece na lista
3. Verificar próxima execução agendada

### 5. Testar Manualmente

```bash
curl -X POST https://seu-dominio.vercel.app/api/cron/monitor-processos \
  -H "Authorization: Bearer SEU_CRON_SECRET"
```

## Monitoramento e Logs

### Logs do Cron

```typescript
logger.info("Monitoramento concluído", {
  action: "monitor_complete",
  metadata: {
    total: 50,
    sucesso: 48,
    falhas: 2,
    novasMovimentacoes: 12,
    duracao: "142.5s",
  },
});
```

### Verificar Execução

1. **Vercel Logs:**

   - Dashboard → Functions → Cron executions
   - Ver logs de cada execução

2. **Banco de Dados:**

   ```sql
   -- Notificações criadas hoje
   SELECT COUNT(*) FROM notifications
   WHERE criado_em::date = CURRENT_DATE;

   -- Processos monitorados
   SELECT COUNT(*) FROM user_processes
   WHERE notificar = true;
   ```

3. **Endpoint de Status:**
   Criar `/api/cron/status`:
   ```typescript
   // Retornar última execução, estatísticas, etc.
   ```

## Performance

### Otimizações Implementadas

1. **Delay entre requisições:** 2s para não sobrecarregar DataJud
2. **Limite de notificações:** Max 5 por processo, resumo para demais
3. **Índices do banco:** Otimizados para queries frequentes
4. **Query otimizada:** JOIN apenas dados necessários

### Estimativas

- **50 processos**: ~150 segundos (com delay 2s)
- **100 processos**: ~300 segundos (5 minutos)
- **500 processos**: ~1500 segundos (25 minutos)

**Nota:** Vercel Cron tem timeout de 60 segundos no plano gratuito. Para mais processos, considerar:

- Plano Pro (timeout 300s)
- Dividir em batches menores
- Usar Supabase Edge Functions + pg_cron

## Alternativas ao Vercel Cron

### 1. Supabase pg_cron + Edge Functions

```sql
-- Criar cron job no Supabase
SELECT cron.schedule(
  'monitor-processos',
  '0 */6 * * *',
  $$
  SELECT net.http_post(
    url := 'https://seu-dominio.vercel.app/api/cron/monitor-processos',
    headers := '{"Authorization": "Bearer TOKEN"}'::jsonb
  );
  $$
);
```

### 2. GitHub Actions

```yaml
# .github/workflows/monitor.yml
name: Monitor Processos

on:
  schedule:
    - cron: "0 */6 * * *"

jobs:
  monitor:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger cron
        run: |
          curl -X POST ${{ secrets.CRON_URL }} \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}"
```

### 3. External Cron Service

- **cron-job.org** (gratuito)
- **EasyCron** (gratuito até 20 jobs)
- **AWS EventBridge** (pago)

## Melhorias Futuras

- [ ] Email notifications via Resend/SendGrid
- [ ] Push notifications (PWA)
- [ ] Webhook para integrações
- [ ] Dashboard de estatísticas
- [ ] Configurar horários preferidos de notificação
- [ ] Filtrar tipos de movimentação importantes
- [ ] Priorizar processos críticos
- [ ] Retry automático em caso de falha
- [ ] Circuit breaker para DataJud API

## Troubleshooting

### Cron não executa

1. Verificar `vercel.json` está no root
2. Verificar deploy foi bem sucedido
3. Verificar região do projeto (alguns planos limitam)
4. Ver logs no Vercel Dashboard

### Notificações não aparecem

1. Verificar RLS policies no Supabase
2. Verificar user_id correto
3. Verificar `notificar = true` no processo
4. Ver logs do cron endpoint

### Timeout no cron

1. Reduzir `limit` de processos por execução
2. Aumentar delay entre requisições
3. Considerar upgrade Vercel Pro
4. Dividir em batches menores

## Suporte

Em caso de dúvidas:

1. Verificar logs no Vercel
2. Verificar tabela notifications no Supabase
3. Testar endpoint manualmente
4. Consultar documentação Vercel Cron
