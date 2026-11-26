// Cria (ou redefine a senha de) um admin do site, perguntando no terminal.
// Na VM: docker compose run --rm migrate npx tsx scripts/create-admin.ts
import "dotenv/config";
import { createInterface } from "node:readline";
import bcrypt from "bcryptjs";
import { prisma } from "../src/lib/prisma";

const rl = createInterface({ input: process.stdin, output: process.stdout, terminal: true });
let hidden = false;
// Não ecoa o que for digitado enquanto `hidden` (senha).
const out = rl as unknown as { _writeToOutput: (s: string) => void };
const write = out._writeToOutput.bind(rl);
out._writeToOutput = (s) => {
  if (!hidden) write(s);
};

function ask(question: string, secret = false): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      if (secret) process.stdout.write("\n");
      hidden = false;
      resolve(answer.trim());
    });
    hidden = secret;
  });
}

async function main() {
  const email = (await ask("E-mail do admin: ")).toLowerCase();
  const name = await ask("Nome: ");
  const password = await ask("Senha (mínimo 12 caracteres, não aparece): ", true);
  const again = await ask("Repita a senha: ", true);

  if (!email.includes("@") || !name) throw new Error("E-mail e nome são obrigatórios.");
  if (password.length < 12) throw new Error("Senha curta demais.");
  if (password !== again) throw new Error("As senhas não conferem.");

  const data = { name, role: "admin", password: await bcrypt.hash(password, 10) };
  await prisma.user.upsert({
    where: { email },
    create: { email, ...data },
    update: { ...data, loginAttempts: 0, lockedUntil: null },
  });
  console.log(`Admin ${email} pronto.`);
}

main()
  .catch((err) => {
    console.error(err instanceof Error ? err.message : err);
    process.exitCode = 1;
  })
  .finally(async () => {
    rl.close();
    await prisma.$disconnect();
  });
