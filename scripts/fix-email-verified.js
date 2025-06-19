const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
})

async function fixEmailVerifiedField() {
  console.log('🔧 Starting emailVerified field fix...')

  try {
    // Connect to database
    await prisma.$connect()
    console.log('✅ Connected to database')

    // Check current column type using raw query
    const columnInfo = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable, column_default 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'emailVerified';
    `
    
    console.log('📋 Current emailVerified column info:', columnInfo)

    if (columnInfo.length === 0) {
      console.log('❌ emailVerified column not found!')
      return
    }

    const currentType = columnInfo[0].data_type

    if (currentType.includes('timestamp') || currentType.includes('date')) {
      console.log('🔄 Converting from timestamp to boolean...')

      // Step 1: Create backup
      await prisma.$executeRaw`
        CREATE TABLE IF NOT EXISTS users_backup_emailverified AS 
        SELECT * FROM users;
      `
      console.log('💾 Backup created')

      // Step 2: Add temporary column
      await prisma.$executeRaw`
        ALTER TABLE users ADD COLUMN IF NOT EXISTS emailVerified_temp BOOLEAN DEFAULT false;
      `

      // Step 3: Convert data
      await prisma.$executeRaw`
        UPDATE users SET emailVerified_temp = CASE 
          WHEN "emailVerified" IS NOT NULL THEN true 
          ELSE false 
        END;
      `
      console.log('🔄 Data converted')

      // Step 4: Drop old column and rename temp
      await prisma.$executeRaw`ALTER TABLE users DROP COLUMN "emailVerified";`
      await prisma.$executeRaw`ALTER TABLE users RENAME COLUMN emailVerified_temp TO "emailVerified";`
      
      // Step 5: Set constraints
      await prisma.$executeRaw`ALTER TABLE users ALTER COLUMN "emailVerified" SET DEFAULT false;`
      await prisma.$executeRaw`ALTER TABLE users ALTER COLUMN "emailVerified" SET NOT NULL;`

      console.log('✅ Column type converted successfully!')

    } else if (currentType === 'boolean') {
      console.log('✅ emailVerified is already boolean - fixing constraints...')
      
      // Just ensure proper constraints
      await prisma.$executeRaw`ALTER TABLE users ALTER COLUMN "emailVerified" SET DEFAULT false;`
      await prisma.$executeRaw`UPDATE users SET "emailVerified" = false WHERE "emailVerified" IS NULL;`
      await prisma.$executeRaw`ALTER TABLE users ALTER COLUMN "emailVerified" SET NOT NULL;`
      
      console.log('✅ Constraints fixed!')
    } else {
      console.log(`⚠️  Unknown type: ${currentType}. Manual intervention required.`)
    }

    // Verify the fix
    const verifyInfo = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable, column_default 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'emailVerified';
    `
    console.log('🔍 After fix - Column info:', verifyInfo)

    // Check sample data
    const sampleUsers = await prisma.$queryRaw`
      SELECT id, email, "emailVerified" FROM users LIMIT 3;
    `
    console.log('📊 Sample data after fix:', sampleUsers)

    console.log('🎉 EmailVerified field fix completed successfully!')

  } catch (error) {
    console.error('❌ Error fixing emailVerified field:', error)
    console.error('Stack trace:', error.stack)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the fix
fixEmailVerifiedField()
  .then(() => {
    console.log('✅ Script completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Script failed:', error)
    process.exit(1)
  })