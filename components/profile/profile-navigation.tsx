'use client'

export type TabType = 'home' | 'collections' | '3d-models' | 'laser-cut' | 'posts' | 'ratings';

interface ProfileNavigationProps {
  activeTab: TabType
  onTabChange: (tab: TabType) => void
}

export function ProfileNavigation({ activeTab, onTabChange }: ProfileNavigationProps) {
  const tabs = [
    { id: 'home', label: 'Home' },
    { id: 'collections', label: 'Collections' },
    { id: '3d-models', label: '3d Models' },
    { id: 'laser-cut', label: 'Laser & Cut Models' },
    { id: 'posts', label: 'Posts' },
    { id: 'ratings', label: 'Ratings' },
  ] as const;

  return (
    <div className='flex border-b border-gray-200 mb-[32px]'>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`px-[16px] py-[12px] text-[16px] font-medium transition-colors ${
            activeTab === tab.id
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => onTabChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}