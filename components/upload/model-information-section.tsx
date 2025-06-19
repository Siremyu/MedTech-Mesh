"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface ModelInformationSectionProps {
  onDataChange: (data: any) => void
}

export function ModelInformationSection({ onDataChange }: ModelInformationSectionProps) {
  const [formData, setFormData] = React.useState({
    title: "",
    category: "",
    tags: "",
    nsfwContent: false,
    allowAdaptations: "yes",
    allowCommercialUse: "no",
    allowSharing: "yes",
    visibility: "public",
    description: "",
    communityPost: false
  })

  const [errors, setErrors] = React.useState<Record<string, string>>({})

  // Validation rules
  const validateField = (field: string, value: any): string => {
    switch (field) {
      case 'title':
        if (!value || !value.toString().trim()) return 'Title is required'
        if (value.toString().trim().length < 3) return 'Title must be at least 3 characters'
        if (value.toString().trim().length > 100) return 'Title must be less than 100 characters'
        return ''
      
      case 'category':
        if (!value || !value.toString().trim()) return 'Category is required'
        return ''
      
      case 'description':
        if (!value || !value.toString().trim()) return 'Description is required'
        if (value.toString().trim().length < 10) return 'Description must be at least 10 characters'
        if (value.toString().trim().length > 2000) return 'Description must be less than 2000 characters'
        return ''
      
      case 'tags':
        if (value && value.toString().length > 500) return 'Tags list is too long'
        return ''
      
      default:
        return ''
    }
  }

  const handleInputChange = (field: string, value: any) => {
    // Validate the field
    const error = validateField(field, value)
    setErrors(prev => ({ ...prev, [field]: error }))

    // Update form data
    const updatedData = { ...formData, [field]: value }
    setFormData(updatedData)
    
    // Only send valid data to parent
    const hasErrors = Object.values({ ...errors, [field]: error }).some(err => err !== '')
    if (!hasErrors) {
      onDataChange(updatedData)
    }
  }

  // Validate all fields on mount
  React.useEffect(() => {
    const allErrors: Record<string, string> = {}
    Object.keys(formData).forEach(field => {
      const error = validateField(field, formData[field as keyof typeof formData])
      if (error) allErrors[field] = error
    })
    setErrors(allErrors)
  }, [])

  return (
    <Card className="mb-6 shadow-none">
      <CardHeader>
        <CardTitle>Model Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Model Name */}
        <div>
          <Label htmlFor="title" className="text-base font-medium">
            *Model Name
          </Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => handleInputChange("title", e.target.value)}
            placeholder="Enter a descriptive title for your model"
            className="mt-2"
          />
          {errors.title && (
            <p className="text-sm text-red-600 mt-1">{errors.title}</p>
          )}
        </div>

        {/* Category */}
        <div>
          <Label htmlFor="category" className="text-base font-medium">
            *Category
          </Label>
          <Select 
            value={formData.category} 
            onValueChange={(value) => handleInputChange("category", value)}
          >
            <SelectTrigger className="mt-2">
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="anatomy">Anatomy</SelectItem>
              <SelectItem value="cardiology">Cardiology</SelectItem>
              <SelectItem value="neurology">Neurology</SelectItem>
              <SelectItem value="orthopedics">Orthopedics</SelectItem>
              <SelectItem value="dentistry">Dentistry</SelectItem>
              <SelectItem value="surgery">Surgery</SelectItem>
              <SelectItem value="pathology">Pathology</SelectItem>
              <SelectItem value="radiology">Radiology</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
          {errors.category && (
            <p className="text-sm text-red-600 mt-1">{errors.category}</p>
          )}
        </div>

        {/* Tags */}
        <div>
          <Label htmlFor="tags" className="text-base font-medium">
            Tags (Optional)
          </Label>
          <Input
            id="tags"
            placeholder="medical, anatomy, heart, 3d model (comma separated)"
            value={formData.tags}
            onChange={(e) => handleInputChange("tags", e.target.value)}
            className="mt-2"
          />
          {errors.tags && (
            <p className="text-sm text-red-600 mt-1">{errors.tags}</p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            Separate multiple tags with commas
          </p>
        </div>

        {/* Description */}
        <div>
          <Label htmlFor="description" className="text-base font-medium">
            *Description
          </Label>
          <Textarea
            id="description"
            placeholder="Describe your model, its purpose, and any important details..."
            value={formData.description}
            onChange={(e) => handleInputChange("description", e.target.value)}
            rows={4}
            className="mt-2"
          />
          {errors.description && (
            <p className="text-sm text-red-600 mt-1">{errors.description}</p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            {formData.description.length}/2000 characters
          </p>
        </div>

        {/* NSFW Content */}
        <div className="flex items-start space-x-2">
          <Checkbox
            id="nsfwContent"
            checked={formData.nsfwContent}
            onCheckedChange={(checked) => handleInputChange("nsfwContent", checked)}
          />
          <div>
            <Label htmlFor="nsfwContent" className="text-sm font-medium">
              NSFW content for adults only
            </Label>
            <p className="text-xs text-muted-foreground">
              Check this if your model contains sensitive content
            </p>
          </div>
        </div>

        {/* License Section */}
        <div>
          <Label className="text-base font-medium">*License & Permissions</Label>
          
          <div className="mt-4 space-y-4">
            {/* Allow adaptations */}
            <div>
              <Label className="text-sm font-medium mb-2 block">
                Allow adaptations of your work to be shared?
              </Label>
              <RadioGroup
                value={formData.allowAdaptations}
                onValueChange={(value) => handleInputChange("allowAdaptations", value)}
                className="flex gap-6"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="adaptations-yes" />
                  <Label htmlFor="adaptations-yes">Yes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="adaptations-no" />
                  <Label htmlFor="adaptations-no">No</Label>
                </div>
              </RadioGroup>
            </div>

            {/* Commercial use */}
            <div>
              <Label className="text-sm font-medium mb-2 block">
                Allow commercial uses of your work?
              </Label>
              <RadioGroup
                value={formData.allowCommercialUse}
                onValueChange={(value) => handleInputChange("allowCommercialUse", value)}
                className="flex gap-6"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="commercial-yes" />
                  <Label htmlFor="commercial-yes">Yes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="commercial-no" />
                  <Label htmlFor="commercial-no">No</Label>
                </div>
              </RadioGroup>
            </div>

            {/* Sharing */}
            <div>
              <Label className="text-sm font-medium mb-2 block">
                Allow sharing or redistributing of your work?
              </Label>
              <RadioGroup
                value={formData.allowSharing}
                onValueChange={(value) => handleInputChange("allowSharing", value)}
                className="flex gap-6"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="sharing-yes" />
                  <Label htmlFor="sharing-yes">Yes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="sharing-no" />
                  <Label htmlFor="sharing-no">No</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        </div>

        {/* Visibility */}
        <div>
          <Label className="text-base font-medium">*Visibility</Label>
          <RadioGroup
            value={formData.visibility}
            onValueChange={(value) => handleInputChange("visibility", value)}
            className="flex gap-6 mt-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="public" id="visibility-public" />
              <Label htmlFor="visibility-public">Public</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="private" id="visibility-private" />
              <Label htmlFor="visibility-private">Private</Label>
            </div>
          </RadioGroup>
        </div>

        {/* Community Post */}
        <div className="flex items-center space-x-2">
          <Checkbox
            id="communityPost"
            checked={formData.communityPost}
            onCheckedChange={(checked) => handleInputChange("communityPost", checked)}
          />
          <Label htmlFor="communityPost" className="text-base font-medium">
            Share in community feed
          </Label>
        </div>
      </CardContent>
    </Card>
  )
}