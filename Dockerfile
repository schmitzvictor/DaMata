# syntax=docker/dockerfile:1

FROM node:22-alpine AS base
RUN apk add --no-cache libc6-compat

# --- deps: instala tudo (incl. devDependencies) pra buildar ---
# package.json tem "postinstall": "prisma generate" (diferente do ERP) —
# precisa do schema presente já no "npm ci", senão o postinstall falha.
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json prisma.config.ts ./
COPY prisma ./prisma
RUN npm ci

# --- builder: gera o Prisma Client e o build standalone do Next ---
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# --- migrate: reaproveita o builder (já tem o Prisma Client gerado, o
# node_modules completo com o CLI do prisma, e o código-fonte) só pra
# rodar "prisma migrate deploy".
FROM builder AS migrate
CMD ["npx", "prisma", "migrate", "deploy"]

# --- runner: imagem final de produção, só o output standalone ---
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
EXPOSE 3000

CMD ["node", "server.js"]
