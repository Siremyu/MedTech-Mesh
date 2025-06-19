import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface Model {
  id: string
  title: string
  author: string
  downloads: number
  likes: number
  category: string
  imageUrl?: string
}

interface ModelsState {
  models: Model[]
  searchQuery: string
  searchResults: Model[]
  isSearching: boolean
  searchLoading: boolean
  searchHasMore: boolean
  searchPage: number
  categories: string[]
  selectedCategory: string | null
  loading: boolean
  error: string | null
  
  // Home page model sections
  recentModels: Model[]
  popularModels: Model[]
  otherModels: Model[]
  otherModelsLoading: boolean
  otherModelsHasMore: boolean
  otherModelsPage: number
  
  // Current model for product page
  currentModel: any
}

const initialState: ModelsState = {
  models: [],
  searchQuery: '',
  searchResults: [],
  isSearching: false,
  searchLoading: false,
  searchHasMore: true,
  searchPage: 1,
  categories: ['All', 'Cardiology', 'Neurology', 'Orthopedics', 'General', 'Surgery'],
  selectedCategory: null,
  loading: false,
  error: null,
  
  // Home page sections
  recentModels: [],
  popularModels: [],
  otherModels: [],
  otherModelsLoading: false,
  otherModelsHasMore: true,
  otherModelsPage: 1,
  
  // Current model
  currentModel: null,
}

const modelsSlice = createSlice({
  name: 'models',
  initialState,
  reducers: {
    setModels: (state, action: PayloadAction<Model[]>) => {
      state.models = action.payload
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload
    },
    setSearchResults: (state, action: PayloadAction<Model[]>) => {
      state.searchResults = action.payload
    },
    addSearchResults: (state, action: PayloadAction<Model[]>) => {
      state.searchResults = [...state.searchResults, ...action.payload]
      state.searchPage += 1
      // Stop loading more if we got less than 8 results
      if (action.payload.length < 8) {
        state.searchHasMore = false
      }
    },
    setIsSearching: (state, action: PayloadAction<boolean>) => {
      state.isSearching = action.payload
    },
    setSearchLoading: (state, action: PayloadAction<boolean>) => {
      state.searchLoading = action.payload
    },
    setSearchHasMore: (state, action: PayloadAction<boolean>) => {
      state.searchHasMore = action.payload
    },
    setSelectedCategory: (state, action: PayloadAction<string | null>) => {
      state.selectedCategory = action.payload
    },
    clearSearch: (state) => {
      state.searchQuery = ''
      state.searchResults = []
      state.isSearching = false
      state.searchLoading = false
      state.searchHasMore = true
      state.searchPage = 1
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
    
    // Home page model sections
    setRecentModels: (state, action: PayloadAction<Model[]>) => {
      state.recentModels = action.payload
    },
    setPopularModels: (state, action: PayloadAction<Model[]>) => {
      state.popularModels = action.payload
    },
    setOtherModels: (state, action: PayloadAction<Model[]>) => {
      state.otherModels = action.payload
    },
    addOtherModels: (state, action: PayloadAction<Model[]>) => {
      state.otherModels = [...state.otherModels, ...action.payload]
      state.otherModelsPage += 1
      // Stop loading more if we got less than 8 results
      if (action.payload.length < 8) {
        state.otherModelsHasMore = false
      }
    },
    setOtherModelsLoading: (state, action: PayloadAction<boolean>) => {
      state.otherModelsLoading = action.payload
    },
    setOtherModelsHasMore: (state, action: PayloadAction<boolean>) => {
      state.otherModelsHasMore = action.payload
    },
    
    // Current model for product page
    setCurrentModel: (state, action: PayloadAction<any>) => {
      state.currentModel = action.payload
    },
    
    // Update model interactions
    updateModelLikes: (state, action: PayloadAction<{ id: string; likes: number }>) => {
      const { id, likes } = action.payload
      
      // Update in all relevant arrays
      const updateLikes = (models: Model[]) => {
        const model = models.find(m => m.id === id)
        if (model) model.likes = likes
      }
      
      updateLikes(state.models)
      updateLikes(state.searchResults)
      updateLikes(state.recentModels)
      updateLikes(state.popularModels)
      updateLikes(state.otherModels)
    },
    
    updateModelDownloads: (state, action: PayloadAction<{ id: string; downloads: number }>) => {
      const { id, downloads } = action.payload
      
      // Update in all relevant arrays
      const updateDownloads = (models: Model[]) => {
        const model = models.find(m => m.id === id)
        if (model) model.downloads = downloads
      }
      
      updateDownloads(state.models)
      updateDownloads(state.searchResults)
      updateDownloads(state.recentModels)
      updateDownloads(state.popularModels)
      updateDownloads(state.otherModels)
    },
  },
})

export const {
  setModels,
  setSearchQuery,
  setSearchResults,
  addSearchResults,
  setIsSearching,
  setSearchLoading,
  setSearchHasMore,
  setSelectedCategory,
  clearSearch,
  setLoading,
  setError,
  setRecentModels,
  setPopularModels,
  setOtherModels,
  addOtherModels,
  setOtherModelsLoading,
  setOtherModelsHasMore,
  setCurrentModel,
  updateModelLikes,
  updateModelDownloads,
} = modelsSlice.actions

export default modelsSlice.reducer