import { DefaultSession, DefaultUser } from "next-auth"
import { JWT, DefaultJWT } from "next-auth/jwt"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      username: string
    } & DefaultSession["user"]
  }

  interface User extends DefaultUser {
    username: string
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    username: string
  }
}

export interface User {
  id: string
  email: string
  username: string
  displayName: string
  avatarUrl?: string
  totalLikes?: number
  totalDownloads?: number
}

export interface AuthState {
  user: User | null
  isLoggedIn: boolean
  loading: boolean
  error: string | null
}

import { NextAuthOptions } from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import GitHubProvider from "next-auth/providers/github"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { prisma } from "./prisma"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        })

        if (!user || !user.password) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.displayName,
          image: user.avatarUrl,
          username: user.username,
        }
      }
    })
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.username = user.username
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!
        session.user.username = token.username as string
      }
      return session
    },
    async signIn({ user, account, profile }) {
      if (account?.provider === "github" || account?.provider === "google") {
        try {
          // Check if user exists
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email! }
          })

          if (!existingUser) {
            // Generate unique username from email or name
            const baseUsername = user.email?.split('@')[0] || user.name?.replace(/\s+/g, '').toLowerCase()
            let username = baseUsername
            let counter = 1

            // Ensure username is unique
            while (await prisma.user.findUnique({ where: { username } })) {
              username = `${baseUsername}${counter}`
              counter++
            }

            // Create new user
            await prisma.user.create({
              data: {
                email: user.email!,
                username: username!,
                displayName: user.name || user.email!.split('@')[0],
                avatarUrl: user.image,
                emailVerified: new Date(),
              }
            })
          }
          return true
        } catch (error) {
          console.error("OAuth sign in error:", error)
          return false
        }
      }
      return true
    }
  },
  pages: {
    signIn: "/",
  },
}