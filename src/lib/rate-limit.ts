type Entry = { count: number; resetAt: number };

// Em memória, por processo — reseta a cada deploy/restart e não é
// compartilhado entre múltiplas instâncias. Suficiente pro processo único
// desta VM; se isso virar multi-instância, precisa de um store
// compartilhado (Redis etc).
function createRateLimiter(windowMs: number, maxAttempts: number) {
  const attempts = new Map<string, Entry>();

  // Limpeza periódica — sem isso o Map cresce pra sempre com um IP novo por
  // entrada, mesmo depois da janela expirar.
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of attempts) {
      if (entry.resetAt < now) attempts.delete(key);
    }
  }, windowMs).unref();

  return (key: string): boolean => {
    const now = Date.now();
    const entry = attempts.get(key);
    if (!entry || entry.resetAt < now) {
      attempts.set(key, { count: 1, resetAt: now + windowMs });
      return true;
    }
    if (entry.count >= maxAttempts) return false;
    entry.count += 1;
    return true;
  };
}

// Complementa o bloqueio por conta (que não pega um atacante variando o
// e-mail): 20 tentativas de login por IP a cada 10 min, somando todas as
// contas tentadas.
export const checkLoginRateLimit = createRateLimiter(10 * 60 * 1000, 20);

// Ingestão de analytics é chamada a cada pageview/clique — limite bem mais
// generoso, só pra evitar flood/abuso do endpoint público.
export const checkTrackRateLimit = createRateLimiter(60 * 1000, 120);

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || "unknown";
}
