// scripts/debug-user-issue.js
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
})

async function debugUserIssue() {
  const problemUserId = 'cmc3a4on30000gi0wjr6i3ejm'
  
  console.log('🔍 Debugging user not found issue...')
  console.log('Problem User ID:', problemUserId)

  try {
    await prisma.$connect()
    console.log('✅ Database connected successfully')

    // 1. Check if user exists
    console.log('\n1. 📋 Checking if user exists...')
    const user = await prisma.user.findUnique({
      where: { id: problemUserId }
    })
    
    if (user) {
      console.log('✅ User found:', {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        username: user.username,
        createdAt: user.createdAt
      })
    } else {
      console.log('❌ User not found with ID:', problemUserId)
    }

    // 2. List all users to see what we have
    console.log('\n2. 📋 All users in database:')
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        displayName: true,
        username: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    })
    
    console.log(`Found ${allUsers.length} users:`)
    allUsers.forEach((u, index) => {
      console.log(`  ${index + 1}. ID: ${u.id}`)
      console.log(`     Email: ${u.email}`)
      console.log(`     Name: ${u.displayName}`)
      console.log(`     Username: ${u.username}`)
      console.log(`     Created: ${u.createdAt}`)
      console.log('')
    })

    // 3. Check for similar IDs (in case there's a typo)
    console.log('\n3. 🔍 Checking for similar user IDs...')
    const partialId = problemUserId.substring(0, 10) // First 10 characters
    const similarUsers = await prisma.user.findMany({
      where: {
        id: {
          startsWith: partialId
        }
      },
      select: {
        id: true,
        email: true,
        displayName: true
      }
    })
    
    if (similarUsers.length > 0) {
      console.log('Found users with similar IDs:')
      similarUsers.forEach(u => {
        console.log(`  - ${u.id} (${u.email})`)
      })
    } else {
      console.log('No users found with similar ID pattern')
    }

    // 4. Create a test user if no users exist
    const userCount = await prisma.user.count()
    if (userCount === 0) {
      console.log('\n4. 🔧 No users found, creating test user...')
      
      const testUser = await prisma.user.create({
        data: {
          email: 'test@example.com',
          username: 'testuser',
          displayName: 'Test User',
          emailVerified: true,
        }
      })
      
      console.log('✅ Test user created:', {
        id: testUser.id,
        email: testUser.email,
        displayName: testUser.displayName
      })
      
      console.log('\n🎯 You can now test with this user ID:', testUser.id)
      console.log(`Test URL: http://localhost:3000/profile?userId=${testUser.id}`)
    }

    // 5. Test database queries
    console.log('\n5. 🧪 Testing database queries...')
    
    // Test the exact query used in the API
    try {
      const apiTestUser = await prisma.user.findUnique({
        where: { id: problemUserId },
        select: {
          id: true,
          displayName: true,
          username: true,
          email: true,
          bio: true,
          avatarUrl: true,
          region: true,
          gender: true,
          emailVerified: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              models: true
            }
          }
        }
      })
      
      if (apiTestUser) {
        console.log('✅ API query test passed')
      } else {
        console.log('❌ API query returned null')
      }
    } catch (apiError) {
      console.error('❌ API query failed:', apiError.message)
    }

  } catch (error) {
    console.error('❌ Debug script error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

debugUserIssue()
  .then(() => {
    console.log('\n🎉 Debug script completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Debug script failed:', error)
    process.exit(1)
  })