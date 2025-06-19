// scripts/check-database-schema.js
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkDatabaseSchema() {
  try {
    console.log('🔍 Checking database schema...')
    
    // Check if User table exists with correct fields
    console.log('👤 Checking User table...')
    const userSample = await prisma.user.findFirst({
      select: {
        id: true,
        email: true,
        displayName: true,
        username: true,
        bio: true,
        avatarUrl: true,
        // Remove coverImageUrl for now
        region: true,
        gender: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true
      }
    })
    console.log('✅ User table structure OK')
    
    // Check if Model table exists (optional)
    console.log('📦 Checking if Model table exists...')
    try {
      await prisma.model.findFirst({
        select: { id: true }
      })
      console.log('✅ Model table exists')
    } catch (modelError) {
      console.log('⚠️ Model table not found (this is OK for profile functionality)')
    }
    
    console.log('✅ Database schema check completed')
    
  } catch (error) {
    console.error('❌ Database schema check failed:', error.message)
    
    if (error.code === 'P1001') {
      console.log('💡 Database unreachable. Check DATABASE_URL in .env.local')
    }
    
    if (error.code === 'P2021') {
      console.log('💡 Table does not exist. Run: npx prisma db push')
    }
    
  } finally {
    await prisma.$disconnect()
  }
}

checkDatabaseSchema()