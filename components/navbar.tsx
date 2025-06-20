"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '@/lib/store'
import { logout } from '@/lib/features/auth/authSlice'
import { setSearchQuery, clearSearch } from '@/lib/features/models/modelsSlice'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu"
import { LoginModal } from "./login-modal"
import { Search, Upload, Bell, User, X, Shield } from "lucide-react"
import { CiSettings } from "react-icons/ci"
import { IoLogOutOutline } from "react-icons/io5"
import { toast } from 'sonner'

interface NavbarProps {
  onLogin?: () => void
  onLogout?: () => void
}

export function Navbar({ onLogin, onLogout }: NavbarProps) {
  const router = useRouter()
  const dispatch = useDispatch<AppDispatch>()
  const { data: session, status } = useSession()
  const { user: reduxUser, isLoggedIn } = useSelector((state: RootState) => state.auth)
  const { searchQuery } = useSelector((state: RootState) => state.models)
  
  const [showLoginModal, setShowLoginModal] = React.useState(false)
  const [localSearchQuery, setLocalSearchQuery] = React.useState(searchQuery)
  const [isAdmin, setIsAdmin] = React.useState(false)

  // Update local search when Redux state changes
  React.useEffect(() => {
    setLocalSearchQuery(searchQuery)
  }, [searchQuery])

  // Check admin status
  React.useEffect(() => {
    const checkAdmin = async () => {
      if (session?.user) {
        try {
          const response = await fetch('/api/admin/check-role')
          if (response.ok) {
            const data = await response.json()
            setIsAdmin(data.isAdmin)
          }
        } catch (error) {
          console.error('Error checking admin status:', error)
        }
      }
    }

    checkAdmin()
  }, [session])

  const isAuthenticated = status === "authenticated" || isLoggedIn

  const getDisplayName = () => {
    if (session?.user?.name) {
      return session.user.name
    }
    if (reduxUser?.displayName) {
      return reduxUser.displayName
    }
    return 'User'
  }

  const getUsername = () => {
    if (session?.user?.email) {
      return session.user.email.split('@')[0]
    }
    if (reduxUser?.username) {
      return reduxUser.username
    }
    return 'user'
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (localSearchQuery.trim()) {
      dispatch(setSearchQuery(localSearchQuery.trim()))
      router.push(`/?search=${encodeURIComponent(localSearchQuery.trim())}`)
    }
  }

  const handleClearSearch = () => {
    dispatch(clearSearch())
    setLocalSearchQuery('')
    router.push('/')
  }

  const handleLoginSuccess = () => {
    setShowLoginModal(false)
    onLogin?.()
  }

  const handleLogout = async () => {
    try {
      dispatch(logout())
      await signOut({ redirect: false })
      onLogout?.()
      router.push('/')
      toast.success('Logged out successfully')
    } catch (error) {
      console.error('Logout error:', error)
      toast.error('Failed to logout')
    }
  }

  // Fix: Separate navigation handlers to prevent nested <a> tags
  const handleProfileClick = () => {
    console.log('👤 Profile Navigation Debug:')
    console.log('Session status:', status)
    console.log('Session user:', session?.user)
    console.log('Redux user:', reduxUser)
    console.log('Is authenticated:', isAuthenticated)
    
    try {
      const userId = session?.user?.id || reduxUser?.id
      
      if (!userId) {
        console.log('❌ No user ID found for profile navigation')
        toast.error('Please login to view profile')
        return
      }
      
      console.log('✅ Navigating to profile with user ID:', userId)
      router.push(`/profile?userId=${userId}`)
      
    } catch (error) {
      console.error('❌ Profile navigation error:', error)
      toast.error('Failed to navigate to profile')
    }
  }

  const handleSettingsClick = () => {
    console.log('🔧 Settings clicked')
    try {
      router.push('/settings')
      console.log('✅ Navigation to /settings initiated')
    } catch (error) {
      console.error('❌ Navigation error:', error)
    }
  }

  // Fix: Navigation handlers without nested <a> tags
  const handleCommunityClick = () => {
    router.push('/community')
  }

  const handleForumClick = () => {
    router.push('/forum')
  }

  const handleLogoClick = () => {
    handleClearSearch()
    router.push('/')
  }

  const handleUploadClick = () => {
    router.push('/upload')
  }

  const handleAdminClick = () => {
    router.push('/admin')
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b bg-background">
      <div className="flex items-center justify-between px-[52px] py-[12px]">
        {/* Left side - Logo and Navigation */}
        <div className="flex items-center gap-[24px]">
          {/* Fix: Remove Link wrapper, use button with onClick */}
          <button 
            onClick={handleLogoClick}
            className="text-[16px] font-medium hover:text-primary cursor-pointer"
          >
            Logo
          </button>
          
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                {/* Fix: Remove Link wrapper, use NavigationMenuLink with onClick */}
                <NavigationMenuLink 
                  className="text-[16px] font-medium hover:text-primary cursor-pointer"
                  onClick={handleCommunityClick}
                >
                  Community
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                {/* Fix: Remove Link wrapper, use NavigationMenuLink with onClick */}
                <NavigationMenuLink 
                  className="text-[16px] font-medium hover:text-primary cursor-pointer"
                  onClick={handleForumClick}
                >
                  Forum
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* Right side - Search and Actions */}
        <div className="flex items-center gap-[24px]">
          <form onSubmit={handleSearchSubmit} className="relative w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <input
              type="text"
              placeholder="Search models..."
              value={localSearchQuery}
              onChange={(e) => setLocalSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-[8px] border rounded-full bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            />
            {localSearchQuery && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </form>
          
          {status === "loading" ? (
            <div>Loading...</div>
          ) : isAuthenticated ? (
            <>
              {/* Show different buttons based on user role */}
              {isAdmin ? (
                // Admin users see Admin Dashboard button instead of Upload
                <Button 
                  className="cursor-pointer bg-red-600 hover:bg-red-700 text-white" 
                  size="sm"
                  onClick={handleAdminClick}
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Admin Dashboard
                </Button>
              ) : (
                // Regular users see Upload button
                <Button 
                  className="cursor-pointer" 
                  variant="outline" 
                  size="sm"
                  onClick={handleUploadClick}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload
                </Button>
              )}

              <Button variant="ghost" size="icon" className="cursor-pointer rounded-full">
                <Bell className="h-[22px] w-[22px] fill-black" />
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="cursor-pointer">
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                      <Avatar className="h-[45px] w-[45px]">
                        {(session?.user?.image || reduxUser?.avatarUrl) && (
                          <AvatarImage 
                            src={session?.user?.image || reduxUser?.avatarUrl || ''}
                            alt={session?.user?.name || 'User avatar'}
                            className="object-cover"
                          />
                        )}
                        <AvatarFallback>
                          {getDisplayName().slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[317px] p-[18px]">
                  <div className="flex items-center gap-[12px] mb-[14px]">
                    <Avatar className="size-[55px]">
                      {(session?.user?.image || reduxUser?.avatarUrl) && (
                        <AvatarImage 
                          src={session?.user?.image || reduxUser?.avatarUrl || ''}
                          alt={session?.user?.name || 'User avatar'}
                          className="object-cover"
                        />
                      )}
                      <AvatarFallback>
                        {getDisplayName().slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="gap-[4px] flex flex-col">
                      <div className="font-bold text-[16px]">
                        {getDisplayName()}
                      </div>
                      <div className="font-medium text-[12px]">
                        @{getUsername()}
                      </div>
                    </div>
                  </div>

                  <DropdownMenuSeparator />
                  
                  <DropdownMenuItem onClick={handleProfileClick} className="cursor-pointer">
                    <User className="mr-[4px] h-[14px] w-[14px]" />
                    Profile
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem onClick={handleSettingsClick} className="cursor-pointer">
                    <CiSettings className="mr-[4px] h-[16px] w-[16px]" />
                    Settings
                  </DropdownMenuItem>
                  
                  {/* Admin dropdown item - only show for admins in dropdown */}
                  {isAuthenticated && isAdmin && (
                    <DropdownMenuItem onClick={handleAdminClick} className="cursor-pointer">
                      <Shield className="mr-[4px] h-[14px] w-[14px]" />
                      Admin Dashboard
                    </DropdownMenuItem>
                  )}
                  
                  {/* Upload option in dropdown for admins */}
                  {isAuthenticated && isAdmin && (
                    <DropdownMenuItem onClick={handleUploadClick} className="cursor-pointer">
                      <Upload className="mr-[4px] h-[14px] w-[14px]" />
                      Upload Model
                    </DropdownMenuItem>
                  )}
                  
                  <DropdownMenuSeparator />
                  
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                    <IoLogOutOutline className="mr-[4px] h-[14px] w-[14px]" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button 
                className="px-[32px] text-[16px] rounded-full py-[12px]"
                onClick={() => setShowLoginModal(true)}
              >
                Login
              </Button>
            </>
          )}
        </div>
      </div>
      
      {/* Login Modal */}
      <LoginModal 
        open={showLoginModal} 
        onOpenChange={setShowLoginModal}
        onLoginSuccess={handleLoginSuccess}
      />
    </header>
  )
}