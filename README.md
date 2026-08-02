# Da Mata Grow

E-commerce da Da Mata Grow — moda outdoor com identidade de serigrafia artesanal.

Este é o esqueleto do projeto: stack, tema visual, auth e banco configurados.
Páginas de loja e o schema de produtos ainda não existem — entram em
prompts seguintes.

## Stack

- **Next.js 16** (App Router, TypeScript, Turbopack)
- **Tailwind CSS v4** — tokens de marca em [`tailwind.config.ts`](./tailwind.config.ts)
- **shadcn/ui** (Radix) — componentes base em `src/components/ui`
- **Prisma 7** → PostgreSQL (Neon/Supabase)
- **Auth.js (NextAuth v5)** — login por credentials (e-mail/senha com bcrypt), papéis `user`/`admin`

### Cores da marca

`verde-mata` `verde-folha` `verde-vivo` `verde-claro` `terra` `sol` `creme` `escuro`
— use como `bg-verde-mata`, `text-terra`, etc.

### Fontes da marca

| Utilitário       | Fonte             | Uso                          |
| ----------------- | ------------------ | ------------------------------- |
| `font-display`     | Bebas Neue         | títulos, display                |
| `font-editorial`   | Playfair Display   | citações, aberturas de seção    |
| `font-body`        | Lora               | texto corrido (padrão do `<body>`) |
| `font-ui`          | Inter               | botões, formulários, chrome     |

## Rodando localmente

### 1. Pré-requisitos

- Node.js 20.9+
- Um banco Postgres (recomendado: [Neon](https://neon.tech) ou [Supabase](https://supabase.com), tier gratuito)

### 2. Instalar dependências

```bash
npm install
```

### 3. Configurar variáveis de ambiente

O banco (Neon, projeto `DaMata_DB`) já está provisionado. Se você tem acesso
ao projeto na Neon, puxe as variáveis direto:

```bash
npx neon env pull
```

Senão, copie o exemplo e preencha manualmente:

```bash
cp .env.example .env
```

Preencha pelo menos `DATABASE_URL` e gere um `AUTH_SECRET`:

```bash
npx auth secret
```

As demais variáveis (Mercado Pago, Melhor Envio, Cloudinary/Supabase Storage, Resend)
podem ficar em branco por enquanto — só serão usadas em prompts futuros.

### 4. Aplicar o schema no banco

```bash
npx prisma migrate dev --name init
```

### 5. Rodar o servidor de desenvolvimento

```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

## Scripts

| Comando              | O que faz                              |
| --------------------- | ---------------------------------------- |
| `npm run dev`          | servidor de desenvolvimento (Turbopack)  |
| `npm run build`        | build de produção                        |
| `npm run start`        | roda o build de produção                 |
| `npm run lint`         | ESLint                                   |
| `npx prisma studio`    | UI para inspecionar o banco              |
| `npx prisma generate`  | regenera o client (roda automático no `npm install` via `postinstall`) |

## Estrutura de pastas

```
src/
  app/                    # rotas (App Router)
    api/auth/[...nextauth]/route.ts   # handler do Auth.js
  components/
    ui/                   # componentes shadcn/ui (button, input, dialog, drawer, tabs, accordion)
  lib/
    prisma.ts             # client Prisma (singleton)
    utils.ts              # helper `cn()` do shadcn
  types/
    next-auth.d.ts        # tipagem do campo `role` na Session
  generated/prisma/        # client Prisma gerado (não editar, gitignored)
  auth.ts                 # config do Auth.js (provider, callbacks)
prisma/
  schema.prisma           # datasource + model User (só auth por enquanto)
```

## Autenticação

Provider `credentials` (e-mail/senha), sessão via JWT. `role` (`user` | `admin`)
fica disponível em `session.user.role` depois do login. Não existe UI de
login/cadastro ainda nem seed de usuário admin — isso vem no próximo prompt.
