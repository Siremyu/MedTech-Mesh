// lib/services/file-upload.service.ts
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { v4 as uuidv4 } from 'uuid'

export class FileUploadService {
  /**
   * Upload avatar file to storage
   */
  static async uploadAvatar(file: File, userId: string): Promise<string> {
    try {
      // Generate unique filename
      const fileExtension = file.name.split('.').pop()
      const fileName = `${userId}-${uuidv4()}.${fileExtension}`
      
      // Create upload directory if it doesn't exist
      const uploadDir = join(process.cwd(), 'public', 'uploads', 'avatars')
      await mkdir(uploadDir, { recursive: true })
      
      // Convert file to buffer and save
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      
      const filePath = join(uploadDir, fileName)
      await writeFile(filePath, buffer)
      
      // Return public URL
      return `/uploads/avatars/${fileName}`
    } catch (error) {
      console.error('Upload avatar error:', error)
      throw new Error('Failed to upload avatar')
    }
  }

  /**
   * Upload cover image file to storage
   */
  static async uploadCoverImage(file: File, userId: string): Promise<string> {
    try {
      const fileExtension = file.name.split('.').pop()
      const fileName = `cover-${userId}-${uuidv4()}.${fileExtension}`
      
      const uploadDir = join(process.cwd(), 'public', 'uploads', 'covers')
      await mkdir(uploadDir, { recursive: true })
      
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      
      const filePath = join(uploadDir, fileName)
      await writeFile(filePath, buffer)
      
      return `/uploads/covers/${fileName}`
    } catch (error) {
      console.error('Upload cover image error:', error)
      throw new Error('Failed to upload cover image')
    }
  }
}