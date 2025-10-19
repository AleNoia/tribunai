# DataJud - Consulta Processual CNJ

Sistema web para consulta de processos judiciais utilizando a API Pública do DataJud (Conselho Nacional de Justiça).

## 🚀 Tecnologias

- **Next.js 15** (App Router)
- **TypeScript**
- **Tailwind CSS 4**
- **shadcn/ui** (componentes UI)
- **next-themes** (dark mode)
- **Lucide React** (ícones)

## 📋 Funcionalidades

- ✅ Busca de processos por número CNJ (20 dígitos)
- ✅ Formatação automática do número do processo
- ✅ Exibição de dados básicos do processo (classe, tribunal, data de ajuizamento, etc.)
- ✅ Listagem completa de movimentações processuais
- ✅ Estados de loading com skeletons
- ✅ Tratamento de erros com mensagens amigáveis
- ✅ Dark mode integrado
- ✅ Design responsivo
- ✅ Interface moderna com shadcn/ui

## 🔧 Instalação

### Pré-requisitos

- Node.js 18+ instalado
- npm ou yarn

### Passos

1. Clone o repositório:

```bash
git clone <url-do-repositorio>
cd tribunai
```

2. Instale as dependências:

```bash
npm install
```

3. Configure as variáveis de ambiente:

Crie um arquivo `.env.local` na raiz do projeto (já existe um template):

```env
NEXT_PUBLIC_DATAJUD_API_URL=https://datajud.cnj.jus.br/api_publica_teste
```

4. Execute o servidor de desenvolvimento:

```bash
npm run dev
```

5. Acesse no navegador:

```
http://localhost:3000
```

## 🏗️ Estrutura do Projeto

```
tribunai/
├── app/
│   ├── api/
│   │   └── buscar-processo/
│   │       └── route.ts    # API Route (proxy para DataJud)
│   ├── layout.tsx          # Layout principal com ThemeProvider
│   ├── page.tsx            # Página inicial com lógica de busca
│   └── globals.css         # Estilos globais e variáveis CSS
├── components/
│   ├── ui/                 # Componentes shadcn/ui
│   │   ├── alert.tsx
│   │   ├── badge.tsx
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   └── skeleton.tsx
│   ├── process-card.tsx    # Card de exibição do processo
│   ├── process-skeleton.tsx # Skeleton de loading
│   ├── search-form.tsx     # Formulário de busca
│   ├── theme-provider.tsx  # Provider de tema
│   └── theme-toggle.tsx    # Botão de alternância de tema
├── lib/
│   ├── datajud.ts          # Funções de chamada à API
│   ├── types.ts            # Tipos TypeScript da API
│   └── utils.ts            # Utilitários (cn helper)
├── .env.local              # Variáveis de ambiente
└── package.json            # Dependências do projeto
```

## 🌐 API DataJud

Este projeto consome a **API Pública do DataJud**, mantida pelo CNJ (Conselho Nacional de Justiça).

### Arquitetura da Solução

Para evitar problemas de **CORS** (Cross-Origin Resource Sharing), a aplicação utiliza uma arquitetura de proxy:

```
Frontend (navegador) → API Route Next.js → API DataJud CNJ
```

**Por que isso é necessário?**

- A API do DataJud não permite requisições diretas do navegador
- As requisições feitas no servidor (API Routes) não têm restrições de CORS
- Isso garante que a aplicação funcione corretamente

### Endpoints

**Frontend chama:**

```
POST /api/buscar-processo
```

**API Route chama (server-side):**

```
POST https://api-publica.datajud.cnj.jus.br/api_publica_[tribunal]/_search
```

### Autenticação

A API requer uma API Key no cabeçalho da requisição:

```
Authorization: APIKey cDZHYzlZa0JadVREZDJCendQbXY6SkJlTzNjLV9TRENyQk1RdnFKZGRQdw==
```

**Nota:** A API Key está incorporada na aplicação e pode ser alterada pelo CNJ a qualquer momento. Consulte a [documentação oficial](https://datajud.cnj.jus.br/) para a chave mais atualizada.

### Endpoints por Tribunal

A aplicação **detecta automaticamente o tribunal** com base no código presente no número do processo (dígitos 15-16) e faz a requisição para o endpoint correto.

Suporte para:

- ✅ **Tribunais Superiores** (STF, STJ, TST, TSE, STM)
- ✅ **Justiça Federal** (TRF 1ª a 6ª Região)
- ✅ **Justiça Estadual** (Todos os TJs)
- ✅ **Justiça do Trabalho** (TRT 1ª a 24ª Região)
- ✅ **Justiça Eleitoral** (Todos os TREs)
- ✅ **Justiça Militar** (TJMs)

Para ver a lista completa de tribunais suportados, consulte `lib/tribunais.ts` ou `TRIBUNAIS.md`.

### Formato do número do processo

O número do processo deve seguir o padrão CNJ com 20 dígitos:

```
NNNNNNN-DD.AAAA.J.TR.OOOO
```

Onde:

- **NNNNNNN**: Número sequencial do processo
- **DD**: Dígito verificador
- **AAAA**: Ano de ajuizamento
- **J**: Segmento do judiciário
- **TR**: Tribunal
- **OOOO**: Origem

### Exemplo de busca

```
00000000120244020001
```

Formatado: `0000000-01.2024.4.02.0001`

## 📦 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Executar build de produção
npm run start

# Linter
npm run lint
```

## 🎨 Personalização

### Cores do tema

As cores podem ser personalizadas no arquivo `app/globals.css` através das variáveis CSS:

```css
:root {
  --background: ...;
  --foreground: ...;
  --primary: ...;
  /* etc */
}
```

### Componentes UI

Os componentes shadcn/ui estão em `components/ui/` e podem ser customizados conforme necessário.

## 🐛 Tratamento de Erros

A aplicação trata os seguintes cenários:

- ❌ Número de processo inválido (diferente de 20 dígitos)
- ❌ Processo não encontrado na base do DataJud
- ❌ Erro de conexão com a API
- ❌ Timeout de requisição

## 📱 Responsividade

O layout é totalmente responsivo e funciona em:

- 📱 Mobile (320px+)
- 📱 Tablet (768px+)
- 💻 Desktop (1024px+)
- 🖥️ Large screens (1280px+)

## 🌙 Dark Mode

O dark mode é configurado automaticamente com base nas preferências do sistema, mas pode ser alternado manualmente através do botão no header.

## 📄 Licença

Este projeto é de código aberto e está disponível para uso educacional e comercial.

## 🤝 Contribuições

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues ou pull requests.

## 📞 Suporte

Para dúvidas sobre a API DataJud, consulte:

- [Documentação oficial do CNJ](https://www.cnj.jus.br/)
- [Portal DataJud](https://datajud.cnj.jus.br/)

---

Desenvolvido com ❤️ usando Next.js e shadcn/ui
