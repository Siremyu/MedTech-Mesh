"use client"

import * as React from "react"
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '@/lib/store'
import { logout } from '@/lib/features/auth/authSlice'
import { setSearchQuery, setSearchResults, setIsSearching, clearSearch, setSearchLoading } from '@/lib/features/models/modelsSlice'
import Link from "next/link"
import { Search, Upload, Bell, User, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { 
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"
import { LoginModal } from "@/components/login-modal"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { CiSettings } from "react-icons/ci";
import { IoLogOutOutline } from "react-icons/io5";
import { useRouter, usePathname } from "next/navigation";

interface NavbarProps {
  onLogin?: () => void
  onLogout?: () => void
}

export function Navbar({ onLogin, onLogout }: NavbarProps) {
  const dispatch = useDispatch<AppDispatch>()
  const { user, isLoggedIn } = useSelector((state: RootState) => state.auth)
  const { searchQuery, isSearching } = useSelector((state: RootState) => state.models)
  const [showLoginModal, setShowLoginModal] = React.useState(false)
  const [localSearchQuery, setLocalSearchQuery] = React.useState(searchQuery)
  const router = useRouter();
  const pathname = usePathname();

  // Generate search results based on query with unique IDs
  const generateSearchResults = (query: string) => {
    if (!query.trim()) return []
    
    const searchTerms = ['heart', 'lung', 'brain', 'anatomy', 'medical', 'organ', 'skeleton', 'muscle']
    const categories = ['Cardiology', 'Neurology', 'Orthopedics', 'General', 'Surgery']
    const timestamp = Date.now()
    
    return Array.from({ length: 8 }, (_, i) => ({
      id: `search-${query}-initial-${i}-${timestamp}`, // More unique ID pattern
      title: `${query} Model ${i + 1}`,
      author: `${categories[i % categories.length]} Author`,
      downloads: Math.floor(Math.random() * 800) + 200,
      likes: Math.floor(Math.random() * 400) + 100,
      category: categories[i % categories.length],
    }))
  }

  const handleSearch = async (query: string) => {
    if (!query.trim()) return

    // Navigate to home page if not already there
    router.push('/')

    dispatch(setSearchQuery(query))
    dispatch(setIsSearching(true))
    dispatch(setSearchLoading(true))

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const results = generateSearchResults(query)
      dispatch(setSearchResults(results))
    } catch (error) {
      console.error('Search failed:', error)
    } finally {
      dispatch(setSearchLoading(false))
    }
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleSearch(localSearchQuery)
  }

  const handleClearSearch = () => {
    setLocalSearchQuery('')
    dispatch(clearSearch())
  }

  const handleLoginSuccess = () => {
    setShowLoginModal(false)
    onLogin?.()
  }

  const handleLogout = () => {
    dispatch(logout())
    onLogout?.()
  }

  const handleProfileClick = () => {
    router.push("/profile");
  };

  // Update local search query when Redux state changes
  React.useEffect(() => {
    setLocalSearchQuery(searchQuery)
  }, [searchQuery])

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b bg-background">
      <div className="flex items-center justify-between px-[52px] py-[12px]">
        {/* Left side - Logo and Navigation */}
        <div className="flex items-center gap-[24px]">
          <Link href="/" className="text-[16px] font-medium" onClick={handleClearSearch}>
            Logo
          </Link>
          
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <Link href="/community" legacyBehavior passHref>
                  <NavigationMenuLink className="text-[16px] font-medium hover:text-primary">
                    Community
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link href="/forum" legacyBehavior passHref>
                  <NavigationMenuLink className="text-[16px] font-medium hover:text-primary">
                    Forum
                  </NavigationMenuLink>
                </Link>
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
          
          {isLoggedIn ? (
            <>
              <Link href="/upload">
                <Button className="cursor-pointer" variant="outline" size="sm">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload
                </Button>
              </Link>
              
              <Button variant="ghost" size="icon" className="cursor-pointer rounded-full">
                <Bell className="h-[22px] w-[22px] fill-black" />
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="cursor-pointer">
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                      <Avatar className="h-[45px] w-[45px]">
                        <AvatarFallback>{user?.displayName?.slice(0, 2).toUpperCase() || 'U'}</AvatarFallback>
                      </Avatar>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[317px] p-[18px]">
                  <div className="flex items-center gap-[12px] mb-[14px]">
                    <Avatar className="size-[55px]">
                      <AvatarFallback className="">{user?.displayName?.slice(0, 2).toUpperCase() || 'U'}</AvatarFallback>
                    </Avatar>
                    <div className="gap-[4px] flex flex-col">
                      <div className="font-bold text-[16px]">{user?.displayName || 'User Name'}</div>
                      <div className="font-medium text-[12px]">{user?.username || 'username'}</div>
                    </div>
                  </div>

                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleProfileClick}>
                    <User className="mr-[4px] h-[14px] w-[14px]" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings">
                      <CiSettings className="mr-[4px] h-[14px] w-[14px]" />
                      Account Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
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