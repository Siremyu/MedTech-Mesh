import { NextAuthOptions } from "next-auth"
import GitHubProvider from "next-auth/providers/github"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { prisma } from "./prisma"

export const authOptions: NextAuthOptions = {
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
        console.log('🔐 Credentials auth attempt:', credentials?.email)
        
        if (!credentials?.email || !credentials?.password) {
          console.log('❌ Missing credentials')
          return null
        }

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email }
          })

          if (!user || !user.password) {
            console.log('❌ User not found or no password')
            return null
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          )

          if (!isPasswordValid) {
            console.log('❌ Invalid password')
            return null
          }

          console.log('✅ Credentials auth successful:', user.email)
          return {
            id: user.id,
            email: user.email,
            name: user.displayName,
            image: user.avatarUrl || null,
            username: user.username,
          }
        } catch (error) {
          console.error("❌ Credentials auth error:", error)
          return null
        }
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user, account }) {
      console.log('🎫 JWT Callback:', { 
        hasUser: !!user, 
        hasAccount: !!account,
        provider: account?.provider,
        tokenSub: token.sub,
        userEmail: user?.email
      })

      if (user) {
        token.id = user.id
        token.username = user.username
        token.email = user.email
        token.name = user.name
        token.picture = user.image
      }
      return token
    },

    async session({ session, token }) {
      console.log('🏠 Session Callback:', { 
        tokenSub: token.sub,
        tokenId: token.id,
        sessionUserEmail: session.user?.email 
      })

      if (token && session.user) {
        // Use token.id if available, otherwise fall back to token.sub
        session.user.id = token.id as string || token.sub!
        session.user.username = token.username as string
        session.user.email = token.email as string
        session.user.name = token.name as string
        session.user.image = token.picture as string
      }
      return session
    },

    // ENHANCED: Better signIn callback with proper user creation
    async signIn({ user, account, profile }) {
      console.log('🚪 SignIn Callback:', { 
        provider: account?.provider,
        userEmail: user.email,
        userId: user.id,
        userName: user.name
      })

      // For OAuth providers, ensure user exists in database
      if (account?.provider === "github" || account?.provider === "google") {
        try {
          if (!user.email) {
            console.log('❌ No email provided by OAuth provider')
            return false
          }

          console.log('🔍 Checking for existing OAuth user:', user.email)
          
          let existingUser = await prisma.user.findUnique({
            where: { email: user.email }
          })

          if (existingUser) {
            console.log('✅ Found existing OAuth user:', existingUser.id)
            // Update user object with database info
            user.id = existingUser.id
            user.username = existingUser.username
            
            // Update user info if it changed
            if (user.name !== existingUser.displayName || user.image !== existingUser.avatarUrl) {
              console.log('🔄 Updating user info from OAuth provider')
              existingUser = await prisma.user.update({
                where: { id: existingUser.id },
                data: {
                  displayName: user.name || existingUser.displayName,
                  avatarUrl: user.image || existingUser.avatarUrl,
                },
              })
            }
          } else {
            console.log('🆕 Creating new OAuth user')
            
            // Generate unique username
            const emailUsername = user.email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '') || 'user'
            const nameUsername = user.name?.replace(/[^a-zA-Z0-9]/g, '').toLowerCase() || emailUsername
            const baseUsername = nameUsername || emailUsername
            
            let username = baseUsername
            let counter = 1

            // Ensure username uniqueness
            while (await prisma.user.findUnique({ where: { username } })) {
              username = `${baseUsername}${counter}`
              counter++
              if (counter > 100) break // Prevent infinite loop
            }

            const newUser = await prisma.user.create({
              data: {
                email: user.email,
                username: username,
                displayName: user.name || user.email.split('@')[0],
                avatarUrl: user.image,
                emailVerified: true,
                bio: null,
                gender: null,
                region: null,
              },
            })

            console.log('✅ Created new OAuth user:', {
              id: newUser.id,
              email: newUser.email,
              username: newUser.username
            })
            
            // Update user object with new database info
            user.id = newUser.id
            user.username = newUser.username
          }
          
          console.log('✅ OAuth sign-in successful with user ID:', user.id)
          return true
        } catch (error) {
          console.error("❌ OAuth sign-in error:", error)
          
          // Don't completely block sign-in, but log the error
          console.log('⚠️ Allowing sign-in despite database error')
          return true
        }
      }

      // Always allow credentials sign-in if authorize() passed
      console.log('✅ Sign-in approved')
      return true
    },
  },
  pages: {
    signIn: "/",
    error: "/auth/error",
  },
  events: {
    async signIn(message) {
      console.log('📝 Sign-in event:', {
        user: message.user.email,
        provider: message.account?.provider,
        userId: message.user.id
      })
    },
    async signOut(message) {
      console.log('📝 Sign-out event')
    },
  },
  debug: process.env.NODE_ENV === "development",
  secret: process.env.NEXTAUTH_SECRET,
}

// Helper functions remain the same but with better error handling
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function createUser(data: {
  email: string
  username: string
  displayName: string
  password: string
}) {
  const hashedPassword = await hashPassword(data.password)
  
  return prisma.user.create({
    data: {
      ...data,
      password: hashedPassword,
      emailVerified: false,
      bio: null,
      gender: null,
      region: null,
    },
    select: {
      id: true,
      email: true,
      username: true,
      displayName: true,
      avatarUrl: true,
      createdAt: true,
    },
  })
}

export async function authenticateUser(email: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { email },
  })

  if (!user || !user.password) {
    return null
  }

  const isValidPassword = await bcrypt.compare(password, user.password)
  
  if (!isValidPassword) {
    return null
  }

  return {
    id: user.id,
    email: user.email,
    username: user.username,
    displayName: user.displayName,
    avatarUrl: user.avatarUrl,
  }
}

// New helper function to find or create OAuth user
export async function findOrCreateOAuthUser(email: string, name: string, avatarUrl?: string) {
  try {
    let user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      const baseUsername = email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '') || 'user'
      let username = baseUsername
      let counter = 1

      while (await prisma.user.findUnique({ where: { username } })) {
        username = `${baseUsername}${counter}`
        counter++
      }

      user = await prisma.user.create({
        data: {
          email,
          username,
          displayName: name || email.split('@')[0],
          avatarUrl,
          emailVerified: true,
          bio: null,
          gender: null,
          region: null,
        },
      })
    }

    return user
  } catch (error) {
    console.error('Error in findOrCreateOAuthUser:', error)
    throw error
  }
}