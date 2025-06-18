import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface Model {
  id: string
  title: string
  author: string
  downloads: number
  likes: number
  imageUrl?: string
  category?: string
  tags?: string[]
  visibility?: 'public' | 'private'
}

interface ModelsState {
  recentModels: Model[]
  popularModels: Model[]
  otherModels: Model[]
  otherModelsPage: number
  otherModelsLoading: boolean
  otherModelsHasMore: boolean
  searchResults: Model[]
  searchPage: number
  searchLoading: boolean
  searchHasMore: boolean
  currentModel: Model | null
  loading: boolean
  error: string | null
  searchQuery: string
  isSearching: boolean // New state to track if we're in search mode
}

const initialState: ModelsState = {
  recentModels: [],
  popularModels: [],
  otherModels: [],
  otherModelsPage: 0,
  otherModelsLoading: false,
  otherModelsHasMore: true,
  searchResults: [],
  searchPage: 0,
  searchLoading: false,
  searchHasMore: true,
  currentModel: null,
  loading: false,
  error: null,
  searchQuery: '',
  isSearching: false,
}

const modelsSlice = createSlice({
  name: 'models',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    setRecentModels: (state, action: PayloadAction<Model[]>) => {
      state.recentModels = action.payload
    },
    setPopularModels: (state, action: PayloadAction<Model[]>) => {
      state.popularModels = action.payload
    },
    setOtherModels: (state, action: PayloadAction<Model[]>) => {
      state.otherModels = action.payload
      state.otherModelsPage = 1
      state.otherModelsHasMore = true
    },
    addOtherModels: (state, action: PayloadAction<Model[]>) => {
      state.otherModels = [...state.otherModels, ...action.payload]
      state.otherModelsPage += 1
      
      if (state.otherModelsPage >= 5) {
        state.otherModelsHasMore = false
      }
    },
    setOtherModelsLoading: (state, action: PayloadAction<boolean>) => {
      state.otherModelsLoading = action.payload
    },
    setOtherModelsHasMore: (state, action: PayloadAction<boolean>) => {
      state.otherModelsHasMore = action.payload
    },
    // Search related actions
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload
    },
    setIsSearching: (state, action: PayloadAction<boolean>) => {
      state.isSearching = action.payload
    },
    setSearchResults: (state, action: PayloadAction<Model[]>) => {
      state.searchResults = action.payload
      state.searchPage = 1
      state.searchHasMore = true
    },
    addSearchResults: (state, action: PayloadAction<Model[]>) => {
      state.searchResults = [...state.searchResults, ...action.payload]
      state.searchPage += 1
      
      // Simulate end of search results after 5 pages
      if (state.searchPage >= 5) {
        state.searchHasMore = false
      }
    },
    setSearchLoading: (state, action: PayloadAction<boolean>) => {
      state.searchLoading = action.payload
    },
    setSearchHasMore: (state, action: PayloadAction<boolean>) => {
      state.searchHasMore = action.payload
    },
    clearSearch: (state) => {
      state.searchResults = []
      state.searchQuery = ''
      state.searchPage = 0
      state.searchLoading = false
      state.searchHasMore = true
      state.isSearching = false
    },
    setCurrentModel: (state, action: PayloadAction<Model>) => {
      state.currentModel = action.payload
    },
    updateModelLikes: (state, action: PayloadAction<{ id: string; likes: number }>) => {
      const updateModel = (models: Model[]) => {
        return models.map(model =>
          model.id === action.payload.id
            ? { ...model, likes: action.payload.likes }
            : model
        )
      }
      
      state.recentModels = updateModel(state.recentModels)
      state.popularModels = updateModel(state.popularModels)
      state.otherModels = updateModel(state.otherModels)
      state.searchResults = updateModel(state.searchResults)
    },
    updateModelDownloads: (state, action: PayloadAction<{ id: string; downloads: number }>) => {
      const updateModel = (models: Model[]) => {
        return models.map(model =>
          model.id === action.payload.id
            ? { ...model, downloads: action.payload.downloads }
            : model
        )
      }
      
      state.recentModels = updateModel(state.recentModels)
      state.popularModels = updateModel(state.popularModels)
      state.otherModels = updateModel(state.otherModels)
      state.searchResults = updateModel(state.searchResults)
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
    resetOtherModels: (state) => {
      state.otherModels = []
      state.otherModelsPage = 0
      state.otherModelsLoading = false
      state.otherModelsHasMore = true
    },
  },
})

export const {
  setLoading,
  setRecentModels,
  setPopularModels,
  setOtherModels,
  addOtherModels,
  setOtherModelsLoading,
  setOtherModelsHasMore,
  setSearchQuery,
  setIsSearching,
  setSearchResults,
  addSearchResults,
  setSearchLoading,
  setSearchHasMore,
  clearSearch,
  setCurrentModel,
  updateModelLikes,
  updateModelDownloads,
  setError,
  resetOtherModels,
} = modelsSlice.actions

export default modelsSlice.reducer