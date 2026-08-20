"use server";

import { redirect } from "next/navigation";
import { AuthError, CredentialsSignin } from "next-auth";
import { signIn } from "@/auth";

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/admin/produtos",
    });
  } catch (err) {
    // signIn() throws a NEXT_REDIRECT error on success — must propagate
    // untouched. Only a real AuthError (bad credentials / conta bloqueada)
    // redirects back.
    if (err instanceof CredentialsSignin && err.code === "locked") {
      redirect("/login?error=locked");
    }
    if (err instanceof CredentialsSignin && err.code === "rate-limited") {
      redirect("/login?error=rate-limited");
    }
    if (err instanceof AuthError) {
      redirect("/login?error=1");
    }
    throw err;
  }
}
