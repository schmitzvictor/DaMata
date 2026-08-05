import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";

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
    <div className="mx-auto max-w-[1240px] px-8 py-9">
      <nav className="mb-8 flex items-center justify-between border-b border-escuro/14 pb-4">
        <Link href="/admin/produtos" className="font-display text-xl tracking-wide">
          ADMIN · CONTEÚDO
        </Link>
        <span className="font-ui text-xs text-escuro/60">{session.user.email}</span>
      </nav>
      {children}
    </div>
  );
}
