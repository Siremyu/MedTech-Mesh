"use client"

import * as React from "react"
import { useSelector } from 'react-redux'
import { RootState } from '@/lib/store'
import { Upload, File, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface UploadedFile {
  id: string
  name: string
  size: number
  type: string
}

interface EditFileUploadAreaProps {
  onFilesChange: (files: UploadedFile[]) => void
}

export function EditFileUploadArea({ onFilesChange }: EditFileUploadAreaProps) {
  const { files: reduxFiles } = useSelector((state: RootState) => state.edit)
  const [uploadedFiles, setUploadedFiles] = React.useState<UploadedFile[]>(reduxFiles)
  const [isDragOver, setIsDragOver] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    setUploadedFiles(reduxFiles)
  }, [reduxFiles])

  const handleFileSelect = (files: FileList) => {
    const newFiles: UploadedFile[] = Array.from(files).map((file, index) => ({
      id: `${Date.now()}-${index}`,
      name: file.name,
      size: file.size,
      type: file.type
    }))

    const updatedFiles = [...uploadedFiles, ...newFiles]
    setUploadedFiles(updatedFiles)
    onFilesChange(updatedFiles)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileSelect(files)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleBrowseClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileSelect(files)
    }
  }

  const removeFile = (fileId: string) => {
    const updatedFiles = uploadedFiles.filter(file => file.id !== fileId)
    setUploadedFiles(updatedFiles)
    onFilesChange(updatedFiles)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <Card className="mb-6 shadow-none">
      <CardContent className="p-6">
        {/* Upload Area */}
        <div
          className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
            isDragOver 
              ? 'border-primary bg-primary/5' 
              : 'border-muted-foreground/25 hover:border-muted-foreground/50'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2">Drag your files here</h3>
          <p className="text-muted-foreground mb-6">
            Supported 3D formats: blend, 3ds, obj, stl, zip, skp
          </p>
          
          <Button 
            variant="outline" 
            onClick={handleBrowseClick}
            className="text-primary border-primary hover:bg-primary hover:text-primary-foreground"
          >
            Browse
          </Button>
          
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".blend,.3ds,.obj,.stl,.zip,.skp"
            onChange={handleFileInputChange}
            className="hidden"
          />
        </div>

        {/* Uploaded Files List */}
        {uploadedFiles.length > 0 && (
          <div className="mt-6 space-y-3">
            {uploadedFiles.map((file) => (
              <div key={file.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-muted rounded flex items-center justify-center">
                    <File className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium">{file.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {file.name.split('.').pop()?.toUpperCase()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium">{formatFileSize(file.size)}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFile(file.id)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}