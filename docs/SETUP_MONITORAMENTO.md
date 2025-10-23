# Setup do Sistema de Monitoramento

Guia rápido para configurar o sistema de monitoramento automático.

## Pré-requisitos

- Projeto Next.js configurado
- Supabase configurado
- Conta Vercel (ou alternativa para cron)

## Passo 1: Executar Migration

```bash
# Via Supabase CLI
supabase db push

# OU via SQL no Dashboard do Supabase
# Copiar conteúdo de: supabase/migrations/create_notifications_table.sql
# Colar no SQL Editor e executar
```

Verificar:

```sql
SELECT * FROM notifications LIMIT 1;
```

## Passo 2: Configurar Variáveis de Ambiente

### Local (.env.local)

```bash
# Copiar exemplo
cp .env.example .env.local

# Gerar CRON_SECRET
openssl rand -base64 32

# Editar .env.local com suas chaves reais
```

### Vercel (Production)

1. Acessar projeto no Vercel Dashboard
2. Settings → Environment Variables
3. Adicionar:

```
DATAJUD_API_KEY = sua_chave_api
CRON_SECRET = token_gerado
SUPABASE_SERVICE_ROLE_KEY = sua_service_role_key
```

## Passo 3: Deploy

```bash
# Via Git
git add .
git commit -m "feat: sistema de monitoramento"
git push origin main

# Vercel fará deploy automático
```

## Passo 4: Verificar Cron Job

1. Acessar Vercel Dashboard
2. Projeto → Settings → Cron Jobs
3. Verificar se "monitor-processos" está listado
4. Ver horário da próxima execução

## Passo 5: Teste Manual

### Testar endpoint localmente

```bash
# Terminal 1: Rodar servidor
npm run dev

# Terminal 2: Chamar cron
curl -X POST http://localhost:3000/api/cron/monitor-processos \
  -H "Authorization: Bearer SEU_CRON_SECRET_LOCAL" \
  -H "Content-Type: application/json"
```

### Testar em produção

```bash
curl -X POST https://seu-app.vercel.app/api/cron/monitor-processos \
  -H "Authorization: Bearer SEU_CRON_SECRET_PRODUCAO" \
  -H "Content-Type: application/json"
```

Resposta esperada:

```json
{
  "success": true,
  "message": "Monitoramento executado com sucesso",
  "stats": {
    "total": 5,
    "sucesso": 5,
    "falhas": 0,
    "novasMovimentacoes": 2
  },
  "timestamp": "2025-10-22T12:00:00.000Z"
}
```

## Passo 6: Ativar Notificações em Processos

Para testar, ative notificações em pelo menos um processo:

1. Acessar `/dashboard/processos`
2. Editar um processo
3. Marcar "Notificações ativas"
4. Salvar

Agora esse processo será monitorado!

## Verificação

### Banco de Dados

```sql
-- Processos com notificações ativas
SELECT COUNT(*) FROM user_processes WHERE notificar = true;

-- Notificações criadas
SELECT COUNT(*) FROM notifications;

-- Últimas notificações
SELECT * FROM notifications ORDER BY criado_em DESC LIMIT 5;
```

### Logs da Aplicação

Verificar logs em:

- Vercel Dashboard → Functions → Logs
- Buscar por "monitor_complete"

### UI

1. Acessar aplicação
2. Ver sino de notificações no header
3. Deve mostrar badge se houver não lidas
4. Clicar para ver lista

## Troubleshooting

### Cron não executa

**Problema:** Cron job não aparece no Vercel Dashboard

**Solução:**

1. Verificar se `vercel.json` está no root do projeto
2. Fazer novo deploy
3. Aguardar alguns minutos para Vercel processar

### Erro 401 Unauthorized

**Problema:** Cron retorna 401

**Solução:**

1. Verificar `CRON_SECRET` nas env vars
2. Usar header correto: `Authorization: Bearer TOKEN`
3. Verificar se não há espaços extras

### Notificações não aparecem

**Problema:** Notificações criadas mas não aparecem na UI

**Solução:**

1. Verificar RLS policies:
   ```sql
   SELECT * FROM notifications WHERE user_id = 'SEU_USER_ID';
   ```
2. Verificar autenticação do usuário
3. Limpar cache do browser

### Timeout no Cron

**Problema:** Cron termina com timeout

**Solução:**

1. Vercel Free: timeout 60s (máx ~20-30 processos)
2. Upgrade para Vercel Pro: timeout 300s
3. OU reduzir delay entre requisições
4. OU processar em batches menores

## Monitoramento Contínuo

### Criar Dashboard de Stats

```typescript
// app/api/admin/stats/route.ts
export async function GET() {
  // Retornar estatísticas de monitoramento
  // Executar apenas para admin
}
```

### Alertas

Configurar alertas para:

- Taxa de falha > 10%
- Sem execução nas últimas 7 horas
- Muitas notificações acumuladas

### Logs

Usar serviço de logs:

- Vercel Logs (básico)
- Sentry (erros)
- Logtail (logs estruturados)
- DataDog (monitoramento completo)

## Próximos Passos

1. ✅ Sistema básico funcionando
2. ⏳ Adicionar email notifications
3. ⏳ Adicionar push notifications (PWA)
4. ⏳ Dashboard de estatísticas admin
5. ⏳ Configurações de horário preferido
6. ⏳ Filtrar tipos de movimentação

## Suporte

Documentação completa: `docs/SISTEMA_MONITORAMENTO.md`

Em caso de problemas:

1. Verificar logs no Vercel
2. Verificar dados no Supabase
3. Testar endpoint manualmente
4. Consultar documentação Vercel Cron
