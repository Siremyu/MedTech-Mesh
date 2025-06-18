"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Button } from "@/components/ui/button"

interface ModelInformationSectionProps {
  onDataChange: (data: any) => void
}

export function ModelInformationSection({ onDataChange }: ModelInformationSectionProps) {
  const [formData, setFormData] = React.useState({
    modelName: "",
    category: "",
    tags: "",
    nsfwContent: false,
    allowAdaptations: "",
    allowCommercialUse: "",
    allowSharing: "",
    visibility: "public",
    description: "",
    communityPost: false
  })

  const handleInputChange = (field: string, value: any) => {
    const updatedData = { ...formData, [field]: value }
    setFormData(updatedData)
    onDataChange(updatedData)
  }

  return (
    <Card className="mb-6 shadow-none">
      <CardHeader>
        <CardTitle>Model Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Model Name */}
        <div>
          <Label htmlFor="modelName" className="text-base font-medium">
            *Model Name
          </Label>
          <Input
            id="modelName"
            value={formData.modelName}
            onChange={(e) => handleInputChange("modelName", e.target.value)}
            className="mt-2"
          />
        </div>

        {/* Category */}
        <div>
          <Label htmlFor="category" className="text-base font-medium">
            *Category
          </Label>
          <Input
            id="category"
            placeholder="Quick search by entering category keywords"
            value={formData.category}
            onChange={(e) => handleInputChange("category", e.target.value)}
            className="mt-2"
          />
        </div>

        {/* Tags */}
        <div>
          <Label htmlFor="tags" className="text-base font-medium">
            Tags(0/50)
          </Label>
          <Input
            id="tags"
            placeholder="Press 'Enter' to separate tags. Choose similar tags from the dropdown to boost discoverability"
            value={formData.tags}
            onChange={(e) => handleInputChange("tags", e.target.value)}
            className="mt-2"
          />
        </div>

        {/* NSFW Content */}
        <div className="flex items-center space-x-2">
          <Checkbox
            id="nsfwContent"
            checked={formData.nsfwContent}
            onCheckedChange={(checked) => handleInputChange("nsfwContent", checked)}
          />
          <Label htmlFor="nsfwContent" className="text-sm">
            <strong>NSFW content for adults only</strong>
            <br />
            <span className="text-muted-foreground">
              This model includes nudity, violence, profanity or other potentially disturbing subject matter.
            </span>
          </Label>
        </div>

        {/* License */}
        <div>
          <Label className="text-base font-medium">*License</Label>
          
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
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes-same-way" id="adaptations-same" />
                  <Label htmlFor="adaptations-same">Yes, as long as others share in the same way</Label>
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

            {/* Sharing or redistributing */}
            <div>
              <Label className="text-sm font-medium mb-2 block">
                Allow sharing or redistributing of your work or its derivatives?
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

        {/* Description */}
        <div>
          <Label htmlFor="description" className="text-base font-medium">
            *Description
          </Label>
          <p className="text-sm text-muted-foreground mt-1 mb-2">
            If you want to add a generic header or footer to all of your model's descriptions, you can configure it in Creator center &gt; Customization
          </p>
          <Textarea
            id="description"
            placeholder="Tell others about your model"
            value={formData.description}
            onChange={(e) => handleInputChange("description", e.target.value)}
            rows={4}
            className="mt-2"
          />
        </div>

        {/* Community Post */}
        <div className="flex items-center space-x-2">
          <Checkbox
            id="communityPost"
            checked={formData.communityPost}
            onCheckedChange={(checked) => handleInputChange("communityPost", checked)}
          />
          <Label htmlFor="communityPost" className="text-base font-medium">
            Community Post
          </Label>
        </div>

        {/* Documentation */}
        <div>
          <Label className="text-base font-medium mb-3 block">Documentation</Label>
          <Button variant="outline" className="text-primary border-primary">
            + Add Documentation
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}