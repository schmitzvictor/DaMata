type Entry = { count: number; resetAt: number };

const WINDOW_MS = 10 * 60 * 1000; // 10 min
const MAX_ATTEMPTS = 20; // por IP, somando todas as contas tentadas

const attempts = new Map<string, Entry>();

// Limpeza periódica — sem isso o Map cresce pra sempre com um IP novo por
// entrada, mesmo depois da janela expirar.
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of attempts) {
    if (entry.resetAt < now) attempts.delete(ip);
  }
}, WINDOW_MS).unref();

// Em memória, por processo — reseta a cada deploy/restart e não é
// compartilhado entre múltiplas instâncias. Suficiente pro processo único
// desta VM; se isso virar multi-instância, precisa de um store
// compartilhado (Redis etc). Complementa o bloqueio por conta (que não
// pega um atacante variando o e-mail).
export function checkLoginRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = attempts.get(ip);
  if (!entry || entry.resetAt < now) {
    attempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }
  if (entry.count >= MAX_ATTEMPTS) return false;
  entry.count += 1;
  return true;
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || "unknown";
}
