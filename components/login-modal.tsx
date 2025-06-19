"use client"

import * as React from "react"
import { signIn, getSession } from "next-auth/react"
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '@/lib/store'
import { loginStart, loginSuccess, loginFailure } from '@/lib/features/auth/authSlice'
import { Button } from "@/components/ui/button"
import { FaGithub, FaGoogle } from "react-icons/fa"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

interface LoginModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onLoginSuccess?: () => void
}

export function LoginModal({ open, onOpenChange, onLoginSuccess }: LoginModalProps) {
  const dispatch = useDispatch<AppDispatch>()
  const { loading, error } = useSelector((state: RootState) => state.auth)
  
  const [mode, setMode] = React.useState<"login" | "signup">("login")
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [confirmPassword, setConfirmPassword] = React.useState("")
  const [displayName, setDisplayName] = React.useState("")
  const [username, setUsername] = React.useState("")

  // Enhanced OAuth login handler
  const handleOAuthLogin = async (provider: 'github' | 'google') => {
    try {
      console.log(`🚀 Starting ${provider} OAuth login...`)
      dispatch(loginStart())
      
      const result = await signIn(provider, { 
        redirect: false,
        callbackUrl: window.location.origin
      })
      
      console.log(`📊 ${provider} sign-in result:`, result)
      
      if (result?.error) {
        console.error(`❌ ${provider} OAuth error:`, result.error)
        
        let errorMessage = `${provider} login failed`
        
        switch (result.error) {
          case 'AccessDenied':
            errorMessage = 'Access denied. Please check your account permissions.'
            break
          case 'Configuration':
            errorMessage = 'OAuth configuration error. Please contact support.'
            break
          case 'Verification':
            errorMessage = 'Email verification required. Please verify your email first.'
            break
          default:
            errorMessage = `${provider} login failed. Please try again.`
        }
        
        dispatch(loginFailure(errorMessage))
        toast.error(errorMessage)
        return
      }
      
      if (result?.ok) {
        console.log(`✅ ${provider} sign-in successful, getting session...`)
        
        // Wait a moment for session to be established
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        const session = await getSession()
        console.log('📋 Session after OAuth:', session)
        
        if (session?.user) {
          dispatch(loginSuccess({
            id: session.user.id,
            email: session.user.email!,
            username: session.user.username || session.user.email!.split('@')[0],
            displayName: session.user.name!,
            avatarUrl: session.user.image || undefined,
          }))
          
          toast.success(`Successfully logged in with ${provider}!`)
          onLoginSuccess?.()
          resetForm()
          onOpenChange(false)
        } else {
          throw new Error('Failed to establish session after OAuth login')
        }
      }
    } catch (err: any) {
      console.error(`❌ ${provider} OAuth exception:`, err)
      dispatch(loginFailure(`${provider} login failed: ${err.message}`))
      toast.error(`${provider} login failed. Please try again.`)
    }
  }

  // Handle credentials login
  const handleCredentialsLogin = async () => {
    try {
      console.log('🔐 Starting credentials login...')
      
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })
      
      console.log('📊 Credentials sign-in result:', result)
      
      if (result?.error) {
        console.error('❌ Credentials error:', result.error)
        dispatch(loginFailure('Invalid email or password'))
        toast.error('Invalid email or password')
        return
      }
      
      if (result?.ok) {
        console.log('✅ Credentials sign-in successful, getting session...')
        
        const session = await getSession()
        console.log('📋 Session after credentials:', session)
        
        if (session?.user) {
          dispatch(loginSuccess({
            id: session.user.id,
            email: session.user.email!,
            username: session.user.username || session.user.email!.split('@')[0],
            displayName: session.user.name!,
            avatarUrl: session.user.image || undefined,
          }))
          
          toast.success('Successfully logged in!')
          onLoginSuccess?.()
          resetForm()
          onOpenChange(false)
        } else {
          throw new Error('Failed to establish session after credentials login')
        }
      }
    } catch (err: any) {
      console.error('❌ Credentials exception:', err)
      dispatch(loginFailure('Login failed. Please try again.'))
      toast.error('Login failed. Please try again.')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (mode === "signup" && password !== confirmPassword) {
      dispatch(loginFailure("Passwords don't match"))
      toast.error("Passwords don't match")
      return
    }
    
    dispatch(loginStart())
    
    if (mode === "login") {
      await handleCredentialsLogin()
    } else {
      // Handle signup
      try {
        console.log('📝 Starting registration...')
        
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            email, 
            password, 
            confirmPassword, 
            displayName, 
            username 
          }),
        })
        
        const data = await response.json()
        
        if (!response.ok) {
          throw new Error(data.error || 'Registration failed')
        }
        
        console.log('✅ Registration successful, logging in...')
        toast.success('Account created successfully!')
        
        // After successful registration, login
        await handleCredentialsLogin()
        
      } catch (err: any) {
        console.error('❌ Registration error:', err)
        dispatch(loginFailure(err.message || 'Registration failed'))
        toast.error(err.message || 'Registration failed')
      }
    }
  }

  const resetForm = () => {
    setEmail("")
    setPassword("")
    setConfirmPassword("")
    setDisplayName("")
    setUsername("")
  }

  const switchMode = (newMode: "login" | "signup") => {
    setMode(newMode)
    resetForm()
    dispatch(loginFailure("")) // Clear errors
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="px-[24px] py-[32px] w-[450px]">
        <DialogHeader className="grid gap-[4px]">
          <DialogTitle className="font-semibold">
            {mode === "login" ? "Login to MedTech Mesh" : "Create Account"}
          </DialogTitle>
          <DialogDescription>
            {mode === "login" 
              ? "Please enter your account" 
              : "Please fill in your information to create an account"
            }
          </DialogDescription>
        </DialogHeader>
        
        {error && (
          <div className="text-red-500 text-sm bg-red-50 p-3 rounded border border-red-200">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col gap-[14px]">
            {mode === "signup" && (
              <>
                <div className="grid gap-[4px] text-[16px]">
                  <Label>Display Name</Label>
                  <Input
                    className="px-[18px] py-[12px] rounded-[4px]"
                    type="text"
                    placeholder="your display name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    required
                  />
                </div>
                <div className="grid gap-[4px] text-[16px]">
                  <Label>Username</Label>
                  <Input
                    className="px-[18px] py-[12px] rounded-[4px]"
                    type="text"
                    placeholder="your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
              </>
            )}
            <div className="grid gap-[4px] text-[16px]">
              <Label>Email</Label>
              <Input
                className="px-[18px] py-[12px] rounded-[4px]"
                type="email"
                placeholder="your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-[4px] text-[16px]">
              <Label>Password</Label>
              <Input
                className="px-[18px] py-[12px] rounded-[4px]"
                type="password"
                placeholder="your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {mode === "signup" && (
              <div className="grid gap-[4px] text-[16px]">
                <Label>Confirm Password</Label>
                <Input
                  className="px-[18px] py-[12px] rounded-[4px]"
                  type="password"
                  placeholder="confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            )}
          </div>
        </form>

        <DialogFooter>
          <div className="flex flex-col mt-[18px] gap-[12px] w-full items-center">
            <Button 
              type="submit"
              className="w-full py-[12px] text-white text-[16px] items-center justify-center cursor-pointer" 
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? 'Loading...' : (mode === "login" ? "Login" : "Create Account")}
            </Button>
            
            <p className="text-textKedua text-[14px]">
              {mode === "login" ? "OR LOGIN WITH" : "OR SIGN UP WITH"}
            </p>
            
            <div className="grid grid-cols-2 gap-[12px] w-full">
              <Button 
                type="button"
                className="w-full py-[12px] text-white text-[16px] items-center justify-center cursor-pointer"
                onClick={() => handleOAuthLogin('github')}
                disabled={loading}
              >
                <FaGithub className="mr-[8px]" />
                GitHub
              </Button>
              <Button 
                type="button"
                variant="outline" 
                className="w-full py-[12px] text-[16px] items-center justify-center cursor-pointer"
                onClick={() => handleOAuthLogin('google')}
                disabled={loading}
              >
                <FaGoogle className="mr-[8px]" />
                Google
              </Button>
            </div>
            
            <p className="text-textKedua text-[16px]">
              {mode === "login" ? (
                <>
                  New to MedTech Mesh? 
                  <span 
                    className="text-blue-500 cursor-pointer ml-[4px]" 
                    onClick={() => switchMode("signup")}
                  >
                    Create an account
                  </span>
                </>
              ) : (
                <>
                  Already have an account?
                  <span 
                    className="text-blue-500 cursor-pointer ml-[4px]" 
                    onClick={() => switchMode("login")}
                  >
                    Sign in
                  </span>
                </>
              )}
            </p>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}