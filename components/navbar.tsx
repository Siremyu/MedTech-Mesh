"use client"

import * as React from "react"
import Link from "next/link"
import { Search, Upload, Bell, User } from "lucide-react"
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

interface NavbarProps {
  isLoggedIn?: boolean
  onLogin?: () => void
  onLogout?: () => void
}

export function Navbar({ isLoggedIn = false, onLogin, onLogout }: NavbarProps) {
  const [showLoginModal, setShowLoginModal] = React.useState(false)

  const handleLoginSuccess = () => {
    setShowLoginModal(false)
    onLogin?.()
  }

  const handleLogout = () => {
    onLogout?.()
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b bg-background">
      <div className="flex items-center justify-between px-[52px] py-[12px]">
        {/* Left side - Logo and Navigation */}
        <div className="flex items-center gap-[24px]">
          <Link href="/" className="text-[16px] font-medium">
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
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <input
              type="text"
              placeholder="Search"
              className="w-full pl-10 pr-4 py-[8px] border rounded-full bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          
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
                        <AvatarFallback></AvatarFallback>
                      </Avatar>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[317px] p-[18px]">
                  <div className="flex items-center gap-[12px] mb-[14px]">
                    <Avatar className="size-[55px]">
                      <AvatarFallback className="">U</AvatarFallback>
                    </Avatar>
                    <div className="gap-[4px] flex flex-col">
                      <div className="font-bold text-[16px]">Nama User</div>
                      <div className="font-medium text-[12px]">Username</div>
                    </div>
                  </div>

                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
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