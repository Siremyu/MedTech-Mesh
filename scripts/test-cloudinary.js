// scripts/test-cloudinary-direct.js
const { v2: cloudinary } = require('cloudinary')

// Gunakan credentials langsung dari .env.local Anda
cloudinary.config({
  cloud_name: 'drhzwx7ee',
  api_key: '838776353145985',
  api_secret: 'vH1NxdvvTy_HFhDuY6kBtQwRGSE',
  secure: true
})

async function testConnection() {
  try {
    console.log('🚀 Testing Cloudinary connection with direct credentials...')
    
    const result = await cloudinary.api.ping()
    console.log('✅ Cloudinary connection successful!')
    console.log('Response:', result)
    
    // Test simple upload
    console.log('\n🧪 Testing simple upload...')
    const uploadResult = await cloudinary.uploader.upload(
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
      {
        folder: 'medtech-mesh/test',
        public_id: 'test-image',
        overwrite: true
      }
    )
    console.log('✅ Test upload successful!')
    console.log('Upload URL:', uploadResult.secure_url)
    
    // Clean up test image
    await cloudinary.uploader.destroy('medtech-mesh/test/test-image')
    console.log('✅ Test cleanup completed')
    
  } catch (error) {
    console.error('❌ Test failed:', error.message)
    console.error('Full error:', error)
  }
}

testConnection()