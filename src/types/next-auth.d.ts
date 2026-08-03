import type { DefaultSession } from "next-auth";

// User.role is a plain string column in the DB (see prisma/schema.prisma),
// constrained by app logic to these two values.
type Role = "user" | "admin";

declare module "next-auth" {
  interface User {
    role: Role;
  }

  interface Session {
    user: {
      id: string;
      role: Role;
    } & DefaultSession["user"];
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    role?: Role;
  }
}
