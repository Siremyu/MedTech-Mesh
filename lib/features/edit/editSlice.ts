// lib/features/edit/editSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface EditState {
  loading: boolean
  uploading: boolean
  uploadProgress: number
  files: any[]
  coverImage: File | null
  modelPictures: File[]
  modelFile: File | null
  modelInformation: any
  error: string | null
}

const initialState: EditState = {
  loading: false,
  uploading: false,
  uploadProgress: 0,
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
    allowCommercialUse: 'no',
    allowSharing: 'yes',
    communityPost: false,
  },
  error: null,
}

const editSlice = createSlice({
  name: 'edit',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    setUploading: (state, action: PayloadAction<boolean>) => {
      state.uploading = action.payload
    },
    setUploadProgress: (state, action: PayloadAction<number>) => {
      state.uploadProgress = action.payload
    },
    setFiles: (state, action: PayloadAction<any[]>) => {
      state.files = action.payload
    },
    setCoverImage: (state, action: PayloadAction<File | null>) => {
      state.coverImage = action.payload
    },
    setModelPictures: (state, action: PayloadAction<File[]>) => {
      state.modelPictures = action.payload
    },
    setModelFile: (state, action: PayloadAction<File | null>) => {
      state.modelFile = action.payload
    },
    updateModelInformation: (state, action: PayloadAction<any>) => {
      state.modelInformation = { ...state.modelInformation, ...action.payload }
    },
    setEditData: (state, action: PayloadAction<any>) => {
      state.modelInformation = action.payload
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
  setLoading,
  setUploading,
  setUploadProgress,
  setFiles,
  setCoverImage,
  setModelPictures,
  setModelFile,
  updateModelInformation,
  setEditData,
  setError,
  resetEdit,
} = editSlice.actions

export default editSlice.reducer