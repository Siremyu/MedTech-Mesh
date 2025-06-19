"use client"

import { useSession, signIn, signOut } from "next-auth/react"
import { useState } from "react"

export default function TestAuth() {
  const { data: session, status } = useSession()
  const [email, setEmail] = useState("test@example.com")
  const [password, setPassword] = useState("test123")
  const [loading, setLoading] = useState(false)

  console.log('🔍 Test Auth Debug:')
  console.log('Status:', status)
  console.log('Session:', session)

  const handleCredentialsLogin = async () => {
    setLoading(true)
    console.log('🚀 Attempting credentials login...')
    
    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })
      
      console.log('✅ Login result:', result)
      
      if (result?.error) {
        console.error('❌ Login error:', result.error)
        alert('Login failed: ' + result.error)
      } else if (result?.ok) {
        console.log('✅ Login successful!')
        alert('Login successful!')
      }
    } catch (error) {
      console.error('❌ Login exception:', error)
      alert('Login exception: ' + error)
    } finally {
      setLoading(false)
    }
  }

  const handleGitHubLogin = async () => {
    setLoading(true)
    console.log('🚀 Attempting GitHub login...')
    
    try {
      const result = await signIn('github', { 
        redirect: false,
        callbackUrl: '/test-auth'
      })
      console.log('✅ GitHub result:', result)
    } catch (error) {
      console.error('❌ GitHub error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    console.log('🚀 Signing out...')
    await signOut({ redirect: false })
    console.log('✅ Signed out')
  }

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">🔐 NextAuth Test Page</h1>
        
        {/* Status Display */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">Current Status</h2>
          <div className="space-y-2">
            <p><strong>Status:</strong> <span className="font-mono">{status}</span></p>
            <p><strong>User Email:</strong> {session?.user?.email || 'None'}</p>
            <p><strong>User Name:</strong> {session?.user?.name || 'None'}</p>
            <p><strong>Session Exists:</strong> {session ? '✅ Yes' : '❌ No'}</p>
          </div>
          
          <details className="mt-4">
            <summary className="cursor-pointer font-medium">Full Session Data</summary>
            <pre className="mt-2 bg-gray-100 p-3 rounded text-sm overflow-auto">
              {JSON.stringify(session, null, 2)}
            </pre>
          </details>
        </div>

        {!session ? (
          <div className="space-y-6">
            {/* Credentials Login */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">🔑 Credentials Login</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="test@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Password</label>
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="test123"
                  />
                </div>
                <button 
                  onClick={handleCredentialsLogin} 
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? '🔄 Logging in...' : '🚀 Login with Credentials'}
                </button>
              </div>
            </div>

            {/* OAuth Login */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">🌐 OAuth Login</h2>
              <div className="space-y-3">
                <button 
                  onClick={handleGitHubLogin} 
                  disabled={loading}
                  className="w-full bg-gray-800 text-white py-2 px-4 rounded hover:bg-gray-900 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  🐱 Login with GitHub
                </button>
                <button 
                  onClick={() => signIn('google', { callbackUrl: '/test-auth' })} 
                  disabled={loading}
                  className="w-full bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  🔴 Login with Google
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-green-50 border border-green-200 p-6 rounded-lg">
            <h2 className="text-xl font-semibold text-green-800 mb-4">✅ Logged In Successfully!</h2>
            <div className="space-y-2 mb-4">
              <p><strong>Email:</strong> {session.user?.email}</p>
              <p><strong>Name:</strong> {session.user?.name}</p>
              <p><strong>ID:</strong> {session.user?.id}</p>
            </div>
            <button 
              onClick={handleSignOut}
              className="bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700"
            >
              🚪 Sign Out
            </button>
          </div>
        )}

        {/* Debug Section */}
        <div className="bg-white p-6 rounded-lg shadow mt-6">
          <h2 className="text-xl font-semibold mb-4">🔧 Debug Info</h2>
          <div className="text-sm space-y-1">
            <p><strong>Current URL:</strong> {typeof window !== 'undefined' ? window.location.href : 'N/A'}</p>
            <p><strong>NextAuth Status:</strong> {status}</p>
            <p><strong>Has Session:</strong> {session ? 'Yes' : 'No'}</p>
          </div>
          
          <div className="mt-4">
            <h3 className="font-medium mb-2">Test API Endpoints:</h3>
            <div className="space-y-1 text-sm">
              <a href="/api/auth/session" target="_blank" className="text-blue-600 hover:underline block">
                📊 /api/auth/session
              </a>
              <a href="/api/auth/providers" target="_blank" className="text-blue-600 hover:underline block">
                🔗 /api/auth/providers
              </a>
              <a href="/api/auth/csrf" target="_blank" className="text-blue-600 hover:underline block">
                🔐 /api/auth/csrf
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}