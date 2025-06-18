'use client'

import React from 'react'
import { Zap, Clock, Layers, Scissors } from 'lucide-react'

export function LaserCutTab() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
      <div className="bg-gradient-to-br from-gray-50 to-gray-200 rounded-full p-6 mb-6">
        <Zap className="w-12 h-12 text-gray-700" />
      </div>
      
      <h2 className="text-2xl font-bold text-gray-900 mb-3">
        Laser & Cut Models Coming Soon
      </h2>
      
      <p className="text-gray-600 max-w-md mb-6">
        Upload and share your laser cutting designs, CNC patterns, and 2D cutting templates. 
        Perfect for makers and fabricators!
      </p>
      
      <div className="flex items-center gap-2 text-sm text-gray-700 bg-gray-100 px-4 py-2 rounded-full mb-8">
        <Clock className="w-4 h-4" />
        <span>Coming Q3 2025</span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl">
        <div className="p-4 bg-white border border-gray-200 rounded-lg">
          <Scissors className="w-8 h-8 text-gray-600 mb-3 mx-auto" />
          <h3 className="font-medium text-gray-900 mb-2">Laser Cutting</h3>
          <p className="text-sm text-gray-600">SVG, DXF, AI file support</p>
        </div>
        <div className="p-4 bg-white border border-gray-200 rounded-lg">
          <Layers className="w-8 h-8 text-gray-500 mb-3 mx-auto" />
          <h3 className="font-medium text-gray-900 mb-2">CNC Patterns</h3>
          <p className="text-sm text-gray-600">Machining and routing files</p>
        </div>
        <div className="p-4 bg-white border border-gray-200 rounded-lg">
          <Zap className="w-8 h-8 text-gray-400 mb-3 mx-auto" />
          <h3 className="font-medium text-gray-900 mb-2">Templates</h3>
          <p className="text-sm text-gray-600">Ready-to-cut designs</p>
        </div>
      </div>
    </div>
  )
}