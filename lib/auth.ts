import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";

const hasGoogleCredentials =
  Boolean(process.env.GOOGLE_CLIENT_ID) && Boolean(process.env.GOOGLE_CLIENT_SECRET);

export const authConfig = {
  trustHost: true,
  secret: process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET,
  session: {
    strategy: "jwt"
  },
  pages: {
    signIn: "/login"
  },
  providers: hasGoogleCredentials
    ? [
        Google({
          clientId: process.env.GOOGLE_CLIENT_ID!,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET!
        })
      ]
    : [],
  callbacks: {
    authorized({ auth }) {
      return Boolean(auth?.user);
    },
    jwt({ token, profile }) {
      if (typeof profile?.picture === "string") {
        token.picture = profile.picture;
      }

      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";

        if (typeof token.picture === "string") {
          session.user.image = token.picture;
        }
      }

      return session;
    }
  }
} satisfies NextAuthConfig;

export function isGoogleAuthConfigured() {
  return hasGoogleCredentials;
}
