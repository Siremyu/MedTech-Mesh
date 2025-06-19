"use client"

import * as React from "react"
import { useSession } from "next-auth/react"
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { toast } from "sonner"
import { User, Lock, Trash2, Shield, Bell, Globe } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { AvatarUpload } from '@/components/settings/avatar-upload'

interface UserSettings {
  displayName: string
  username: string
  email: string
  bio: string
  avatarUrl: string | null
  gender: string
  region: string
  emailVerified: boolean
  memberSince: string
  lastUpdated: string
}

const tabs = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'security', label: 'Security', icon: Lock },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'privacy', label: 'Privacy', icon: Shield },
  { id: 'delete', label: 'Delete Account', icon: Trash2 },
]

export default function SettingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  // Debug logging
  console.log('🎯 Settings Page Debug:')
  console.log('Component rendered at:', new Date().toISOString())
  console.log('Session status:', status)
  console.log('Session data:', session)
  console.log('Window location:', typeof window !== 'undefined' ? window.location.href : 'SSR')

  const [activeTab, setActiveTab] = useState('profile')
  const [settings, setSettings] = useState<UserSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    displayName: '',
    username: '',
    email: '',
    bio: '',
    gender: '',
    region: '',
  })

  // Redirect if not authenticated
  useEffect(() => {
    console.log('🔄 Settings useEffect - Status changed:', status)
    if (status === 'unauthenticated') {
      console.log('❌ Redirecting to home - not authenticated')
      router.push('/')
    } else if (status === 'authenticated') {
      console.log('✅ User authenticated, staying on settings')
    }
  }, [status, router])

  // Fetch user settings
  useEffect(() => {
    console.log('🔄 Settings useEffect - Session changed:', !!session?.user)
    if (session?.user) {
      console.log('👤 Fetching user settings...')
      fetchUserSettings()
    }
  }, [session])

  const fetchUserSettings = async () => {
    console.log('📡 Fetching user settings...')
    try {
      const response = await fetch('/api/settings')
      console.log('📡 Settings API response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('✅ Settings loaded:', data)
        setSettings(data.userSettings)
        setFormData({
          displayName: data.userSettings.displayName,
          username: data.userSettings.username,
          email: data.userSettings.email,
          bio: data.userSettings.bio,
          gender: data.userSettings.gender,
          region: data.userSettings.region,
        })
      } else {
        console.error('❌ Settings API error:', response.statusText)
      }
    } catch (error) {
      console.error('❌ Failed to fetch settings:', error)
      toast.error('Failed to load settings')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSaveProfile = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        setSettings(data.userSettings)
        toast.success('Profile updated successfully')
      } else {
        toast.error(data.error || 'Failed to update profile')
      }
    } catch (error) {
      toast.error('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const renderProfileTab = () => (
    <div className="space-y-[24px]">
      <Card className="shadow-none border">
        <CardHeader>
          <CardTitle className="text-[24px] font-bold">Profile Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-[16px]">
          {/* Avatar Section - Updated */}
          <AvatarUpload
            currentAvatarUrl={settings?.avatarUrl}
            displayName={formData.displayName}
            onAvatarUpdate={(avatarUrl) => {
              setSettings(prev => prev ? { ...prev, avatarUrl } : null)
            }}
          />

          {/* Form Fields */}
          <div className="grid grid-cols-2 gap-[16px]">
            <div className="space-y-[8px]">
              <Label htmlFor="displayName" className="text-[16px] font-medium">
                Display Name
              </Label>
              <Input
                id="displayName"
                value={formData.displayName}
                onChange={(e) => handleInputChange('displayName', e.target.value)}
                placeholder="Your display name"
                className="h-[48px] text-[16px]"
              />
            </div>

            <div className="space-y-[8px]">
              <Label htmlFor="username" className="text-[16px] font-medium">
                Username
              </Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                placeholder="Your username"
                className="h-[48px] text-[16px]"
              />
            </div>
          </div>

          <div className="space-y-[8px]">
            <Label htmlFor="email" className="text-[16px] font-medium">
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="your.email@example.com"
              className="h-[48px] text-[16px]"
            />
            {settings?.emailVerified ? (
              <p className="text-[14px] text-green-600">✓ Email verified</p>
            ) : (
              <p className="text-[14px] text-orange-600">⚠ Email not verified</p>
            )}
          </div>

          <div className="space-y-[8px]">
            <Label htmlFor="bio" className="text-[16px] font-medium">
              Bio
            </Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              placeholder="Tell us about yourself..."
              className="min-h-[120px] text-[16px]"
              maxLength={500}
            />
            <p className="text-[12px] text-textKedua">
              {formData.bio.length}/500 characters
            </p>
          </div>

          <div className="grid grid-cols-2 gap-[16px]">
            <div className="space-y-[8px]">
              <Label className="text-[16px] font-medium">Gender</Label>
              <Select value={formData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
                <SelectTrigger className="h-[48px] text-[16px]">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                  <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-[8px]">
              <Label htmlFor="region" className="text-[16px] font-medium">
                Region
              </Label>
              <Input
                id="region"
                value={formData.region}
                onChange={(e) => handleInputChange('region', e.target.value)}
                placeholder="Your region/country"
                className="h-[48px] text-[16px]"
              />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={handleSaveProfile}
            disabled={saving}
            className="px-[24px] py-[12px] text-[16px] font-medium bg-blue-600 hover:bg-blue-700"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )

  const renderSecurityTab = () => (
    <div className="space-y-[24px]">
      <PasswordChangeCard />
      <TwoFactorCard />
    </div>
  )

  const renderDeleteTab = () => (
    <div className="space-y-[24px]">
      <DeleteAccountCard />
    </div>
  )

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return renderProfileTab()
      case 'security':
        return renderSecurityTab()
      case 'notifications':
        return <NotificationsTab />
      case 'privacy':
        return <PrivacyTab />
      case 'delete':
        return renderDeleteTab()
      default:
        return renderProfileTab()
    }
  }

  // Debug loading state
  if (status === 'loading') {
    console.log('⏳ NextAuth loading...')
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-[16px] text-textKedua">Loading authentication...</p>
      </div>
    )
  }

  if (loading) {
    console.log('⏳ Settings loading...')
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center min-h-[400px] pt-[80px]">
          <p className="text-[16px] text-textKedua">Loading settings...</p>
        </div>
        <Footer />
      </div>
    )
  }

  console.log('🎨 Rendering settings page UI')
  
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background pt-[80px] pb-[100px]">
        <div className="max-w-[1200px] mx-auto px-[32px]">
          <div className="mb-[32px]">
            <h1 className="text-[32px] font-bold text-textUtama">Account Settings</h1>
            <p className="text-[16px] text-textKedua">
              Manage your account settings and preferences
            </p>
            {/* Remove debug info for production */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-4 p-4 bg-gray-100 rounded text-sm">
                <p><strong>Debug Info:</strong></p>
                <p>Status: {status}</p>
                <p>User ID: {session?.user?.id}</p>
                <p>Email: {session?.user?.email}</p>
              </div>
            )}
          </div>

          <div className="flex gap-[32px]">
            {/* Sidebar Navigation */}
            <div className="w-[280px] space-y-[8px]">
              {tabs.map((tab) => {
                const IconComponent = tab.icon
                return (
                  <button
                    key={tab.id}
                    className={`w-full flex items-center gap-[12px] px-[16px] py-[12px] text-[16px] font-medium rounded-[8px] transition-colors text-left ${
                      activeTab === tab.id
                        ? 'bg-blue-50 text-blue-600 border border-blue-200'
                        : 'text-textKedua hover:bg-warnaTiga hover:text-textUtama'
                    }`}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    <IconComponent className="size-[20px]" />
                    {tab.label}
                  </button>
                )
              })}
            </div>

            {/* Main Content */}
            <div className="flex-1">
              {renderTabContent()}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}

