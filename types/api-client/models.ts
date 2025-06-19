// lib/api-client/models.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || ''

/**
 * Fetch models untuk home page
 */
export async function fetchHomeModels(
  category: 'recent' | 'popular' | 'other',
  options: {
    limit?: number
    page?: number
    search?: string
  } = {}
) {
  const params = new URLSearchParams({
    category,
    limit: String(options.limit || 8),
    page: String(options.page || 1),
    ...(options.search && { search: options.search })
  })
  
  const response = await fetch(`${API_BASE_URL}/api/models?${params}`)
  
  if (!response.ok) {
    throw new Error('Failed to fetch models')
  }
  
  return response.json()
}

/**
 * Fetch single model untuk product page
 */
export async function fetchModelById(modelId: string) {
  const response = await fetch(`${API_BASE_URL}/api/models/${modelId}`)
  
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Model not found')
    }
    throw new Error('Failed to fetch model')
  }
  
  return response.json()
}

/**
 * Handle model actions
 */
export async function handleModelAction(
  modelId: string,
  action: 'like' | 'unlike' | 'download'
) {
  const response = await fetch(`${API_BASE_URL}/api/models/${modelId}/actions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ 
      action,
      metadata: {
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString()
      }
    }),
    credentials: 'include'
  })
  
  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error || 'Action failed')
  }
  
  return response.json()
}