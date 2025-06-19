const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function createTestUser() {
  try {
    console.log('🔧 Connecting to Vercel database...')
    
    // Test connection first
    await prisma.$connect()
    console.log('✅ Database connected successfully')
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: 'test@example.com' }
    })
    
    if (existingUser) {
      console.log('✅ Test user already exists in Vercel DB')
      console.log('📧 Email: test@example.com')
      console.log('🔑 Password: test123')
      return existingUser
    }
    
    // Hash password
    console.log('🔐 Hashing password...')
    const hashedPassword = await bcrypt.hash('test123', 12)
    
    // Create user
    console.log('👤 Creating user in Vercel database...')
    const user = await prisma.user.create({
      data: {
        email: 'test@example.com',
        username: 'testuser',
        displayName: 'Test User',
        password: hashedPassword,
      },
    })
    
    console.log('✅ Test user created successfully in Vercel DB!')
    console.log('📧 Email: test@example.com')
    console.log('🔑 Password: test123')
    console.log('🆔 User ID:', user.id)
    
    return user
  } catch (error) {
    console.error('❌ Error with Vercel database:', error)
    
    if (error.code === 'P2002') {
      console.log('ℹ️  Unique constraint violation - user might exist')
    }
    
    if (error.code === 'P2025') {
      console.log('ℹ️  Tables not found. Run: npx prisma db push')
    }
    
    if (error.message.includes('connect')) {
      console.log('ℹ️  Connection error. Check DATABASE_URL in .env.local')
    }
  } finally {
    await prisma.$disconnect()
    console.log('🔌 Database connection closed')
  }
}

createTestUser()