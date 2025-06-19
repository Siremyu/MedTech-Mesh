// lib/errors/profile.errors.ts
export class ProfileError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 400
  ) {
    super(message)
    this.name = 'ProfileError'
  }
}

export class ProfileNotFoundError extends ProfileError {
  constructor(userId: string) {
    super(`Profile not found for user: ${userId}`, 'PROFILE_NOT_FOUND', 404)
  }
}

export class ProfileValidationError extends ProfileError {
  constructor(message: string, public details?: any[]) {
    super(message, 'PROFILE_VALIDATION_ERROR', 400)
  }
}

export class ProfilePermissionError extends ProfileError {
  constructor(message: string = 'Insufficient permissions to access this profile') {
    super(message, 'PROFILE_PERMISSION_ERROR', 403)
  }
}

export class ProfileUploadError extends ProfileError {
  constructor(message: string = 'Failed to upload file') {
    super(message, 'PROFILE_UPLOAD_ERROR', 400)
  }
}