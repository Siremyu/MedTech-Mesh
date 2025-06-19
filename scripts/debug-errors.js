// scripts/debug-errors.js
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function debugAndFix() {
  console.log('🔍 Starting comprehensive debug...')
  
  try {
    // 1. Test database connection
    console.log('\n1️⃣ Testing database connection...')
    await prisma.$connect()
    console.log('✅ Database connected successfully')
    
    // 2. Check current schema
    console.log('\n2️⃣ Checking database schema...')
    
    // Check if tables exist
    try {
      const userCount = await prisma.user.count()
      console.log(`📊 Users: ${userCount}`)
      
      const modelCount = await prisma.model.count()
      console.log(`📊 Models: ${modelCount}`)
    } catch (schemaError) {
      console.log('❌ Schema error - running migration...')
      console.log('Please run: npx prisma db push')
      return
    }
    
    if (await prisma.model.count() === 0) {
      console.log('\n📝 Creating sample data...')
      
      // Create test user first
      const testUser = await prisma.user.upsert({
        where: { email: 'test@medmesh.com' },
        update: {},
        create: {
          email: 'test@medmesh.com',
          username: 'testuser',
          displayName: 'Test User',
          emailVerified: true,
        }
      })
      
      console.log('✅ Test user created:', testUser.id)
      
      // Create test models with ALL required fields
      const testModels = [
        {
          title: 'Heart Anatomy Model',
          description: 'Detailed 3D model of human heart anatomy for medical education',
          category: 'Cardiology',
          tags: ['heart', 'anatomy', 'cardiology', 'medical'],
          status: 'published',
          visibility: 'public',
          license: 'CC BY 4.0', // ✅ Added required license field
          authorId: testUser.id,
          likes: 125,
          downloads: 89,
          views: 1250,
          publishedAt: new Date(),
          // Optional fields with defaults
          coverImageUrl: null,
          modelFileUrl: null,
          modelFileSize: 0,
          modelFormat: 'obj',
          isAnimated: false,
          hasMaterials: true,
          polyCount: 15000,
          sourceUrl: null,
          softwareUsed: 'Blender',
          renderEngine: 'Cycles'
        },
        {
          title: 'Brain Cortex Model',
          description: 'High-resolution 3D model of human brain cortex structure',
          category: 'Neurology',
          tags: ['brain', 'neurology', 'cortex', 'nervous-system'],
          status: 'published',
          visibility: 'public',
          license: 'CC BY-SA 4.0', // ✅ Added required license field
          authorId: testUser.id,
          likes: 203,
          downloads: 156,
          views: 1856,
          publishedAt: new Date(),
          coverImageUrl: null,
          modelFileUrl: null,
          modelFileSize: 0,
          modelFormat: 'fbx',
          isAnimated: false,
          hasMaterials: true,
          polyCount: 25000,
          sourceUrl: null,
          softwareUsed: '3ds Max',
          renderEngine: 'Arnold'
        },
        {
          title: 'Respiratory System Model',
          description: 'Complete respiratory system including lungs, trachea, and bronchi',
          category: 'Pulmonology',
          tags: ['lung', 'respiratory', 'pulmonology', 'breathing'],
          status: 'published',
          visibility: 'public',
          license: 'MIT', // ✅ Added required license field
          authorId: testUser.id,
          likes: 95,
          downloads: 67,
          views: 892,
          publishedAt: new Date(),
          coverImageUrl: null,
          modelFileUrl: null,
          modelFileSize: 0,
          modelFormat: 'glb',
          isAnimated: true,
          hasMaterials: true,
          polyCount: 18000,
          sourceUrl: null,
          softwareUsed: 'Maya',
          renderEngine: 'V-Ray'
        },
        {
          title: 'Spine Vertebrae Model',
          description: 'Complete spine vertebrae model for orthopedic education',
          category: 'Orthopedics',
          tags: ['spine', 'orthopedics', 'vertebrae', 'bones'],
          status: 'published',
          visibility: 'public',
          license: 'Apache 2.0', // ✅ Added required license field
          authorId: testUser.id,
          likes: 78,
          downloads: 45,
          views: 634,
          publishedAt: new Date(),
          coverImageUrl: null,
          modelFileUrl: null,
          modelFileSize: 0,
          modelFormat: 'obj',
          isAnimated: false,
          hasMaterials: true,
          polyCount: 12000,
          sourceUrl: null,
          softwareUsed: 'ZBrush',
          renderEngine: 'Keyshot'
        },
        {
          title: 'Kidney Cross Section',
          description: 'Detailed kidney cross-section showing internal structure',
          category: 'Nephrology',
          tags: ['kidney', 'nephrology', 'urinary', 'anatomy'],
          status: 'published',
          visibility: 'public',
          license: 'GPL v3', // ✅ Added required license field
          authorId: testUser.id,
          likes: 56,
          downloads: 32,
          views: 445,
          publishedAt: new Date(),
          coverImageUrl: null,
          modelFileUrl: null,
          modelFileSize: 0,
          modelFormat: 'ply',
          isAnimated: false,
          hasMaterials: true,
          polyCount: 8000,
          sourceUrl: null,
          softwareUsed: 'Blender',
          renderEngine: 'Eevee'
        }
      ]
      
      console.log('Creating models...')
      for (let i = 0; i < testModels.length; i++) {
        const model = testModels[i]
        try {
          const createdModel = await prisma.model.create({ data: model })
          console.log(`✅ Created model ${i + 1}: ${createdModel.title}`)
        } catch (modelError) {
          console.error(`❌ Failed to create model ${i + 1}:`, modelError.message)
        }
      }
      
      console.log('✅ Sample data creation completed')
    }
    
    // 3. Verify data
    console.log('\n3️⃣ Verifying data...')
    const finalCount = await prisma.model.count()
    console.log(`📊 Total models in database: ${finalCount}`)
    
    if (finalCount > 0) {
      const sampleModels = await prisma.model.findMany({
        take: 3,
        include: {
          author: {
            select: {
              displayName: true,
              username: true
            }
          }
        }
      })
      
      console.log('\n📋 Sample models:')
      sampleModels.forEach((model, index) => {
        console.log(`${index + 1}. ${model.title} by ${model.author.displayName}`)
      })
    }
    
    // 4. Test API endpoints
    console.log('\n4️⃣ Testing API endpoints...')
    
    const endpoints = [
      'http://localhost:3000/api/models/feed?category=recent&limit=8&page=1',
      'http://localhost:3000/api/models/feed?category=popular&limit=8&page=1',
      'http://localhost:3000/api/models/feed?category=trending&limit=8&page=1'
    ]
    
    for (const endpoint of endpoints) {
      try {
        console.log(`\n🔍 Testing: ${endpoint.split('?')[1]}`)
        const response = await fetch(endpoint)
        
        if (response.ok) {
          const data = await response.json()
          console.log(`✅ Status ${response.status}: ${data.data?.models?.length || 0} models returned`)
          
          if (data.data?.models?.length > 0) {
            console.log(`   First model: "${data.data.models[0].title}"`)
          }
        } else {
          const errorText = await response.text()
          console.log(`❌ Status ${response.status}: ${errorText.substring(0, 100)}...`)
        }
      } catch (fetchError) {
        console.log(`❌ Network error: ${fetchError.message}`)
      }
    }
    
    console.log('\n🎉 Debug completed successfully!')
    console.log('\n📌 Next steps:')
    console.log('1. Start/restart your dev server: npm run dev')
    console.log('2. Open browser: http://localhost:3000')
    console.log('3. Check for any remaining errors in browser console')
    
  } catch (error) {
    console.error('❌ Debug failed:', error)
    console.log('\n🔧 Troubleshooting steps:')
    console.log('1. Run: npx prisma db push')
    console.log('2. Run: npx prisma generate')
    console.log('3. Try this script again')
  } finally {
    await prisma.$disconnect()
    console.log('\n🔌 Database disconnected')
  }
}

debugAndFix()