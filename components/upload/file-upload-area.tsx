"use client"

import * as React from "react"
import { Upload, File, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface UploadedFile {
  id: string
  name: string
  size: number
  type: string
  file: File // Add actual File object
}

interface FileUploadAreaProps {
  onFilesChange: (files: File[]) => void
}

export function FileUploadArea({ onFilesChange }: FileUploadAreaProps) {
  const [uploadedFiles, setUploadedFiles] = React.useState<UploadedFile[]>([])
  const [dragActive, setDragActive] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  // Handle file input change
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(Array.from(e.target.files))
    }
  }

  // Handle drag events
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  // Handle drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(Array.from(e.dataTransfer.files))
    }
  }

  // Process files
  const handleFiles = (files: File[]) => {
    console.log('📁 FileUploadArea - Processing files:', files.length)
    
    const validFiles: File[] = []
    const allowedTypes = [
      // 3D Model formats
      'application/octet-stream', // .stl, .obj
      'model/gltf+json', // .gltf
      'model/gltf-binary', // .glb
      'application/x-blender', // .blend
      'application/zip', // .zip
      
      // Image formats
      'image/jpeg',
      'image/png', 
      'image/webp',
      'image/gif'
    ]
    
    const allowedExtensions = [
      '.stl', '.obj', '.glb', '.gltf', '.blend', '.3ds', '.zip', '.skp',
      '.jpg', '.jpeg', '.png', '.webp', '.gif'
    ]

    files.forEach(file => {
      const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'))
      const isValidType = allowedTypes.includes(file.type) || allowedExtensions.includes(fileExtension)
      
      if (isValidType) {
        if (file.size <= 50 * 1024 * 1024) { // 50MB limit
          validFiles.push(file)
        } else {
          console.warn(`File ${file.name} exceeds 50MB limit`)
        }
      } else {
        console.warn(`File ${file.name} has unsupported format`)
      }
    })

    if (validFiles.length > 0) {
      const newUploadedFiles: UploadedFile[] = validFiles.map(file => ({
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: file.name,
        size: file.size,
        type: file.type,
        file: file
      }))

      setUploadedFiles(prev => [...prev, ...newUploadedFiles])
      
      // Extract actual File objects and notify parent
      const allFiles = [...uploadedFiles.map(f => f.file), ...validFiles]
      onFilesChange(allFiles)
      
      console.log('✅ Files processed successfully:', validFiles.length)
    }
  }

  // Remove file
  const removeFile = (fileId: string) => {
    const updatedFiles = uploadedFiles.filter(file => file.id !== fileId)
    setUploadedFiles(updatedFiles)
    
    // Update parent with remaining files
    const remainingFiles = updatedFiles.map(f => f.file)
    onFilesChange(remainingFiles)
    
    console.log('🗑️ File removed, remaining:', remainingFiles.length)
  }

  // Browse button click
  const handleBrowseClick = () => {
    fileInputRef.current?.click()
  }

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <Card className="mb-6 shadow-none">
      <CardContent className="p-6">
        <h2 className="text-xl font-semibold mb-4">Upload Files</h2>
        
        {/* Drag & Drop Area */}
        <div
          className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
            dragActive 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-muted-foreground/25 hover:border-muted-foreground/50'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={handleBrowseClick}
        >
          <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2">
            {dragActive ? 'Drop your files here' : 'Drag your files here'}
          </h3>
          <p className="text-muted-foreground mb-6">
            Supported formats: STL, OBJ, GLB, GLTF, BLEND, 3DS, ZIP, JPG, PNG, WEBP
          </p>
          <p className="text-sm text-muted-foreground mb-6">
            Maximum file size: 50MB per file
          </p>
          
          <Button 
            variant="outline" 
            onClick={handleBrowseClick}
            className="text-primary border-primary hover:bg-primary hover:text-primary-foreground"
            type="button"
          >
            Browse Files
          </Button>
          
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".stl,.obj,.glb,.gltf,.blend,.3ds,.zip,.skp,.jpg,.jpeg,.png,.webp,.gif"
            onChange={handleFileInputChange}
            className="hidden"
          />
        </div>

        {/* Uploaded Files List */}
        {uploadedFiles.length > 0 && (
          <div className="mt-6 space-y-3">
            <h4 className="font-medium">Uploaded Files ({uploadedFiles.length})</h4>
            {uploadedFiles.map((file) => (
              <div key={file.id} className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-muted rounded flex items-center justify-center">
                    <File className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium">{file.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {file.name.split('.').pop()?.toUpperCase()} • {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation()
                    removeFile(file.id)
                  }}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  type="button"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}