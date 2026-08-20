import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  createUserAction,
  deleteUserAction,
  unlockUserAction,
  updateUserRoleAction,
} from "./actions";

export default async function AdminUsersPage() {
  const session = await auth();
  // Layout já garante isso, mas layout e página podem buscar dados em
  // paralelo (RSC) — não dá pra confiar que o redirect do layout já
  // resolveu antes desta função rodar.
  if (session?.user?.role !== "admin") {
    redirect("/login");
  }
  const currentUserId = session.user.id;

  const users = await prisma.user.findMany({ orderBy: { createdAt: "asc" } });

  return (
    <div>
      <h1 className="mb-1 font-display text-2xl tracking-wide">USUÁRIOS</h1>
      <p className="mb-6 font-ui text-xs text-escuro/60">
        Quem pode acessar este painel. Só admins entram aqui.
      </p>

      <div className="mb-10 overflow-x-auto border border-escuro/14">
        <table className="w-full border-collapse text-left font-ui text-sm">
          <thead>
            <tr className="border-b border-escuro/14 bg-creme/60">
              <th className="px-4 py-3">Nome</th>
              <th className="px-4 py-3">E-mail</th>
              <th className="px-4 py-3">Papel</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Criado em</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {users.map((user) => {
              const isSelf = String(user.id) === currentUserId;
              const nextRole = user.role === "admin" ? "user" : "admin";
              const isLocked = !!user.lockedUntil && user.lockedUntil > new Date();
              return (
                <tr key={user.id} className="border-b border-escuro/10">
                  <td className="px-4 py-3">
                    {user.name}
                    {isSelf ? (
                      <span className="ml-1.5 text-[11px] text-escuro/40">(você)</span>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 text-escuro/70">{user.email}</td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        user.role === "admin"
                          ? "rounded-full bg-verde-claro/40 px-2 py-0.5 text-[11px] text-verde-mata"
                          : "rounded-full bg-escuro/10 px-2 py-0.5 text-[11px] text-escuro/70"
                      }
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {isLocked ? (
                      <span className="rounded-full bg-terra/15 px-2 py-0.5 text-[11px] text-terra">
                        bloqueado até{" "}
                        {user.lockedUntil!.toLocaleTimeString("pt-BR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    ) : (
                      <span className="text-escuro/40">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-escuro/60">
                    {user.createdAt.toLocaleDateString("pt-BR")}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-3">
                      {isLocked ? (
                        <form action={unlockUserAction.bind(null, user.id)}>
                          <button type="submit" className="text-verde-mata underline">
                            Desbloquear
                          </button>
                        </form>
                      ) : null}
                      <form
                        action={updateUserRoleAction.bind(null, user.id, nextRole)}
                      >
                        <button
                          type="submit"
                          disabled={isSelf}
                          className="text-verde-mata underline disabled:cursor-not-allowed disabled:text-escuro/30 disabled:no-underline"
                        >
                          {user.role === "admin" ? "Rebaixar" : "Promover"}
                        </button>
                      </form>
                      <form action={deleteUserAction.bind(null, user.id)}>
                        <button
                          type="submit"
                          disabled={isSelf}
                          className="text-terra underline disabled:cursor-not-allowed disabled:text-escuro/30 disabled:no-underline"
                        >
                          Excluir
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <section className="max-w-sm border border-escuro/14 bg-creme/40 p-5">
        <h2 className="mb-4 font-display text-lg tracking-wide">NOVO USUÁRIO</h2>
        <form action={createUserAction} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="name" className="font-ui text-xs text-escuro/70">
              Nome
            </label>
            <Input id="name" name="name" required />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="font-ui text-xs text-escuro/70">
              E-mail
            </label>
            <Input id="email" name="email" type="email" required />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="font-ui text-xs text-escuro/70">
              Senha
            </label>
            <Input
              id="password"
              name="password"
              type="password"
              minLength={8}
              required
              autoComplete="new-password"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="role" className="font-ui text-xs text-escuro/70">
              Papel
            </label>
            <select
              id="role"
              name="role"
              defaultValue="user"
              className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <option value="user">user</option>
              <option value="admin">admin</option>
            </select>
          </div>
          <Button type="submit" className="mt-2 w-fit">
            Criar
          </Button>
        </form>
      </section>
    </div>
  );
}
