"use client"
import * as React from "react"
import { useSelector } from 'react-redux'
import { RootState } from '@/lib/store'
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { AccountSettings } from "@/components/settings/account-settings"
import { SettingsSkeleton } from "@/components/skeletons/settings-skeleton"

export default function SettingsPage() {
  const { isLoggedIn } = useSelector((state: RootState) => state.auth)
  const { loading } = useSelector((state: RootState) => state.settings)

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-[80px] pb-[80px] px-[52px]">
        {loading ? (
          <SettingsSkeleton />
        ) : (
          <AccountSettings />
        )}
      </main>

      <Footer />
    </div>
  )
}