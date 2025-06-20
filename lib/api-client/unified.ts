// lib/api-client/unified.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || ''

export async function fetchModelsFeed(
  category: 'recent' | 'popular' | 'trending',
  options: {
    limit?: number
    page?: number
    search?: string
  } = {}
) {
  const params = new URLSearchParams({
    endpoint: 'models-feed',
    category,
    limit: String(options.limit || 8),
    page: String(options.page || 1),
    ...(options.search && { search: options.search })
  })
  
  const response = await fetch(`${API_BASE_URL}/api/v1?${params}`)
  return response.json()
}

export async function fetchModelDetail(modelId: string) {
  const params = new URLSearchParams({
    endpoint: 'model-detail',
    id: modelId
  })
  
  const response = await fetch(`${API_BASE_URL}/api/v1?${params}`)
  return response.json()
}

export async function handleModelAction(
  modelId: string,
  action: 'like' | 'unlike' | 'download',
  metadata?: { source?: string }
) {
  const response = await fetch(`${API_BASE_URL}/api/v1?endpoint=model-action`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ modelId, action, metadata }),
    credentials: 'include'
  })
  
  return response.json()
}