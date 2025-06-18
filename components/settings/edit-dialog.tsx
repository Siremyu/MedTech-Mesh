"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface EditDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  field: string
  currentValue: string
  onSave: (newValue: string) => void
}

export function EditDialog({ open, onOpenChange, field, currentValue, onSave }: EditDialogProps) {
  const [value, setValue] = React.useState(currentValue)

  React.useEffect(() => {
    setValue(currentValue)
  }, [currentValue, open])

  const handleSave = () => {
    onSave(value)
    onOpenChange(false)
  }

  const renderField = () => {
    switch (field) {
      case "Avatar":
        return (
          <div className="space-y-4">
            <div className="flex justify-center">
              <Avatar className="h-24 w-24">
                <AvatarFallback className="text-2xl">U</AvatarFallback>
              </Avatar>
            </div>
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="avatar">Upload new avatar</Label>
              <Input id="avatar" type="file" accept="image/*" />
            </div>
          </div>
        )
      
      case "Gender":
        return (
          <div className="space-y-3">
            <Label>Gender</Label>
            <div className="space-y-2">
              {["Man", "Woman", "Other", "Prefer not to say"].map((option) => (
                <div key={option} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id={option}
                    name="gender"
                    value={option}
                    checked={value === option}
                    onChange={(e) => setValue(e.target.value)}
                    className="w-4 h-4"
                  />
                  <Label htmlFor={option} className="cursor-pointer">{option}</Label>
                </div>
              ))}
            </div>
          </div>
        )
      
      case "Region":
        return (
          <div className="space-y-3">
            <Label>Region</Label>
            <div className="space-y-2">
              {["Konoha", "Sunagakure", "Kirigakure", "Kumogakure", "Iwagakure"].map((option) => (
                <div key={option} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id={option}
                    name="region"
                    value={option}
                    checked={value === option}
                    onChange={(e) => setValue(e.target.value)}
                    className="w-4 h-4"
                  />
                  <Label htmlFor={option} className="cursor-pointer">{option}</Label>
                </div>
              ))}
            </div>
          </div>
        )
      
      default:
        return (
          <div className="space-y-2">
            <Label htmlFor={field.toLowerCase()}>{field}</Label>
            <Input
              id={field.toLowerCase()}
              type={field === "Email" ? "email" : "text"}
              placeholder={`Enter your ${field.toLowerCase()}`}
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
          </div>
        )
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit {field}</DialogTitle>
          <DialogDescription>
            Make changes to your {field.toLowerCase()}. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          {renderField()}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}