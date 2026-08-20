"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    throw new Error("Não autorizado.");
  }
  return session;
}

export async function createUserAction(formData: FormData) {
  await requireAdmin();

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const role = formData.get("role") === "admin" ? "admin" : "user";

  if (!name || !email || password.length < 8) {
    throw new Error(
      "Nome, e-mail e senha (mínimo 8 caracteres) são obrigatórios.",
    );
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new Error("Já existe um usuário com esse e-mail.");
  }

  const hashed = await bcrypt.hash(password, 10);
  await prisma.user.create({
    data: { name, email, password: hashed, role },
  });

  revalidatePath("/admin/usuarios");
}

export async function updateUserRoleAction(
  userId: number,
  role: "admin" | "user",
) {
  const session = await requireAdmin();

  if (String(userId) === session.user.id && role !== "admin") {
    throw new Error("Você não pode remover seu próprio acesso de admin.");
  }

  if (role !== "admin") {
    const target = await prisma.user.findUnique({ where: { id: userId } });
    if (target?.role === "admin") {
      const adminCount = await prisma.user.count({ where: { role: "admin" } });
      if (adminCount <= 1) {
        throw new Error("Precisa existir ao menos um admin.");
      }
    }
  }

  await prisma.user.update({ where: { id: userId }, data: { role } });
  revalidatePath("/admin/usuarios");
}

export async function unlockUserAction(userId: number) {
  await requireAdmin();
  await prisma.user.update({
    where: { id: userId },
    data: { loginAttempts: 0, lockedUntil: null },
  });
  revalidatePath("/admin/usuarios");
}

export async function deleteUserAction(userId: number) {
  const session = await requireAdmin();

  if (String(userId) === session.user.id) {
    throw new Error("Você não pode excluir seu próprio usuário.");
  }

  const target = await prisma.user.findUnique({ where: { id: userId } });
  if (target?.role === "admin") {
    const adminCount = await prisma.user.count({ where: { role: "admin" } });
    if (adminCount <= 1) {
      throw new Error("Precisa existir ao menos um admin.");
    }
  }

  await prisma.user.delete({ where: { id: userId } });
  revalidatePath("/admin/usuarios");
}
