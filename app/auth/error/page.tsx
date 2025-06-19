// app/auth/error/page.tsx
"use client"

import { useSearchParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, Home, RefreshCw } from 'lucide-react'

const errorMessages: Record<string, { title: string; description: string }> = {
  Configuration: {
    title: 'Server Configuration Error',
    description: 'There is a problem with the server configuration. Please contact support.'
  },
  AccessDenied: {
    title: 'Access Denied',
    description: 'You do not have permission to sign in. Please try again or contact support.'
  },
  Verification: {
    title: 'Email Verification Required',
    description: 'Please check your email and verify your account before signing in.'
  },
  Default: {
    title: 'Authentication Error',
    description: 'An error occurred during authentication. Please try again.'
  }
}

export default function AuthErrorPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const error = searchParams.get('error') || 'Default'
  
  const errorInfo = errorMessages[error] || errorMessages.Default

  console.log('🚨 Auth Error Page:', { error, errorInfo })

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <CardTitle className="text-xl font-semibold text-gray-900">
            {errorInfo.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600 text-center">
            {errorInfo.description}
          </p>
          
          {error === 'AccessDenied' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Troubleshooting Tips:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Try clearing your browser cache and cookies</li>
                <li>• Ensure you're using a valid email address</li>
                <li>• Check if your account has been verified</li>
                <li>• Try using a different browser or incognito mode</li>
              </ul>
            </div>
          )}
          
          <div className="flex flex-col sm:flex-row gap-2">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => router.push('/')}
            >
              <Home className="w-4 h-4 mr-2" />
              Go Home
            </Button>
            <Button 
              className="flex-1"
              onClick={() => router.push('/?login=true')}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </div>
          
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-4 p-3 bg-gray-100 rounded text-xs">
              <strong>Debug Info:</strong> Error type: {error}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}