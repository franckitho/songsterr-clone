import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

/**
 * Single-admin authentication. Credentials are checked against the
 * ADMIN_EMAIL / ADMIN_PASSWORD environment variables. There is no user
 * database — this app is personal and admin-only.
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      name: "Admin",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" },
      },
      authorize: async (credentials) => {
        const email = String(credentials?.email ?? "");
        const password = String(credentials?.password ?? "");
        const adminEmail = process.env.ADMIN_EMAIL ?? "";
        const adminPassword = process.env.ADMIN_PASSWORD ?? "";
        if (
          adminEmail &&
          adminPassword &&
          email.toLowerCase() === adminEmail.toLowerCase() &&
          password === adminPassword
        ) {
          return { id: "admin", name: "Admin", email: adminEmail };
        }
        return null;
      },
    }),
  ],
});
