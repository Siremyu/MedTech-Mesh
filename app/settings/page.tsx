"use client"
import * as React from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { AccountSettings } from "@/components/settings/account-settings"

export default function SettingsPage() {
  const [isLoggedIn, setIsLoggedIn] = React.useState(true) // Assuming user is logged in to access settings

  const handleLogin = () => {
    setIsLoggedIn(true)
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar 
        isLoggedIn={isLoggedIn} 
        onLogin={handleLogin}
        onLogout={handleLogout}
      />
      
      <main className="pt-[80px] pb-[80px] px-[52px]">
        <AccountSettings />
      </main>

      <Footer />
    </div>
  )
}