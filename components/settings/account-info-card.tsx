"use client"

import * as React from "react"
import { useDispatch, useSelector } from 'react-redux'
import { useSession } from "next-auth/react"
import { AppDispatch, RootState } from '@/lib/store'
import { 
  updateField, 
  saveSettingsStart, 
  saveSettingsSuccess, 
  saveSettingsFailure,
  loadUserSettings,
  clearError
} from '@/lib/features/settings/settingsSlice'
import { ChevronRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { EditDialog } from "./edit-dialog"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

interface AccountInfoRowProps {
  label: string
  value: string
  isEditable?: boolean
  onClick?: () => void
}

function AccountInfoRow({ label, value, isEditable = true, onClick }: AccountInfoRowProps) {
  return (
    <div 
      className={`flex items-center justify-between py-4 border-b border-gray-200 last:border-b-0 ${
        isEditable ? 'cursor-pointer hover:bg-gray-50' : ''
      }`}
      onClick={isEditable ? onClick : undefined}
    >
      <div className="flex-1">
        <div className="flex items-center gap-3">
          {label === "Avatar" && (
            <Avatar className="h-10 w-10">
              <AvatarImage src={value || undefined} />
              <AvatarFallback>
                {value ? value.slice(0, 2).toUpperCase() : 'U'}
              </AvatarFallback>
            </Avatar>
          )}
          <div>
            <p className="text-sm font-medium text-gray-900">{label}</p>
            {label !== "Avatar" && (
              <p className="text-sm text-gray-500">{value || 'Not set'}</p>
            )}
          </div>
        </div>
      </div>
      {isEditable && <ChevronRight className="h-4 w-4 text-gray-400" />}
    </div>
  )
}

export function AccountInfoCard() {
  const dispatch = useDispatch<AppDispatch>()
  const { data: session } = useSession()
  const { userSettings, loading, error } = useSelector((state: RootState) => state.settings)
  const [editField, setEditField] = React.useState<string | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false)
  const [isLoadingSettings, setIsLoadingSettings] = React.useState(true)

  // Load user settings on component mount
  React.useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await fetch('/api/settings')
        const data = await response.json()
        
        if (response.ok) {
          dispatch(loadUserSettings(data.userSettings))
        } else {
          dispatch(saveSettingsFailure(data.error || 'Failed to load settings'))
        }
      } catch (error) {
        dispatch(saveSettingsFailure('Failed to load settings'))
      } finally {
        setIsLoadingSettings(false)
      }
    }

    if (session?.user) {
      loadSettings()
    }
  }, [session, dispatch])

  const handleEditField = (field: string) => {
    setEditField(field)
    setIsEditDialogOpen(true)
    dispatch(clearError()) // Clear any previous errors
  }

  const handleSaveField = async (newValue: string) => {
    if (!editField) return

    try {
      dispatch(saveSettingsStart())
      
      // Map display names to actual field names
      const fieldMap: { [key: string]: string } = {
        "Display Name": "displayName",
        "Username": "username",
        "Email": "email",
        "Bio": "bio",
        "Gender": "gender",
        "Region": "region"
      }
      
      const actualField = fieldMap[editField] || editField.toLowerCase()
      
      // Update the field in Redux first for immediate UI feedback
      dispatch(updateField({ field: actualField, value: newValue }))
      
      // Send API request
      const response = await fetch('/api/settings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ [actualField]: newValue }),
      })
      
      const data = await response.json()
      
      if (response.ok) {
        dispatch(saveSettingsSuccess(data.userSettings))
        toast.success(`${editField} updated successfully`)
      } else {
        // Revert the change if API call failed
        dispatch(saveSettingsFailure(data.error || 'Failed to update settings'))
        toast.error(data.error || 'Failed to update settings')
      }
    } catch (error: any) {
      dispatch(saveSettingsFailure(error.message || 'Failed to update settings'))
      toast.error('Failed to update settings')
    }
    
    setIsEditDialogOpen(false)
    setEditField(null)
  }

  const getCurrentValue = () => {
    if (!editField) return ""
    
    switch (editField) {
      case "Display Name":
        return userSettings.displayName
      case "Username":
        return userSettings.username
      case "Email":
        return userSettings.email
      case "Bio":
        return userSettings.bio
      case "Gender":
        return userSettings.gender
      case "Region":
        return userSettings.region
      default:
        return ""
    }
  }

  if (isLoadingSettings) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          {error && (
            <div className="text-red-500 text-sm mt-2">
              {error}
            </div>
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-0">
            <AccountInfoRow
              label="Avatar"
              value={userSettings.avatarUrl || session?.user?.image || ''}
              isEditable={false} // For now, disable avatar editing
            />
            <AccountInfoRow
              label="Display Name"
              value={userSettings.displayName}
              isEditable={true}
              onClick={() => handleEditField("Display Name")}
            />
            <AccountInfoRow
              label="Username"
              value={userSettings.username}
              isEditable={true}
              onClick={() => handleEditField("Username")}
            />
            <AccountInfoRow
              label="Email"
              value={userSettings.email}
              isEditable={true}
              onClick={() => handleEditField("Email")}
            />
            <AccountInfoRow
              label="Bio"
              value={userSettings.bio}
              isEditable={true}
              onClick={() => handleEditField("Bio")}
            />
            <AccountInfoRow
              label="Gender"
              value={userSettings.gender}
              isEditable={true}
              onClick={() => handleEditField("Gender")}
            />
            <AccountInfoRow
              label="Region"
              value={userSettings.region}
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
        loading={loading}
      />
    </>
  )
}