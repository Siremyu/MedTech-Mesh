"use client"

import * as React from "react"
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '@/lib/store'
import { setIsUploading } from '@/lib/features/upload/uploadSlice' // Fix: gunakan setIsUploading, bukan setLoading
import { Navbar } from "@/components/navbar"
import { UploadForm } from "@/components/upload/upload-form"
import { UploadFormSkeleton } from "@/components/skeletons/upload-form-skeleton"

export default function UploadPage() {
  const dispatch = useDispatch<AppDispatch>()
  const { isLoggedIn } = useSelector((state: RootState) => state.auth)
  const { isUploading } = useSelector((state: RootState) => state.upload) // Fix: gunakan isUploading
  const [initialLoading, setInitialLoading] = React.useState(true)

  React.useEffect(() => {
    // Simulate initial loading
    const loadUploadForm = async () => {
      dispatch(setIsUploading(true)) // Fix: gunakan setIsUploading
      
      try {
        // Simulate loading form components/data
        await new Promise(resolve => setTimeout(resolve, 1500))
      } catch (error) {
        console.error('Failed to load upload form:', error)
      } finally {
        dispatch(setIsUploading(false)) // Fix: gunakan setIsUploading
        setInitialLoading(false)
      }
    }

    loadUploadForm()
  }, [dispatch])

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-[80px] pb-[100px] px-[52px]">
        <div className="max-w-4xl mx-auto">
          {(isUploading || initialLoading) ? ( // Fix: gunakan isUploading
            <UploadFormSkeleton />
          ) : (
            <UploadForm />
          )}
        </div>
      </main>
    </div>
  )
}