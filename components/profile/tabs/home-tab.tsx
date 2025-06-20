'use client'

import { User } from '@/types'

interface HomeTabProps {
  user: User
}

export function HomeTab({ user }: HomeTabProps) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">About</h3>
        <p className="text-gray-600">
          {user.bio || 'No bio available'}
        </p>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Activity</h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-blue-600">{user._count?.models || 0}</div>
            <div className="text-sm text-gray-500">Models</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">{user._count?.likes || 0}</div>
            <div className="text-sm text-gray-500">Likes</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-600">{user._count?.downloads || 0}</div>
            <div className="text-sm text-gray-500">Downloads</div>
          </div>
        </div>
      </div>
    </div>
  )
}