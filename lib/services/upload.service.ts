// lib/services/upload.service.ts
import { FileCompressor } from '@/lib/utils/file-compression'
import { BlobStorageService } from '@/lib/services/blob-storage.service'

interface UploadedFileResult {
  originalName: string
  fileName: string
  url: string
  size: number
  compressedSize?: number
  type: 'image' | 'model' | 'document'
  mimeType: string
}

export class UploadService {
  private static readonly MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB
  private static readonly ALLOWED_IMAGE_TYPES = [
    'image/jpeg', 'image/png', 'image/webp', 'image/gif'
  ]
  private static readonly ALLOWED_MODEL_TYPES = [
    'application/octet-stream', // for .stl, .obj files
    'model/gltf+json',
    'model/gltf-binary'
  ]

  /**
   * Process and upload multiple files
   */
  static async uploadFiles(files: File[]): Promise<UploadedFileResult[]> {
    const results: UploadedFileResult[] = []

    for (const file of files) {
      try {
        const result = await this.uploadSingleFile(file)
        results.push(result)
      } catch (error) {
        console.error(`Failed to upload ${file.name}:`, error)
        throw error
      }
    }

    return results
  }

  /**
   * Process and upload a single file
   */
  static async uploadSingleFile(file: File): Promise<UploadedFileResult> {
    // Validate file
    this.validateFile(file)

    // Convert File to Buffer
    const buffer = Buffer.from(await file.arrayBuffer())
    const fileType = this.getFileType(file.type, file.name)
    
    let processedBuffer = buffer
    let compressedSize: number | undefined

    // Compress if it's an image
    if (fileType === 'image') {
      const compressionOptions = FileCompressor.getCompressionOptions(file.size)
      processedBuffer = await FileCompressor.compressImage(buffer, compressionOptions)
      compressedSize = processedBuffer.length
    }

    // Upload to blob storage
    const folder = BlobStorageService.getUploadFolder(fileType)
    const uploadResult = await BlobStorageService.uploadFile(
      file.name,
      processedBuffer,
      {
        folder,
        contentType: file.type,
      }
    )

    return {
      originalName: file.name,
      fileName: uploadResult.pathname.split('/').pop() || file.name,
      url: uploadResult.url,
      size: file.size,
      compressedSize,
      type: fileType,
      mimeType: file.type
    }
  }

  /**
   * Validate file before upload
   */
  private static validateFile(file: File): void {
    // Check file size
    if (file.size > this.MAX_FILE_SIZE) {
      throw new Error(`File ${file.name} exceeds maximum size limit of 50MB`)
    }

    // Check file type
    const fileType = this.getFileType(file.type, file.name)
    if (!this.isAllowedFileType(file.type, file.name)) {
      throw new Error(`File type ${file.type} is not allowed`)
    }

    // Additional validations
    if (file.size === 0) {
      throw new Error(`File ${file.name} is empty`)
    }
  }

  /**
   * Determine file type based on MIME type and extension
   */
  private static getFileType(mimeType: string, fileName: string): 'image' | 'model' | 'document' {
    if (FileCompressor.isImageFile(mimeType)) {
      return 'image'
    }
    
    if (FileCompressor.is3DModelFile(mimeType, fileName)) {
      return 'model'
    }
    
    return 'document'
  }

  /**
   * Check if file type is allowed
   */
  private static isAllowedFileType(mimeType: string, fileName: string): boolean {
    // Check image types
    if (this.ALLOWED_IMAGE_TYPES.includes(mimeType)) {
      return true
    }

    // Check model types
    if (this.ALLOWED_MODEL_TYPES.includes(mimeType)) {
      return true
    }

    // Check by file extension for models
    if (FileCompressor.is3DModelFile(mimeType, fileName)) {
      return true
    }

    return false
  }
}