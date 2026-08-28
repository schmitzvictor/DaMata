import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { logoutAction } from "./actions";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }
  if (session.user.role !== "admin") {
    redirect("/");
  }

  return (
    <div className="mx-auto max-w-[1240px] px-4 py-9 sm:px-8">
      <nav className="mb-8 flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-b border-escuro/14 pb-4">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <span className="font-display text-xl tracking-wide">ADMIN</span>
          <Link
            href="/admin/produtos"
            className="font-ui text-sm text-escuro/70 hover:text-escuro"
          >
            Produtos
          </Link>
          <Link
            href="/admin/usuarios"
            className="font-ui text-sm text-escuro/70 hover:text-escuro"
          >
            Usuários
          </Link>
          <Link
            href="/admin/conteudo"
            className="font-ui text-sm text-escuro/70 hover:text-escuro"
          >
            Conteúdo
          </Link>
          <Link
            href="/admin/banner"
            className="font-ui text-sm text-escuro/70 hover:text-escuro"
          >
            Banner
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <span className="hidden font-ui text-xs text-escuro/60 sm:inline">
            {session.user.email}
          </span>
          <form action={logoutAction}>
            <button
              type="submit"
              className="font-ui text-xs text-escuro/60 underline hover:text-escuro"
            >
              Sair
            </button>
          </form>
        </div>
      </nav>
      {children}
    </div>
  );
}
