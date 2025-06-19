// lib/api-client/models-feed.ts
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
    category,
    limit: String(options.limit || 8),
    page: String(options.page || 1)
  })
  
  // Only add search parameter if it's a non-empty string
  if (options.search && options.search.trim().length > 0) {
    params.append('search', options.search.trim())
  }
  
  console.log('🔄 Fetching models feed:', { category, ...options })
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/models/feed?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      next: { revalidate: 300 },
      credentials: 'include'
    })
    
    console.log('📡 API Response status:', response.status)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ API Error Response:', errorText)
      
      // Return empty state for better UX
      return {
        success: true,
        message: 'Belum ada product',
        data: {
          models: [],
          category,
          search: options.search || null,
          pagination: {
            page: 1,
            limit: options.limit || 8,
            total: 0,
            totalPages: 0,
            hasNext: false,
            hasPrev: false
          },
          isEmpty: true,
          isEmptyDatabase: true
        }
      }
    }
    
    const data = await response.json()
    console.log('✅ Models feed fetched:', data.data?.models?.length || 0, 'models')
    console.log('📊 Database status:', data.data?.isEmptyDatabase ? 'Empty' : 'Has data')
    
    return data
  } catch (error) {
    console.error('❌ Failed to fetch models feed:', error)
    
    return {
      success: true,
      message: 'Belum ada product',
      data: {
        models: [],
        category,
        search: options.search || null,
        pagination: {
          page: 1,
          limit: options.limit || 8,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false
        },
        isEmpty: true,
        isEmptyDatabase: true
      }
    }
  }
}

/**
 * Fetch detail model untuk product page
 */
export async function fetchModelDetail(modelId: string) {
  console.log('🔄 Fetching model detail:', modelId)
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/models/${modelId}/detail`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Include cookies for auth
      next: { revalidate: 60 } // Cache for 1 minute
    })
    
    console.log('📡 Model detail response status:', response.status)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Model detail error:', errorText)
      
      if (response.status === 404) {
        throw new Error('Model not found')
      }
      if (response.status === 403) {
        throw new Error('Access denied')
      }
      
      let errorData
      try {
        errorData = JSON.parse(errorText)
      } catch (parseError) {
        errorData = { error: `HTTP ${response.status}: ${response.statusText}` }
      }
      
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
    }
    
    const data = await response.json()
    console.log('✅ Model detail fetched:', data.data?.title)
    
    return data
  } catch (error) {
    console.error('❌ Failed to fetch model detail:', error)
    throw error
  }
}

/**
 * Handle model actions (like, unlike, download)
 */
export async function handleModelAction(
  modelId: string,
  action: 'like' | 'unlike' | 'download',
  metadata?: {
    source?: string
  }
) {
  console.log('🔄 Processing model action:', { modelId, action, metadata })
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/models/${modelId}/actions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Include cookies for auth
      body: JSON.stringify({ 
        action,
        metadata: {
          userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
          timestamp: new Date().toISOString(),
          ...metadata
        }
      })
    })
    
    console.log('📡 Action response status:', response.status)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Action error:', errorText)
      
      let errorData
      try {
        errorData = JSON.parse(errorText)
      } catch (parseError) {
        errorData = { error: `HTTP ${response.status}: ${response.statusText}` }
      }
      
      throw new Error(errorData.error || `HTTP ${response.status}`)
    }
    
    const data = await response.json()
    console.log('✅ Model action completed:', data.data)
    
    return data
  } catch (error) {
    console.error('❌ Failed to process model action:', error)
    throw error
  }
}