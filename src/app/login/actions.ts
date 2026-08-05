"use server";

import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
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
    // untouched. Only a real AuthError (bad credentials) redirects back.
    if (err instanceof AuthError) {
      redirect("/login?error=1");
    }
    throw err;
  }
}
