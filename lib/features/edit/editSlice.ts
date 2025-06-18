// lib/features/edit/editSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface UploadedFile {
  id: string
  name: string
  size: number
  type: string
  progress?: number
}

interface ModelInformation {
  title: string
  description: string
  category: string
  tags: string
  visibility: 'public' | 'private'
  nsfwContent: boolean
  allowAdaptations: string
  allowCommercialUse: string
  allowSharing: string
  communityPost: boolean
}

interface EditState {
  files: UploadedFile[]
  coverImage: File | null
  modelPictures: File[]
  modelFile: File | null
  modelInformation: ModelInformation
  originalData: any
  uploading: boolean
  uploadProgress: number
  loading: boolean
  error: string | null
}

const initialState: EditState = {
  files: [],
  coverImage: null,
  modelPictures: [],
  modelFile: null,
  modelInformation: {
    title: '',
    description: '',
    category: '',
    tags: '',
    visibility: 'public',
    nsfwContent: false,
    allowAdaptations: 'yes',
    allowCommercialUse: 'yes',
    allowSharing: 'yes',
    communityPost: false,
  },
  originalData: null,
  uploading: false,
  uploadProgress: 0,
  loading: false,
  error: null,
}

const editSlice = createSlice({
  name: 'edit',
  initialState,
  reducers: {
    setEditData: (state, action: PayloadAction<any>) => {
      const data = action.payload
      state.originalData = data
      state.modelInformation = {
        title: data.title || '',
        description: data.description || '',
        category: data.category || '',
        tags: data.tags || '',
        visibility: data.visibility || 'public',
        nsfwContent: data.nsfwContent || false,
        allowAdaptations: data.allowAdaptations || 'yes',
        allowCommercialUse: data.allowCommercialUse || 'yes',
        allowSharing: data.allowSharing || 'yes',
        communityPost: data.communityPost || false,
      }
      // Convert existing files to File objects or URLs
      if (data.files) {
        state.files = data.files
      }
    },
    setFiles: (state, action: PayloadAction<UploadedFile[]>) => {
      state.files = action.payload
    },
    addFile: (state, action: PayloadAction<UploadedFile>) => {
      state.files.push(action.payload)
    },
    removeFile: (state, action: PayloadAction<string>) => {
      state.files = state.files.filter(file => file.id !== action.payload)
    },
    setCoverImage: (state, action: PayloadAction<File | null>) => {
      state.coverImage = action.payload
    },
    setModelPictures: (state, action: PayloadAction<File[]>) => {
      state.modelPictures = action.payload
    },
    addModelPicture: (state, action: PayloadAction<File>) => {
      state.modelPictures.push(action.payload)
    },
    removeModelPicture: (state, action: PayloadAction<number>) => {
      state.modelPictures.splice(action.payload, 1)
    },
    setModelFile: (state, action: PayloadAction<File | null>) => {
      state.modelFile = action.payload
    },
    updateModelInformation: (state, action: PayloadAction<Partial<ModelInformation>>) => {
      state.modelInformation = { ...state.modelInformation, ...action.payload }
    },
    setUploading: (state, action: PayloadAction<boolean>) => {
      state.uploading = action.payload
    },
    setUploadProgress: (state, action: PayloadAction<number>) => {
      state.uploadProgress = action.payload
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
    resetEdit: (state) => {
      return initialState
    },
  },
})

export const {
  setEditData,
  setFiles,
  addFile,
  removeFile,
  setCoverImage,
  setModelPictures,
  addModelPicture,
  removeModelPicture,
  setModelFile,
  updateModelInformation,
  setUploading,
  setUploadProgress,
  setLoading,
  setError,
  resetEdit,
} = editSlice.actions

export default editSlice.reducer