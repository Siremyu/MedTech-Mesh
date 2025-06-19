// scripts/check-env.js
console.log('🔍 Environment Variables Check:')
console.log('NODE_ENV:', process.env.NODE_ENV)
console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL)
console.log('NEXTAUTH_SECRET exists:', !!process.env.NEXTAUTH_SECRET)
console.log('NEXTAUTH_URL:', process.env.NEXTAUTH_URL)

if (process.env.DATABASE_URL) {
  // Mask the password in the URL for security
  const maskedUrl = process.env.DATABASE_URL.replace(/:([^:@]+)@/, ':****@')
  console.log('DATABASE_URL (masked):', maskedUrl)
}