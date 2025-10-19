# Solução para CORS - DataJud CNJ

## 🚨 Problema

A API Pública do DataJud **não permite requisições diretas do navegador** devido à política de CORS (Cross-Origin Resource Sharing).

### Erro Original

```
Access to fetch at 'https://api-publica.datajud.cnj.jus.br/...' from origin 'http://localhost:3000'
has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

## ✅ Solução Implementada

Criamos uma **API Route no Next.js** que funciona como um proxy entre o frontend e a API do DataJud.

### Arquitetura

```
┌─────────────┐      ┌──────────────────┐      ┌─────────────────┐
│             │      │                  │      │                 │
│  Frontend   │─────▶│  API Route       │─────▶│  API DataJud    │
│  (Browser)  │      │  (Next.js)       │      │  (CNJ)          │
│             │◀─────│  Server-Side     │◀─────│                 │
└─────────────┘      └──────────────────┘      └─────────────────┘
   localhost:3000      /api/buscar-processo     api-publica.datajud...
```

### Por que funciona?

1. **Frontend → API Route** ✅

   - Mesma origem (localhost:3000)
   - Sem restrições de CORS

2. **API Route → DataJud API** ✅
   - Requisição server-side (Node.js)
   - CORS não se aplica a requisições de servidor

## 📁 Arquivos Modificados

### 1. Nova API Route: `app/api/buscar-processo/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { obterUrlTribunal, obterNomeTribunal } from "@/lib/tribunais";

export async function POST(request: NextRequest) {
  try {
    const { numeroProcesso } = await request.json();

    // Validação...
    // Chamada à API do DataJud...
    // Processamento...

    return NextResponse.json({ success: true, processo });
  } catch (error) {
    return NextResponse.json({ success: false, error }, { status: 500 });
  }
}
```

**Responsabilidades:**

- Recebe requisição do frontend
- Valida número do processo
- Identifica tribunal correto
- Faz requisição à API do DataJud (server-side)
- Retorna dados para o frontend

### 2. Atualizado: `lib/datajud.ts`

```typescript
export async function buscarProcesso(numeroProcesso: string) {
  try {
    // Chama a API Route do Next.js (não mais a API do DataJud diretamente)
    const response = await fetch("/api/buscar-processo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ numeroProcesso }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    // Error handling...
  }
}
```

**Mudanças:**

- ❌ Antes: Frontend chamava DataJud diretamente
- ✅ Agora: Frontend chama API Route do Next.js

## 🔐 Segurança

### API Key Protegida

A API Key agora fica **apenas no servidor** (API Route), nunca é exposta ao navegador:

```typescript
// app/api/buscar-processo/route.ts
const response = await fetch(apiUrl, {
  headers: {
    Authorization:
      "APIKey cDZHYzlZa0JadVREZDJCendQbXY6SkJlTzNjLV9TRENyQk1RdnFKZGRQdw==",
  },
});
```

### Vantagens

1. ✅ **API Key oculta** - Não aparece no código do navegador
2. ✅ **Requisições controladas** - Passa pelo seu servidor
3. ✅ **Logs centralizados** - Pode monitorar todas as requisições
4. ✅ **Rate limiting** - Pode implementar controle de taxa
5. ✅ **Cache** - Pode adicionar cache no servidor

## 🧪 Testando

### Frontend

```typescript
// components ou pages
const resultado = await buscarProcesso("0000000-01.2024.8.26.0001");
```

### API Route Diretamente

```bash
curl -X POST http://localhost:3000/api/buscar-processo \
  -H "Content-Type: application/json" \
  -d '{"numeroProcesso":"0000000-01.2024.8.26.0001"}'
```

## 📊 Fluxo Completo

### 1. Usuário digita número

```
SearchForm (component)
```

### 2. Frontend chama função

```typescript
buscarProcesso(numeroProcesso)
  ↓
fetch("/api/buscar-processo", { body: { numeroProcesso } })
```

### 3. API Route processa

```typescript
// app/api/buscar-processo/route.ts
POST handler()
  ↓
obterUrlTribunal(numeroProcesso) // Identifica tribunal
  ↓
fetch(apiDataJud) // Chamada server-side
  ↓
return NextResponse.json(resultado)
```

### 4. Frontend recebe resposta

```typescript
setProcesso(resultado.processo)
  ↓
<ProcessCard processo={processo} />
```

## 🎯 Boas Práticas Aplicadas

### 1. Separação de Responsabilidades

- **Frontend**: UI e interação do usuário
- **API Route**: Lógica de negócio e comunicação externa
- **Lib**: Funções utilitárias

### 2. Tratamento de Erros

```typescript
// API Route retorna status HTTP apropriados
return NextResponse.json({ error }, { status: 400 }); // Bad Request
return NextResponse.json({ error }, { status: 404 }); // Not Found
return NextResponse.json({ error }, { status: 500 }); // Server Error
```

### 3. Tipagem TypeScript

```typescript
interface BuscarProcessoRequest {
  numeroProcesso: string;
}

interface BuscarProcessoResponse {
  success: boolean;
  processo?: DataJudProcesso;
  error?: string;
}
```

## 🔄 Alternativas Consideradas

### ❌ 1. Proxy Externo

- Adiciona complexidade
- Depende de serviço externo
- Custo adicional

### ❌ 2. CORS Middleware

- Não resolve (problema está na API do DataJud)
- Requer acesso ao servidor da API

### ✅ 3. API Route Next.js

- **Escolhida**: Simples, nativa, sem custos extras
- Mantém tudo no mesmo projeto
- Controle total

## 🔢 Identificação de Tribunais

A identificação do tribunal é feita através da combinação:

- **Segmento** (posição 13): Tipo de justiça (4=Federal, 5=Trabalho, 8=Estadual, 6=Eleitoral)
- **Código** (posições 14-15): Código específico do tribunal

**Exemplo:** Número `0000832-35.2018.4.01.3202`

- Segmento `4` (Justiça Federal) + Código `01` = Chave `401` = **TRF1**

## 📝 Nota Importante

Esta é uma solução **padrão e recomendada** para integrar APIs externas que não suportam CORS em aplicações Next.js. É a mesma abordagem usada por:

- Aplicações empresariais
- SaaS modernos
- Frameworks como Vercel, Netlify

## 🚀 Deploy em Produção

Ao fazer deploy (Vercel, Netlify, etc.), a API Route será implantada automaticamente como uma função serverless. Nenhuma configuração adicional é necessária!

```bash
# Build
npm run build

# Deploy (exemplo Vercel)
vercel --prod
```

A URL da API Route será:

```
https://seu-dominio.com/api/buscar-processo
```

## 📚 Referências

- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [CORS - MDN](https://developer.mozilla.org/pt-BR/docs/Web/HTTP/CORS)
- [Proxy Pattern](https://en.wikipedia.org/wiki/Proxy_pattern)

---

**Problema resolvido! ✅**

O sistema agora funciona perfeitamente sem erros de CORS.
