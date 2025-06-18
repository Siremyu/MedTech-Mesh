'use client'

import React from 'react'
import { MessageSquare, Clock, Users, Heart } from 'lucide-react'

export function PostsTab() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
      <div className="bg-gradient-to-br from-gray-50 to-gray-200 rounded-full p-6 mb-6">
        <MessageSquare className="w-12 h-12 text-gray-700" />
      </div>
      
      <h2 className="text-2xl font-bold text-gray-900 mb-3">
        Community Posts Coming Soon
      </h2>
      
      <p className="text-gray-600 max-w-md mb-6">
        Share your 3D printing journey, tips, and updates with the MedMesh community. 
        Connect with fellow creators and showcase your work!
      </p>
      
      <div className="flex items-center gap-2 text-sm text-gray-700 bg-gray-100 px-4 py-2 rounded-full mb-8">
        <Clock className="w-4 h-4" />
        <span>Social Features in Beta</span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl">
        <div className="p-4 bg-white border border-gray-200 rounded-lg">
          <MessageSquare className="w-8 h-8 text-gray-600 mb-3 mx-auto" />
          <h3 className="font-medium text-gray-900 mb-2">Share Updates</h3>
          <p className="text-sm text-gray-600">Post about your latest prints</p>
        </div>
        <div className="p-4 bg-white border border-gray-200 rounded-lg">
          <Users className="w-8 h-8 text-gray-700 mb-3 mx-auto" />
          <h3 className="font-medium text-gray-900 mb-2">Community</h3>
          <p className="text-sm text-gray-600">Connect with other makers</p>
        </div>
        <div className="p-4 bg-white border border-gray-200 rounded-lg">
          <Heart className="w-8 h-8 text-gray-500 mb-3 mx-auto" />
          <h3 className="font-medium text-gray-900 mb-2">Engagement</h3>
          <p className="text-sm text-gray-600">Like, comment, and share</p>
        </div>
      </div>
    </div>
  )
}