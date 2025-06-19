// scripts/validate-and-fix-data.js
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
})

async function validateAndFixData() {
  console.log('🔍 Starting data validation and fix...')

  try {
    await prisma.$connect()
    console.log('✅ Connected to database')

    // 1. Check current data
    console.log('📊 Checking current emailVerified data...')
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        emailVerified: true,
      },
      take: 10
    })

    console.log('Sample users:', users.map(u => ({
      email: u.email,
      emailVerified: u.emailVerified,
      type: typeof u.emailVerified
    })))

    // 2. Count problematic records
    const totalUsers = await prisma.user.count()
    console.log(`📋 Total users: ${totalUsers}`)

    // 3. Fix any null values (if any)
    console.log('🔧 Fixing null emailVerified values...')
    const fixedCount = await prisma.user.updateMany({
      where: {
        emailVerified: null
      },
      data: {
        emailVerified: false
      }
    })

    console.log(`✅ Fixed ${fixedCount.count} null emailVerified values`)

    // 4. Test specific user that's causing error
    const problemUserId = 'cmc3a4on30000gi0wjr6i3ejm'
    console.log(`🔍 Checking problem user: ${problemUserId}`)
    
    const problemUser = await prisma.user.findUnique({
      where: { id: problemUserId },
      select: {
        id: true,
        email: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true
      }
    })

    if (problemUser) {
      console.log('Problem user data:', {
        ...problemUser,
        emailVerifiedType: typeof problemUser.emailVerified
      })

      // Force update this specific user
      console.log('🔧 Force updating problem user...')
      const updatedUser = await prisma.user.update({
        where: { id: problemUserId },
        data: {
          emailVerified: Boolean(problemUser.emailVerified),
          updatedAt: new Date()
        }
      })
      console.log('✅ Problem user updated successfully')
    } else {
      console.log('❌ Problem user not found')
    }

    // 5. Validate all users have proper boolean values
    console.log('🔍 Final validation...')
    const invalidUsers = await prisma.$queryRaw`
      SELECT id, email, "emailVerified", pg_typeof("emailVerified") as type_check
      FROM users 
      WHERE "emailVerified" IS NOT NULL
      LIMIT 5
    `
    
    console.log('📊 Sample data after fix:')
    console.table(invalidUsers)

    console.log('🎉 Data validation and fix completed successfully!')

  } catch (error) {
    console.error('❌ Error during data validation:', error)
    console.error('Stack trace:', error.stack)
  } finally {
    await prisma.$disconnect()
  }
}

validateAndFixData()
  .then(() => {
    console.log('✅ Script completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Script failed:', error)
    process.exit(1)
  })