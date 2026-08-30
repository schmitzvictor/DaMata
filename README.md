# Da Mata Grow

E-commerce da Da Mata Grow — moda outdoor com identidade de serigrafia artesanal.

Este é o esqueleto do projeto: stack, tema visual, auth e banco configurados.
Páginas de loja e o schema de produtos ainda não existem — entram em
prompts seguintes.

## Stack

- **Next.js 16** (App Router, TypeScript, Turbopack)
- **Tailwind CSS v4** — tokens de marca em [`tailwind.config.ts`](./tailwind.config.ts)
- **shadcn/ui** (Radix) — componentes base em `src/components/ui`
- **Prisma 7** → PostgreSQL (self-hosted na VM em produção, mesmo Postgres do ERP; Neon em dev/local)
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

As demais variáveis (Mercado Pago, Melhor Envio, Cloudflare R2, Resend) podem
ficar em branco por enquanto — só serão usadas em prompts futuros.

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
| `npm run analytics:prune` | remove eventos de `AnalyticsEvent` com mais de `ANALYTICS_RETENTION_DAYS` dias (padrão 180) — ver "Deploy em produção" |

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

## Deploy em produção (VM + Docker + Nginx)

Mesma VM do ERP (repo separado), mesmo esquema: `docker-compose.yml` sobe
`migrate` (roda `prisma migrate deploy` e sai) e `app` (o site, só acessível
em `127.0.0.1:3001` — porta diferente da 3000 do ERP, mesma VM). Nginx faz o
proxy reverso com TLS na frente.

Este stack **não sobe seu próprio Postgres** — usa o mesmo container `db` do
stack do ERP, via uma rede Docker externa chamada `damata`. Ou seja: **o
stack do ERP precisa estar rodando primeiro**, com a rede `damata` já criada
e a role/banco `damata_site` já existindo nele (ver README.md do repo do ERP,
seção "Deploy em produção").

```bash
git clone <repo> damata-web && cd damata-web
cp .env.example .env
# edite o .env: gere AUTH_SECRET de verdade (npx auth secret), troque
# POSTGRES_PASSWORD pra bater com a senha usada no CREATE ROLE damata_site
# (ver README do ERP), AUTH_URL="https://damata.app", e preencha
# MERCADO_PAGO_*/MELHOR_ENVIO_*/R2_*/RESEND_*/ERP_*. DATABASE_URL local não
# importa aqui — o app dentro do compose usa o host "db" automaticamente.

docker compose up -d --build
```

### Migrar dados do Neon (se já existirem produtos/pedidos reais)

Se o banco atual no Neon já tem dados que importam, exporte antes de trocar
o DNS e importe no Postgres novo (rodando na VM, já com o schema aplicado
pelo `migrate` acima):

```bash
# na sua máquina, com o pg_dump instalado:
pg_dump "$NEON_DATABASE_URL_UNPOOLED" --no-owner --no-privileges > dump.sql

# copia pra VM e importa no banco damata_site
scp dump.sql sua-vm:/tmp/dump.sql
ssh sua-vm 'cd damata-erp && docker compose exec -T db psql -U damata_site -d damata_site < /tmp/dump.sql'
```

Se não tiver dados reais ainda (só o schema), pule esse passo — o
`prisma migrate deploy` do `docker compose up` já deixa o banco novo pronto.

Depois, configure o Nginx (exemplo em `deploy/nginx/damata.app.conf`):

```bash
sudo cp deploy/nginx/damata.app.conf /etc/nginx/sites-available/
sudo ln -s /etc/nginx/sites-available/damata.app.conf /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

sudo apt install certbot python3-certbot-nginx   # se ainda não tiver (o ERP já instala)
sudo certbot --nginx -d damata.app -d www.damata.app
```

Só então aponte o DNS do domínio raiz/`www` (hoje em `91.195.240.94`) pra
`163.176.207.111` — atualizar antes disso derrubaria o site atual em produção.

Pra atualizar depois de um `git pull`:

```bash
docker compose up -d --build
```

### Retenção de analytics

`/api/track` é público e grava um `AnalyticsEvent` a cada pageview/clique —
sem limpeza periódica a tabela (e seus índices) cresce indefinidamente.
Agendar via cron na VM (diário, fora do horário de pico):

```bash
crontab -e
# adicionar:
0 4 * * * cd /caminho/pra/damata-marketplace && npm run analytics:prune >> /var/log/damata-analytics-prune.log 2>&1
```

Retenção padrão: 180 dias. Ajustável via `ANALYTICS_RETENTION_DAYS` no `.env`.

## Autenticação

Provider `credentials` (e-mail/senha), sessão via JWT. `role` (`user` | `admin`)
fica disponível em `session.user.role` depois do login. Não existe UI de
login/cadastro ainda nem seed de usuário admin — isso vem no próximo prompt.
