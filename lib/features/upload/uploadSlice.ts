import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface UploadFile {
  id: string
  fileName: string
  fileSize: number
  fileType: string
  status: 'pending' | 'uploading' | 'completed' | 'error'
  progress: number
  url?: string
}

interface UploadState {
  files: UploadFile[]
  isUploading: boolean
  uploadProgress: number
  error: string | null
  loading: boolean // Add loading state for form initialization
}

const initialState: UploadState = {
  files: [],
  isUploading: false,
  uploadProgress: 0,
  error: null,
  loading: false
}

const uploadSlice = createSlice({
  name: 'upload',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    addFile: (state, action: PayloadAction<UploadFile>) => {
      // Check for duplicates
      const exists = state.files.some(file => 
        file.fileName === action.payload.fileName && 
        file.fileSize === action.payload.fileSize
      )
      if (!exists) {
        state.files.push(action.payload)
      }
    },
    removeFile: (state, action: PayloadAction<string>) => {
      state.files = state.files.filter(file => file.id !== action.payload)
    },
    updateFileStatus: (state, action: PayloadAction<{ id: string; status: UploadFile['status'] }>) => {
      const file = state.files.find(f => f.id === action.payload.id)
      if (file) {
        file.status = action.payload.status
      }
    },
    updateFileProgress: (state, action: PayloadAction<{ id: string; progress: number }>) => {
      const file = state.files.find(f => f.id === action.payload.id)
      if (file) {
        file.progress = action.payload.progress
      }
    },
    setFileUrl: (state, action: PayloadAction<{ id: string; url: string }>) => {
      const file = state.files.find(f => f.id === action.payload.id)
      if (file) {
        file.url = action.payload.url
      }
    },
    setIsUploading: (state, action: PayloadAction<boolean>) => {
      state.isUploading = action.payload
    },
    setUploadProgress: (state, action: PayloadAction<number>) => {
      state.uploadProgress = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
    clearFiles: (state) => {
      state.files = []
    },
    resetUpload: (state) => {
      state.files = []
      state.isUploading = false
      state.uploadProgress = 0
      state.error = null
      state.loading = false
    },
  },
})

export const {
  setLoading, // Export setLoading
  addFile,
  removeFile,
  updateFileStatus,
  updateFileProgress,
  setFileUrl,
  setIsUploading,
  setUploadProgress,
  setError,
  clearFiles,
  resetUpload,
} = uploadSlice.actions

export default uploadSlice.reducer