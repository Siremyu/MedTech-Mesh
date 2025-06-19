// components/profile/tabs/components/sub-tab-navigation.tsx
import React from 'react'

interface SubTab {
  id: string
  label: string
  count: number
}

interface SubTabNavigationProps {
  subTabs: SubTab[]
  activeSubTab: string
  onSubTabChange: (tabId: string) => void
  isOwner: boolean
}

export function SubTabNavigation({ 
  subTabs, 
  activeSubTab, 
  onSubTabChange, 
  isOwner 
}: SubTabNavigationProps) {
  // Filter tabs based on ownership
  const visibleTabs = isOwner 
    ? subTabs 
    : subTabs.filter(tab => tab.id === 'published')

  return (
    <div className="flex gap-1 bg-gray-100 p-1 rounded-lg mb-6">
      {visibleTabs.map((subTab) => (
        <button
          key={subTab.id}
          onClick={() => onSubTabChange(subTab.id)}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeSubTab === subTab.id
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <span>{subTab.label}</span>
          <span className={`px-2 py-0.5 rounded-full text-xs ${
            activeSubTab === subTab.id
              ? 'bg-gray-100 text-gray-700'
              : 'bg-gray-200 text-gray-600'
          }`}>
            {subTab.count}
          </span>
        </button>
      ))}
    </div>
  )
}