import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { loginAction } from "./actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-sm flex-col justify-center px-6 py-16">
      <h1 className="mb-6 font-display text-3xl tracking-wide">ENTRAR</h1>
      <form action={loginAction} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="font-ui text-xs text-escuro/70">
            E-mail
          </label>
          <Input id="email" name="email" type="email" required autoComplete="email" />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="password" className="font-ui text-xs text-escuro/70">
            Senha
          </label>
          <Input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
          />
        </div>
        {error ? (
          <p className="font-ui text-xs text-terra">E-mail ou senha inválidos.</p>
        ) : null}
        <Button type="submit" className="mt-2 w-full">
          Entrar
        </Button>
      </form>
    </div>
  );
}
