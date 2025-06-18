'use client'

import React from 'react'
import { Star, Clock, TrendingUp, Award } from 'lucide-react'

export function RatingsTab() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
      <div className="bg-gradient-to-br from-gray-50 to-gray-200 rounded-full p-6 mb-6">
        <Star className="w-12 h-12 text-gray-700" />
      </div>
      
      <h2 className="text-2xl font-bold text-gray-900 mb-3">
        Ratings & Reviews Coming Soon
      </h2>
      
      <p className="text-gray-600 max-w-md mb-6">
        Track reviews and ratings for your models, build your reputation in the community, 
        and see detailed feedback from users who've downloaded your designs.
      </p>
      
      <div className="flex items-center gap-2 text-sm text-gray-700 bg-gray-100 px-4 py-2 rounded-full mb-8">
        <Clock className="w-4 h-4" />
        <span>Review System in Planning</span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl">
        <div className="p-4 bg-white border border-gray-200 rounded-lg">
          <Star className="w-8 h-8 text-gray-600 mb-3 mx-auto" />
          <h3 className="font-medium text-gray-900 mb-2">Model Reviews</h3>
          <p className="text-sm text-gray-600">Detailed feedback on your designs</p>
        </div>
        <div className="p-4 bg-white border border-gray-200 rounded-lg">
          <TrendingUp className="w-8 h-8 text-gray-600 mb-3 mx-auto" />
          <h3 className="font-medium text-gray-900 mb-2">Reputation Score</h3>
          <p className="text-sm text-gray-600">Build credibility in the community</p>
        </div>
        <div className="p-4 bg-white border border-gray-200 rounded-lg">
          <Award className="w-8 h-8 text-gray-600 mb-3 mx-auto" />
          <h3 className="font-medium text-gray-900 mb-2">Quality Badges</h3>
          <p className="text-sm text-gray-600">Earn recognition for great models</p>
        </div>
      </div>
    </div>
  )
}