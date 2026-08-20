import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { checkLoginRateLimit, getClientIp } from "@/lib/rate-limit";

const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_DURATION_MS = 15 * 60 * 1000;

class AccountLockedError extends CredentialsSignin {
  code = "locked";
}

// Bloqueio por conta (abaixo) não pega um atacante testando muitos e-mails
// diferentes — só trava depois de 5 tentativas na MESMA conta. Isso aqui
// cobre esse caso, por IP.
class RateLimitedError extends CredentialsSignin {
  code = "rate-limited";
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "E-mail", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials, request) {
        const email = credentials?.email;
        const password = credentials?.password;
        if (typeof email !== "string" || typeof password !== "string") {
          return null;
        }

        if (!checkLoginRateLimit(getClientIp(request))) {
          throw new RateLimitedError();
        }

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return null;

        const now = new Date();
        if (user.lockedUntil && user.lockedUntil > now) {
          throw new AccountLockedError();
        }

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
          // Se havia um bloqueio, ele já expirou (checado acima) — recomeça
          // a contagem em vez de somar sobre um lockedUntil velho.
          const attempts = (user.lockedUntil ? 0 : user.loginAttempts) + 1;
          const locksNow = attempts >= MAX_LOGIN_ATTEMPTS;
          await prisma.user.update({
            where: { id: user.id },
            data: {
              loginAttempts: attempts,
              lockedUntil: locksNow
                ? new Date(now.getTime() + LOCK_DURATION_MS)
                : null,
            },
          });
          if (locksNow) throw new AccountLockedError();
          return null;
        }

        if (user.loginAttempts > 0 || user.lockedUntil) {
          await prisma.user.update({
            where: { id: user.id },
            data: { loginAttempts: 0, lockedUntil: null },
          });
        }

        return {
          id: String(user.id),
          name: user.name,
          email: user.email,
          // DB column is a plain string (see prisma/schema.prisma); app
          // logic is the only thing constraining it to "user" | "admin".
          role: user.role as "user" | "admin",
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub as string;
        session.user.role = token.role ?? "user";
      }
      return session;
    },
  },
});
