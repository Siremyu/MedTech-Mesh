const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function createAdmin() {
  try {
    const adminEmail = 'admin@medmesh.com' // Change this to your desired admin email
    const adminPassword = 'admin123456' // Change this to a secure password
    
    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail }
    })
    
    if (existingAdmin) {
      // Update existing user to admin
      const updatedUser = await prisma.user.update({
        where: { email: adminEmail },
        data: { role: 'ADMIN' }
      })
      console.log('✅ User updated to admin:', updatedUser.email)
    } else {
      // Create new admin user
      const hashedPassword = await bcrypt.hash(adminPassword, 12)
      
      const admin = await prisma.user.create({
        data: {
          email: adminEmail,
          username: 'admin',
          displayName: 'Administrator',
          password: hashedPassword,
          role: 'ADMIN',
          emailVerified: true
        }
      })
      console.log('✅ Admin user created:', admin.email)
    }
    
  } catch (error) {
    console.error('❌ Error creating admin:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createAdmin()