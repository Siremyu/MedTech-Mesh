import { v2 as cloudinary } from 'cloudinary'

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
})

interface CloudinaryUploadResult {
  url: string
  secureUrl: string
  publicId: string
  format: string
  resourceType: string
  bytes: number
  width?: number
  height?: number
  createdAt: string
}

/**
 * Cloudinary Service - /lib/services/cloudinary.service.ts
 */
export class CloudinaryService {
  private static readonly DEFAULT_FOLDER = 'medtech-mesh'
  
  /**
   * Upload file to Cloudinary
   */
  static async uploadFile(
    fileBuffer: Buffer,
    fileName: string,
    options: {
      folder?: string
      resourceType?: 'image' | 'video' | 'raw' | 'auto'
      transformation?: any[]
      tags?: string[]
      public_id?: string
      overwrite?: boolean
    } = {}
  ): Promise<CloudinaryUploadResult> {
    try {
      console.log('📤 Cloudinary upload starting:', fileName)
      
      const {
        folder = this.DEFAULT_FOLDER,
        resourceType = 'auto',
        transformation = [],
        tags = [],
        public_id,
        overwrite = false
      } = options

      // Convert buffer to base64 data URI
      const dataUri = `data:application/octet-stream;base64,${fileBuffer.toString('base64')}`
      
      // Upload to Cloudinary
      const result = await cloudinary.uploader.upload(dataUri, {
        folder,
        resource_type: resourceType,
        transformation,
        tags: ['medtech-mesh', ...tags],
        public_id,
        overwrite,
        unique_filename: !public_id,
        use_filename: !!public_id,
        filename_override: fileName
      })

      console.log('✅ Cloudinary upload successful:', result.public_id)

      return {
        url: result.url,
        secureUrl: result.secure_url,
        publicId: result.public_id,
        format: result.format,
        resourceType: result.resource_type,
        bytes: result.bytes,
        width: result.width,
        height: result.height,
        createdAt: result.created_at
      }

    } catch (error: any) {
      console.error('❌ Cloudinary upload failed:', error)
      throw new Error(`Cloudinary upload failed: ${error.message}`)
    }
  }

  /**
   * Upload image with optimizations
   */
  static async uploadImage(
    fileBuffer: Buffer,
    fileName: string,
    options: any = {}
  ): Promise<CloudinaryUploadResult> {
    const imageTransformations = [
      { quality: 'auto' },
      { fetch_format: 'auto' },
      { flags: 'progressive' }
    ]

    return this.uploadFile(fileBuffer, fileName, {
      ...options,
      resourceType: 'image',
      transformation: [...imageTransformations, ...(options.transformation || [])],
      folder: options.folder || `${this.DEFAULT_FOLDER}/images`
    })
  }

  /**
   * Upload 3D model file
   */
  static async uploadModel(
    fileBuffer: Buffer,
    fileName: string,
    options: any = {}
  ): Promise<CloudinaryUploadResult> {
    return this.uploadFile(fileBuffer, fileName, {
      ...options,
      resourceType: 'raw',
      folder: options.folder || `${this.DEFAULT_FOLDER}/models`,
      tags: ['3d-model', ...(options.tags || [])]
    })
  }

  /**
   * Upload avatar with specific optimizations
   */
  static async uploadAvatar(
    fileBuffer: Buffer,
    userId: string,
    fileName: string
  ): Promise<CloudinaryUploadResult> {
    const avatarTransformations = [
      { width: 400, height: 400, crop: 'fill', gravity: 'face' },
      { quality: 'auto' },
      { fetch_format: 'auto' }
    ]

    return this.uploadImage(fileBuffer, fileName, {
      folder: `${this.DEFAULT_FOLDER}/avatars`,
      public_id: `avatar_${userId}`,
      overwrite: true,
      transformation: avatarTransformations,
      tags: ['avatar', userId]
    })
  }

  /**
   * Upload cover image with optimizations
   */
  static async uploadCoverImage(
    fileBuffer: Buffer,
    fileName: string,
    modelId?: string
  ): Promise<CloudinaryUploadResult> {
    const coverTransformations = [
      { width: 1200, height: 800, crop: 'fill' },
      { quality: 'auto' },
      { fetch_format: 'auto' }
    ]

    return this.uploadImage(fileBuffer, fileName, {
      folder: `${this.DEFAULT_FOLDER}/covers`,
      public_id: modelId ? `cover_${modelId}` : undefined,
      transformation: coverTransformations,
      tags: ['cover', ...(modelId ? [modelId] : [])]
    })
  }

  /**
   * Delete file from Cloudinary
   */
  static async deleteFile(publicId: string, resourceType: 'image' | 'video' | 'raw' = 'image'): Promise<void> {
    try {
      console.log('🗑️ Deleting from Cloudinary:', publicId)
      
      await cloudinary.uploader.destroy(publicId, {
        resource_type: resourceType
      })
      
      console.log('✅ Cloudinary deletion successful:', publicId)
    } catch (error: any) {
      console.error('❌ Cloudinary deletion failed:', error)
      throw new Error(`Failed to delete file: ${error.message}`)
    }
  }

  /**
   * Get optimized image URL with transformations
   */
  static getOptimizedImageUrl(
    publicId: string,
    transformations: any[] = []
  ): string {
    const defaultTransformations = [
      { quality: 'auto' },
      { fetch_format: 'auto' }
    ]

    return cloudinary.url(publicId, {
      transformation: [...defaultTransformations, ...transformations],
      secure: true
    })
  }

  /**
   * Generate thumbnail URL
   */
  static getThumbnailUrl(
    publicId: string,
    width: number = 300,
    height: number = 300
  ): string {
    return this.getOptimizedImageUrl(publicId, [
      { width, height, crop: 'fill' }
    ])
  }

  /**
   * Extract public ID from Cloudinary URL
   */
  static extractPublicId(cloudinaryUrl: string): string {
    try {
      // Extract public ID from Cloudinary URL
      const urlParts = cloudinaryUrl.split('/')
      const filename = urlParts[urlParts.length - 1]
      const publicId = filename.split('.')[0]
      
      // Include folder path if present
      const uploadIndex = urlParts.findIndex(part => part === 'upload')
      if (uploadIndex !== -1 && uploadIndex < urlParts.length - 2) {
        const folderParts = urlParts.slice(uploadIndex + 2, -1)
        return folderParts.length > 0 ? `${folderParts.join('/')}/${publicId}` : publicId
      }
      
      return publicId
    } catch (error) {
      console.error('❌ Failed to extract public ID:', error)
      return cloudinaryUrl
    }
  }
}