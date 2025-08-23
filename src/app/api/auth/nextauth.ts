import NextAuth, { type NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "../../../lib/prisma";
import type { JWT } from "next-auth/jwt";
import type { Session, User } from "next-auth";
import { TeamMemberRole, PermissionAction } from "@prisma/client";

// Extend NextAuth types to include team member context
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
    teamMember?: {
      id: string;
      role: TeamMemberRole;
      businessId: string;
      status: string;
      permissions: PermissionAction[];
    };
    business?: {
      id: string;
      name: string;
      slug?: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    teamMemberId?: string;
    businessId?: string;
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text", placeholder: "email@example.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const user = await prisma.user.findFirst({
            where: { email: credentials.email },
          });

          if (!user || !user.hashedPassword) {
            return null;
          }

          // Import bcryptjs dynamically to avoid issues
          const { compare } = await import("bcryptjs");
          const isValid = await compare(credentials.password as string, user.hashedPassword);
          
          if (!isValid) {
            return null;
          }

          return user;
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET || "fallback-secret-key-for-development-only",
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async redirect({ url, baseUrl }) {
      // For successful authentication, check if user needs setup
      if (url.startsWith(baseUrl) && !url.includes("error")) {
        // Let the dashboard layout handle the redirect logic
        return `${baseUrl}/dashboard`;
      }
      // Allow redirects to relative URLs
      else if (url.startsWith("/")) return `${baseUrl}${url}`;
      return baseUrl;
    },
    async jwt({ token, user }) {
      if (user && user.id) {
        token.id = user.id as string;
        
        // Get team member context and business info (with better error handling)
        try {
          const teamMember = await prisma.teamMember.findFirst({
            where: {
              userId: user.id as string,
              status: 'ACTIVE',
            },
            include: {
              business: true,
              permissions: true,
            },
          });

          if (teamMember) {
            token.teamMemberId = teamMember.id;
            token.businessId = teamMember.businessId;
          }
        } catch (error) {
          console.error("Error getting team member context in JWT:", error);
          // Don't fail authentication - just log the error
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        
                  // Always fetch fresh user data from the database
          try {
            const freshUser = await prisma.user.findUnique({
              where: { id: token.id as string },
              select: {
                id: true,
                name: true,
                email: true,
              },
            });
            
            if (freshUser) {
              session.user.name = freshUser.name;
              session.user.email = freshUser.email;
            }
          } catch (error) {
            console.error("Error getting fresh user data in session:", error);
            // Don't fail session - just log the error
          }
        
        // Add team member context to session (with better error handling)
        if (token.teamMemberId && token.businessId) {
          try {
            const teamMember = await prisma.teamMember.findUnique({
              where: { id: token.teamMemberId as string },
              include: {
                business: true,
                permissions: true,
              },
            });

            if (teamMember) {
              session.teamMember = {
                id: teamMember.id,
                role: teamMember.role,
                businessId: teamMember.businessId,
                status: teamMember.status,
                permissions: teamMember.permissions.map(p => p.action),
              };

              session.business = {
                id: teamMember.business.id,
                name: teamMember.business.name,
                slug: teamMember.business.slug || undefined,
              };
            }
          } catch (error) {
            console.error("Error getting team member context in session:", error);
            // Don't fail session - just log the error
          }
        }
      }
      return session;
    },
  },
  debug: process.env.NODE_ENV === "development",
};
