"use client"

import * as React from "react"
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
  const [userInfo, setUserInfo] = React.useState({
    displayName: "Name",
    username: "@username",
    email: "lorem@gmail.com",
    gender: "Man",
    region: "Konoha"
  })

  const [editField, setEditField] = React.useState<string | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false)

  const handleEditField = (field: string) => {
    setEditField(field)
    setIsEditDialogOpen(true)
  }

  const handleSaveField = (newValue: string) => {
    if (editField) {
      setUserInfo(prev => ({
        ...prev,
        [editField === "Display Name" ? "displayName" : editField.toLowerCase()]: newValue
      }))
    }
    setIsEditDialogOpen(false)
    setEditField(null)
  }

  const getCurrentValue = () => {
    if (!editField) return ""
    
    switch (editField) {
      case "Display Name":
        return userInfo.displayName
      case "Username":
        return userInfo.username
      case "Email":
        return userInfo.email
      case "Gender":
        return userInfo.gender
      case "Region":
        return userInfo.region
      default:
        return ""
    }
  }

  return (
    <>
      <Card className="shadow-none">
        <CardHeader className="w-full">
          <CardTitle className="text-[20px] font-semibold">Account Information</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="px-6">
            <AccountInfoRow
              label="Avatar"
              value=""
              isEditable={true}
              onClick={() => handleEditField("Avatar")}
            />
            <AccountInfoRow
              label="Display Name"
              value={userInfo.displayName}
              isEditable={true}
              onClick={() => handleEditField("Display Name")}
            />
            <AccountInfoRow
              label="Username"
              value={userInfo.username}
              isEditable={true}
              onClick={() => handleEditField("Username")}
            />
            <AccountInfoRow
              label="Email"
              value={userInfo.email}
              isEditable={true}
              onClick={() => handleEditField("Email")}
            />
            <AccountInfoRow
              label="Gender"
              value={userInfo.gender}
              isEditable={true}
              onClick={() => handleEditField("Gender")}
            />
            <AccountInfoRow
              label="Region"
              value={userInfo.region}
              isEditable={true}
              onClick={() => handleEditField("Region")}
            />
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
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