# 🚀 Guia Rápido - DataJud CNJ

## Instalação e Execução

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar variável de ambiente (opcional)

Crie `.env.local` (ou use a URL padrão já configurada):

```env
NEXT_PUBLIC_DATAJUD_API_URL=https://datajud.cnj.jus.br/api_publica_teste
```

### 3. Iniciar servidor

```bash
npm run dev
```

### 4. Acessar aplicação

```
http://localhost:3000
```

## ✅ Funcionalidades

- 🔍 Busca por número CNJ (20 dígitos)
- 📋 Exibição de dados do processo
- 📅 Lista de movimentações
- 🌙 Dark mode
- 📱 Design responsivo
- ⚡ Loading states
- ❌ Tratamento de erros

## 🔑 API Key & CORS

A API Key do DataJud está configurada na **API Route** (`app/api/buscar-processo/route.ts`):

```
Authorization: APIKey cDZHYzlZa0JadVREZDJCendQbXY6SkJlTzNjLV9TRENyQk1RdnFKZGRQdw==
```

### 🚨 Solução de CORS

Para evitar erros de CORS, a aplicação usa uma API Route como proxy:

```
Frontend → API Route Next.js → API DataJud
```

Veja `CORS_SOLUTION.md` para detalhes completos.

## 📝 Exemplo de uso

1. Digite um número de processo no formato: `0000000-00.0000.0.00.0000`
2. Clique em "Buscar"
3. Visualize os dados do processo e suas movimentações

## 🛠️ Scripts

```bash
npm run dev      # Desenvolvimento
npm run build    # Build de produção
npm run start    # Servidor de produção
npm run lint     # Linter
```

## 📚 Tecnologias

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS 4
- shadcn/ui
- next-themes
- Lucide React

## 📁 Estrutura

```
tribunai/
├── app/              # Páginas Next.js
├── components/       # Componentes React
│   └── ui/          # Componentes shadcn/ui
├── lib/             # Utilitários e API
└── public/          # Assets estáticos
```

## 🐛 Troubleshooting

### Erro de API Key

Se receber erro 401/403, verifique se a API Key está atualizada em `lib/datajud.ts`.

### Processo não encontrado

Certifique-se de usar um número de processo válido com 20 dígitos.

### Erro ao instalar

```bash
# Limpar cache e reinstalar
rm -rf node_modules package-lock.json
npm install
```

## 📞 Suporte

- Documentação DataJud: https://datajud.cnj.jus.br/
- README completo: `README.md`
