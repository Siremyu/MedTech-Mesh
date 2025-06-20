'use client'

import React from 'react'
import { Home, Clock, Wrench } from 'lucide-react'

export function HomeTab() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
      <div className="bg-gradient-to-br from-gray-50 to-gray-200 rounded-full p-6 mb-6">
        <Home className="w-12 h-12 text-gray-700" />
      </div>
      
      <h2 className="text-2xl font-bold text-gray-800 mb-3">
        Home Dashboard Coming Soon
      </h2>
      
      <p className="text-gray-600 max-w-md mb-6">
        We're building an amazing home dashboard with pinned models, collections, and activity feeds. 
        Stay tuned for updates!
      </p>
      
      <div className="flex items-center gap-2 text-sm text-gray-700 bg-gray-100 px-4 py-2 rounded-full">
        <Clock className="w-4 h-4" />
        <span>In Development</span>
      </div>
      
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl">
        <div className="p-4 bg-white border border-gray-200 rounded-lg">
          <h3 className="font-medium text-gray-800 mb-2">Pinned Models</h3>
          <p className="text-sm text-gray-600">Quick access to your favorite models</p>
        </div>
        <div className="p-4 bg-white border border-gray-200 rounded-lg">
          <h3 className="font-medium text-gray-800 mb-2">Collections</h3>
          <p className="text-sm text-gray-600">Organize your models in collections</p>
        </div>
        <div className="p-4 bg-white border border-gray-200 rounded-lg">
          <h3 className="font-medium text-gray-800 mb-2">Activity Feed</h3>
          <p className="text-sm text-gray-600">Track your recent activities</p>
        </div>
      </div>
    </div>
  )
}