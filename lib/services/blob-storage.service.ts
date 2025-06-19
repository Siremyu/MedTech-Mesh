// lib/services/blob-storage.service.ts
import { put, del, list } from '@vercel/blob'

interface UploadOptions {
  folder?: string
  contentType?: string
  cacheMaxAge?: number
}

export class BlobStorageService {
  private static readonly DEFAULT_CACHE_AGE = 31536000 // 1 year

  /**
   * Upload file to Vercel Blob storage
   */
  static async uploadFile(
    fileName: string,
    fileBuffer: Buffer,
    options: UploadOptions = {}
  ): Promise<{ url: string; pathname: string }> {
    try {
      const {
        folder = 'uploads',
        contentType = 'application/octet-stream',
        cacheMaxAge = this.DEFAULT_CACHE_AGE
      } = options

      // Generate unique filename with timestamp
      const timestamp = Date.now()
      const cleanFileName = this.sanitizeFileName(fileName)
      const uniqueFileName = `${timestamp}-${cleanFileName}`
      const filePath = `${folder}/${uniqueFileName}`

      const blob = await put(filePath, fileBuffer, {
        access: 'public',
        contentType,
        cacheControlMaxAge: cacheMaxAge,
      })

      return {
        url: blob.url,
        pathname: blob.pathname
      }
    } catch (error) {
      console.error('Blob upload failed:', error)
      throw new Error(`Failed to upload file: ${fileName}`)
    }
  }

  /**
   * Delete file from Vercel Blob storage
   */
  static async deleteFile(url: string): Promise<void> {
    try {
      await del(url)
    } catch (error) {
      console.error('Blob deletion failed:', error)
      throw new Error('Failed to delete file')
    }
  }

  /**
   * List files in a folder
   */
  static async listFiles(prefix?: string) {
    try {
      return await list({ prefix })
    } catch (error) {
      console.error('Blob listing failed:', error)
      throw new Error('Failed to list files')
    }
  }

  /**
   * Sanitize filename for safe storage
   */
  private static sanitizeFileName(fileName: string): string {
    return fileName
      .replace(/[^a-zA-Z0-9.-]/g, '_')
      .replace(/_+/g, '_')
      .toLowerCase()
  }

  /**
   * Get appropriate folder based on file type
   */
  static getUploadFolder(fileType: 'image' | 'model' | 'document'): string {
    const folders = {
      image: 'images',
      model: 'models',
      document: 'documents'
    }
    return folders[fileType] || 'uploads'
  }
}