// Password Change Component
function PasswordChangeCard() {
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [changing, setChanging] = useState(false)

  const handlePasswordChange = async () => {
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error("Passwords don't match")
      return
    }

    setChanging(true)
    try {
      const response = await fetch('/api/settings/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(passwords),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Password changed successfully')
        setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' })
      } else {
        toast.error(data.error || 'Failed to change password')
      }
    } catch (error) {
      toast.error('Failed to change password')
    } finally {
      setChanging(false)
    }
  }

  return (
    <Card className="shadow-none border">
      <CardHeader>
        <CardTitle className="text-[20px] font-bold">Change Password</CardTitle>
      </CardHeader>
      <CardContent className="space-y-[16px]">
        <div className="space-y-[8px]">
          <Label className="text-[16px] font-medium">Current Password</Label>
          <Input
            type="password"
            value={passwords.currentPassword}
            onChange={(e) => setPasswords(prev => ({ ...prev, currentPassword: e.target.value }))}
            className="h-[48px] text-[16px]"
          />
        </div>

        <div className="space-y-[8px]">
          <Label className="text-[16px] font-medium">New Password</Label>
          <Input
            type="password"
            value={passwords.newPassword}
            onChange={(e) => setPasswords(prev => ({ ...prev, newPassword: e.target.value }))}
            className="h-[48px] text-[16px]"
          />
        </div>

        <div className="space-y-[8px]">
          <Label className="text-[16px] font-medium">Confirm New Password</Label>
          <Input
            type="password"
            value={passwords.confirmPassword}
            onChange={(e) => setPasswords(prev => ({ ...prev, confirmPassword: e.target.value }))}
            className="h-[48px] text-[16px]"
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handlePasswordChange}
          disabled={changing || !passwords.currentPassword || !passwords.newPassword}
          className="px-[24px] py-[12px] text-[16px] font-medium bg-blue-600 hover:bg-blue-700"
        >
          {changing ? 'Changing...' : 'Change Password'}
        </Button>
      </CardFooter>
    </Card>
  )
}

