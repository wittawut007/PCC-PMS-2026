import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().min(1),
  password: z.string().min(1),
});

const shorthandToEmail: Record<string, string> = {
  admin: "admin@pcc.co.th",
  exec: "exec@pcc.co.th",
  executive: "exec@pcc.co.th",
  pm: "pm@pcc.co.th",
  engineer: "engineer@pcc.co.th",
  site: "site@pcc.co.th",
  qc: "qc@pcc.co.th",
  wh: "warehouse@pcc.co.th",
  warehouse: "warehouse@pcc.co.th",
  transport: "transport@pcc.co.th",
  driver: "transport@pcc.co.th",
  owner: "owner@pcc.co.th",
};

export const authConfig = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const input = parsed.data.email.trim();
        const normalizedEmail = (
          input.includes("@") ? input : (shorthandToEmail[input.toLowerCase()] || input)
        ).toLowerCase();

        const user = await prisma.user.findFirst({
          where: {
            OR: [
              { email: { equals: normalizedEmail, mode: "insensitive" } },
              { id: { equals: input, mode: "insensitive" } },
            ],
          },
        });
        if (!user || !user.passwordHash) return null;
        if (!user.isActive) return null;

        const isValid = await bcrypt.compare(
          parsed.data.password,
          user.passwordHash
        );
        if (!isValid) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          image: user.image,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
