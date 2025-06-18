"use client"

import * as React from "react"
import { Navbar } from "@/components/navbar"
import { UploadForm } from "@/components/upload/upload-form"

export default function UploadPage() {
  const [isLoggedIn, setIsLoggedIn] = React.useState(true) // Assuming user must be logged in to upload

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
      
      <main className="pt-[80px] pb-[100px] px-[52px]">
        <div className="max-w-4xl mx-auto">
          <UploadForm />
        </div>
      </main>
    </div>
  )
}