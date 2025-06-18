"use client"

import * as React from "react"
import { useSearchParams } from 'next/navigation'
import { Navbar } from "@/components/navbar"
import { EditForm } from "@/components/edit/edit-form"

export default function EditPage() {
  const [isLoggedIn, setIsLoggedIn] = React.useState(true) // Assuming user must be logged in to edit
  const searchParams = useSearchParams()
  const modelId = searchParams.get('id')

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
          <EditForm modelId={modelId} />
        </div>
      </main>
    </div>
  )
}