// Two Factor Authentication Component
function TwoFactorCard() {
  return (
    <Card className="shadow-none border">
      <CardHeader>
        <CardTitle className="text-[20px] font-bold">Two-Factor Authentication</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-[16px] text-textKedua mb-[16px]">
          Add an extra layer of security to your account
        </p>
        <Button variant="outline" className="px-[24px] py-[12px] text-[16px]">
          Enable 2FA
        </Button>
      </CardContent>
    </Card>
  )
}

// Delete Account Component
function DeleteAccountCard() {
  const [confirmText, setConfirmText] = useState('')
  const [deleting, setDeleting] = useState(false)
  const router = useRouter()

  const handleDeleteAccount = async () => {
    if (confirmText !== 'DELETE MY ACCOUNT') {
      toast.error('Please type the confirmation text correctly')
      return
    }

    setDeleting(true)
    try {
      const response = await fetch('/api/auth/delete-account', {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Account deleted successfully')
        router.push('/')
      } else {
        const data = await response.json()
        toast.error(data.error || 'Failed to delete account')
      }
    } catch (error) {
      toast.error('Failed to delete account')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <Card className="border-red-200 shadow-none">
      <CardHeader>
        <CardTitle className="text-[20px] font-bold text-red-600">
          Delete Account
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-[16px]">
        <div className="p-[16px] bg-red-50 rounded-[8px] border border-red-200">
          <p className="text-[16px] text-red-800 font-medium mb-[8px]">
            ⚠️ Warning: This action cannot be undone
          </p>
          <p className="text-[14px] text-red-700">
            Deleting your account will permanently remove:
          </p>
          <ul className="text-[14px] text-red-700 mt-[8px] ml-[16px] list-disc">
            <li>Your profile and all personal information</li>
            <li>All your uploaded models and files</li>
            <li>Your download history and collections</li>
            <li>All likes and interactions</li>
          </ul>
        </div>

        <div className="space-y-[8px]">
          <Label className="text-[16px] font-medium">
            Type "DELETE MY ACCOUNT" to confirm
          </Label>
          <Input
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="DELETE MY ACCOUNT"
            className="h-[48px] text-[16px]"
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleDeleteAccount}
          disabled={deleting || confirmText !== 'DELETE MY ACCOUNT'}
          variant="destructive"
          className="px-[24px] py-[12px] text-[16px] font-medium"
        >
          {deleting ? 'Deleting...' : 'Delete Account'}
        </Button>
      </CardFooter>
    </Card>
  )
}

// Notifications Tab Component
function NotificationsTab() {
  return (
    <Card className="shadow-none border">
      <CardHeader>
        <CardTitle className="text-[24px] font-bold">Notification Preferences</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-[16px] text-textKedua mb-[16px]">
          Notification settings will be available in a future update.
        </p>
        <Button variant="outline" className="px-[24px] py-[12px] text-[16px]">
          Manage Notifications
        </Button>
      </CardContent>
    </Card>
  )
}

// Privacy Tab Component
function PrivacyTab() {
  return (
    <Card className="shadow-none border">
      <CardHeader>
        <CardTitle className="text-[24px] font-bold">Privacy Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-[16px] text-textKedua mb-[16px]">
          Privacy settings will be available in a future update.
        </p>
        <Button variant="outline" className="px-[24px] py-[12px] text-[16px]">
          Manage Privacy Settings
        </Button>
      </CardContent>
    </Card>
  )
}