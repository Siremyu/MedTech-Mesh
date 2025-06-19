"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface EditDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  field: string
  currentValue: string
  onSave: (value: string) => void
  loading?: boolean
}

export function EditDialog({ 
  open, 
  onOpenChange, 
  field, 
  currentValue, 
  onSave,
  loading = false
}: EditDialogProps) {
  const [value, setValue] = React.useState(currentValue)

  React.useEffect(() => {
    setValue(currentValue)
  }, [currentValue, open])

  const handleSave = () => {
    onSave(value)
  }

  const handleCancel = () => {
    setValue(currentValue)
    onOpenChange(false)
  }

  const renderInput = () => {
    switch (field) {
      case "Bio":
        return (
          <Textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Tell us about yourself..."
            className="min-h-[100px]"
            maxLength={500}
          />
        )
      case "Gender":
        return (
          <Select value={value} onValueChange={setValue}>
            <SelectTrigger>
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="non-binary">Non-binary</SelectItem>
              <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
            </SelectContent>
          </Select>
        )
      case "Region":
        return (
          <Select value={value} onValueChange={setValue}>
            <SelectTrigger>
              <SelectValue placeholder="Select region" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="north-america">North America</SelectItem>
              <SelectItem value="south-america">South America</SelectItem>
              <SelectItem value="europe">Europe</SelectItem>
              <SelectItem value="asia">Asia</SelectItem>
              <SelectItem value="africa">Africa</SelectItem>
              <SelectItem value="oceania">Oceania</SelectItem>
              <SelectItem value="middle-east">Middle East</SelectItem>
            </SelectContent>
          </Select>
        )
      default:
        return (
          <Input
            type={field === "Email" ? "email" : "text"}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={`Enter your ${field.toLowerCase()}`}
          />
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
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor={field}>
              {field}
              {field === "Bio" && (
                <span className="text-sm text-muted-foreground ml-2">
                  ({value.length}/500)
                </span>
              )}
            </Label>
            {renderInput()}
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleCancel}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            onClick={handleSave}
            disabled={loading || value === currentValue}
          >
            {loading ? "Saving..." : "Save changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}