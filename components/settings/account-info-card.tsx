"use client"

import * as React from "react"
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '@/lib/store'
import { updateField, saveSettingsStart, saveSettingsSuccess } from '@/lib/features/settings/settingsSlice'
import { ChevronRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { EditDialog } from "./edit-dialog"

interface AccountInfoRowProps {
  label: string
  value: string
  isEditable?: boolean
  onClick?: () => void
}

function AccountInfoRow({ label, value, isEditable = true, onClick }: AccountInfoRowProps) {
  return (
    <div 
      className={`flex items-center justify-between py-4 border-b last:border-b-0 ${
        isEditable ? 'cursor-pointer hover:bg-muted/50' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex items-center gap-4">
        {label === "Avatar" ? (
          <>
            <span className="text-muted-foreground min-w-[120px]">{label}</span>
            <Avatar className="h-16 w-16">
              <AvatarFallback className="text-lg">U</AvatarFallback>
            </Avatar>
          </>
        ) : (
          <>
            <span className="text-muted-foreground min-w-[120px]">{label}</span>
            <span className="font-medium">{value}</span>
          </>
        )}
      </div>
      {isEditable && (
        <ChevronRight className="h-5 w-5 text-muted-foreground" />
      )}
    </div>
  )
}

export function AccountInfoCard() {
  const dispatch = useDispatch<AppDispatch>()
  const { settings, loading } = useSelector((state: RootState) => state.settings)
  const [editField, setEditField] = React.useState<string | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false)

  const handleEditField = (field: string) => {
    setEditField(field)
    setIsEditDialogOpen(true)
  }

  const handleSaveField = async (newValue: string) => {
    if (editField) {
      dispatch(saveSettingsStart())
      
      // Map display names to actual field names
      const fieldMap: { [key: string]: keyof typeof settings } = {
        "Display Name": "displayName",
        "Username": "username",
        "Email": "email",
        "Gender": "gender",
        "Region": "region"
      }
      
      const actualField = fieldMap[editField] || editField.toLowerCase()
      
      // Update the field in Redux
      dispatch(updateField({ field: actualField as any, value: newValue }))
      
      // Simulate API call
      setTimeout(() => {
        dispatch(saveSettingsSuccess())
      }, 1000)
    }
    
    setIsEditDialogOpen(false)
    setEditField(null)
  }

  const getCurrentValue = () => {
    if (!editField) return ""
    
    switch (editField) {
      case "Display Name":
        return settings.displayName
      case "Username":
        return settings.username
      case "Email":
        return settings.email
      case "Gender":
        return settings.gender
      case "Region":
        return settings.region
      default:
        return ""
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-0">
            <AccountInfoRow
              label="Avatar"
              value=""
              isEditable={true}
              onClick={() => handleEditField("Avatar")}
            />
            <AccountInfoRow
              label="Display Name"
              value={settings.displayName}
              isEditable={true}
              onClick={() => handleEditField("Display Name")}
            />
            <AccountInfoRow
              label="Username"
              value={settings.username}
              isEditable={true}
              onClick={() => handleEditField("Username")}
            />
            <AccountInfoRow
              label="Email"
              value={settings.email}
              isEditable={true}
              onClick={() => handleEditField("Email")}
            />
            <AccountInfoRow
              label="Gender"
              value={settings.gender}
              isEditable={true}
              onClick={() => handleEditField("Gender")}
            />
            <AccountInfoRow
              label="Region"
              value={settings.region}
              isEditable={true}
              onClick={() => handleEditField("Region")}
            />
          </div>
        </CardContent>
      </Card>

      <EditDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        field={editField || ""}
        currentValue={getCurrentValue()}
        onSave={handleSaveField}
      />
    </>
  )
}