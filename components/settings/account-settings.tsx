"use client"

import * as React from "react"
import { AccountInfoCard } from "./account-info-card"
import { DeleteAccountCard } from "./delete-account-card"

export function AccountSettings() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <AccountInfoCard />
      <DeleteAccountCard />
    </div>
  )
}