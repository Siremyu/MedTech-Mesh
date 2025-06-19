// lib/utils/file-compression.ts
import sharp from 'sharp'

interface CompressionOptions {
  quality?: number
  maxWidth?: number
  maxHeight?: number
  format?: 'jpeg' | 'png' | 'webp'
}

export class FileCompressor {
  /**
   * Compress image files with specified options
   */
  static async compressImage(
    buffer: Buffer, 
    options: CompressionOptions = {}
  ): Promise<Buffer> {
    const {
      quality = 80,
      maxWidth = 1920,
      maxHeight = 1080,
      format = 'jpeg'
    } = options

    try {
      let sharpInstance = sharp(buffer)
        .resize(maxWidth, maxHeight, {
          fit: 'inside',
          withoutEnlargement: true
        })

      switch (format) {
        case 'jpeg':
          sharpInstance = sharpInstance.jpeg({ quality })
          break
        case 'png':
          sharpInstance = sharpInstance.png({ quality })
          break
        case 'webp':
          sharpInstance = sharpInstance.webp({ quality })
          break
      }

      return await sharpInstance.toBuffer()
    } catch (error) {
      console.error('Image compression failed:', error)
      throw new Error('Failed to compress image')
    }
  }

  /**
   * Get optimal compression settings based on file size
   */
  static getCompressionOptions(fileSize: number): CompressionOptions {
    if (fileSize > 5 * 1024 * 1024) { // > 5MB
      return { quality: 60, maxWidth: 1280, maxHeight: 720 }
    } else if (fileSize > 2 * 1024 * 1024) { // > 2MB
      return { quality: 70, maxWidth: 1600, maxHeight: 900 }
    } else {
      return { quality: 80, maxWidth: 1920, maxHeight: 1080 }
    }
  }

  /**
   * Check if file is an image
   */
  static isImageFile(mimeType: string): boolean {
    return mimeType.startsWith('image/')
  }

  /**
   * Check if file is a 3D model
   */
  static is3DModelFile(mimeType: string, fileName: string): boolean {
    const modelExtensions = ['.stl', '.obj', '.glb', '.gltf', '.3ds', '.blend']
    const fileExtension = fileName.toLowerCase().substring(fileName.lastIndexOf('.'))
    return modelExtensions.includes(fileExtension)
  }
}