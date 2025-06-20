'use client'

import React, { useState, useEffect } from 'react'
import { FolderPlus, Clock, Star } from 'lucide-react'

interface CollectionsTabProps {
  userId: string
}

export function CollectionsTab({ userId }: CollectionsTabProps) {
  const [collections, setCollections] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch collections logic here
    setLoading(false)
  }, [userId])

  return (
    <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
      <div className="bg-gray-100 rounded-full p-6 mb-6">
        <FolderPlus className="w-12 h-12 text-gray-700" />
      </div>
      
      <h2 className="text-2xl font-bold text-gray-800 mb-3">
        Collections Feature Coming Soon
      </h2>
      
      <p className="text-gray-600 max-w-md mb-6">
        Organize your 3D models into custom collections, share them with the community, 
        and discover curated model sets from other creators.
      </p>
      
      <div className="flex items-center gap-2 text-sm text-gray-700 bg-gray-100 px-4 py-2 rounded-full mb-8">
        <Clock className="w-4 h-4" />
        <span>Feature in Development</span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-lg">
        <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg">
          <Star className="w-8 h-8 text-gray-600 mb-3" />
          <h3 className="font-medium text-gray-800 mb-2">Create Collections</h3>
          <p className="text-sm text-gray-500">Group related models together</p>
        </div>
        <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg">
          <FolderPlus className="w-8 h-8 text-gray-600 mb-3" />
          <h3 className="font-medium text-gray-800 mb-2">Share & Discover</h3>
          <p className="text-sm text-gray-500">Browse community collections</p>
        </div>
      </div>

      <div className="text-center py-8">
        <p className="text-gray-500">Collections feature coming soon</p>
      </div>
    </div>
  )
}