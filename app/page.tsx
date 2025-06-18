"use client";

import * as React from "react";
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '@/lib/store'
import { setRecentModels, setPopularModels, setOtherModels, setCurrentModel, setLoading } from '@/lib/features/models/modelsSlice'
import { useRouter } from 'next/navigation'
import { Navbar } from "@/components/navbar";
import { ModelGrid } from "@/components/model-grid";
import { InfiniteModelGrid } from "@/components/infinite-model-grid";
import { SearchModelGrid } from "@/components/search-model-grid";
import { ModelGridSkeleton } from "@/components/skeletons/model-grid-skeleton";
import { Footer } from "@/components/footer";

// Sample data for different categories with unique IDs
const generateSampleData = (prefix: string, count: number) => {
  const timestamp = Date.now()
  return Array.from({ length: count }, (_, i) => ({
    id: `${prefix}-${i}-${timestamp}`,
    title: prefix === 'recent' ? "New Medical Model" : 
           prefix === 'popular' ? "Popular Heart Model" : 
           "Various Anatomy Model",
    author: prefix === 'recent' ? "Recent Author" : 
            prefix === 'popular' ? "Popular Author" : 
            "Various Author",
    downloads: prefix === 'recent' ? 120 + i * 10 : 
               prefix === 'popular' ? 500 + i * 20 : 
               200 + i * 8,
    likes: prefix === 'recent' ? 85 + i * 5 : 
           prefix === 'popular' ? 300 + i * 15 : 
           150 + i * 7,
  }))
}

const createProductDetail = (model: any) => ({
  ...model,
  category: "3D Models",
  shares: 100,
  description: "Huge thanks to [Nieve5677] — a relentless digital Indiana Jones of classic car models. His SketchFab collection isn't just impressive — it's borderline mythical. Think of Michael Jackson in 3D form, but with more cars and less drama. You want a forgotten '80s hatchback? A rare concept from the '60s? He's probably got it, polished and parked digitally. Remember, with great voxel power comes great responsibility, not a drive-thru. Most importantly, go to his page and download the original FBX files. Don't just window shop — like, follow, and show the man some love. It's free, it's brilliant, and it's the least we can do for a legend who gives so much, for nothing.",
  publishedDate: "7 Day Ago",
  license: "CC Attribution",
  tags: ["medical", "3d", "anatomy"],
  images: ["preview1.jpg", "preview2.jpg", "preview3.jpg"],
  relatedModels: [
    { id: "1", title: "Nama Produk", author: "Author", downloads: 100, likes: 100, shares: 100 },
    { id: "2", title: "Nama Produk", author: "Author", downloads: 100, likes: 100, shares: 100 },
    { id: "3", title: "Nama Produk", author: "Author", downloads: 100, likes: 100, shares: 100 },
  ]
});

export default function Home() {
  const dispatch = useDispatch<AppDispatch>()
  const router = useRouter()
  const { isLoggedIn } = useSelector((state: RootState) => state.auth)
  const { 
    recentModels, 
    popularModels, 
    otherModels, 
    loading, 
    isSearching,
    searchLoading 
  } = useSelector((state: RootState) => state.models)

  React.useEffect(() => {
    // Only load home data if not searching
    if (!isSearching) {
      loadModelsData()
    }
  }, [dispatch, isSearching])

  const loadModelsData = async () => {
    dispatch(setLoading(true))
    
    try {
      // Simulate API loading delay
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Load different categories of models data with unique IDs
      const sampleRecentModels = generateSampleData('recent', 8)
      const samplePopularModels = generateSampleData('popular', 8)
      const sampleOtherModels = generateSampleData('other-initial', 8)
      
      dispatch(setRecentModels(sampleRecentModels))
      dispatch(setPopularModels(samplePopularModels))
      dispatch(setOtherModels(sampleOtherModels))
    } catch (error) {
      console.error('Failed to load models:', error)
    } finally {
      dispatch(setLoading(false))
    }
  }

  const handleModelClick = (model: any) => {
    const productDetail = createProductDetail(model)
    
    // Set current model in Redux state for the product page
    dispatch(setCurrentModel(productDetail))
    
    // Navigate to product page
    router.push(`/product?id=${model.id}`)
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className='mt-[92px] space-y-12 mb-[64px]'>
        {isSearching ? (
          // Search Results View
          searchLoading ? (
            <ModelGridSkeleton title="Search Results" count={8} />
          ) : (
            <SearchModelGrid onModelClick={handleModelClick} />
          )
        ) : (
          // Normal Home View
          loading ? (
            <>
              <ModelGridSkeleton title="Recently Add" count={8} />
              <ModelGridSkeleton title="Popular" count={8} />
              <ModelGridSkeleton title="Other Models" count={8} />
            </>
          ) : (
            <>
              <ModelGrid 
                title="Recently Add" 
                models={recentModels} 
                onModelClick={handleModelClick}
              />
              <ModelGrid 
                title="Popular" 
                models={popularModels} 
                onModelClick={handleModelClick}
              />
              <InfiniteModelGrid 
                title="Other Models" 
                onModelClick={handleModelClick}
              />
            </>
          )
        )}
      </main>

      <Footer />
    </div>
  );
}
