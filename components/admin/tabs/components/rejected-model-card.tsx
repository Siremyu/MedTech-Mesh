// components/profile/tabs/components/rejected-model-card.tsx
import React from 'react'
import { Clock, AlertTriangle, Edit3 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface RejectedModelCardProps {
  model: {
    id: string
    title: string
    description: string
    thumbnailUrl?: string
    rejectionReason?: string
    adminNotes?: string
    createdAt: string
  }
  onClick: () => void
  onEdit: () => void
}

export function RejectedModelCard({ model, onClick, onEdit }: RejectedModelCardProps) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg overflow-hidden">
      <div className="flex">
        {/* Thumbnail */}
        <div className="w-24 h-24 bg-red-100 flex items-center justify-center flex-shrink-0">
          {model.thumbnailUrl ? (
            <img 
              src={model.thumbnailUrl} 
              alt={model.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 bg-red-200 rounded"></div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-medium text-red-900 mb-1">
                {model.title}
              </h3>
              <p className="text-sm text-red-700 mb-2">
                {model.description}
              </p>
              
              {/* Rejection Reason */}
              {model.rejectionReason && (
                <div className="mb-2">
                  <div className="flex items-center gap-1 text-red-600 mb-1">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="text-sm font-medium">Rejection Reason:</span>
                  </div>
                  <p className="text-sm text-red-700 bg-red-100 p-2 rounded">
                    {model.rejectionReason}
                  </p>
                </div>
              )}

              {/* Admin Notes */}
              {model.adminNotes && (
                <div className="mb-2">
                  <p className="text-xs text-red-600 font-medium mb-1">Admin Notes:</p>
                  <p className="text-sm text-red-700">
                    {model.adminNotes}
                  </p>
                </div>
              )}

              {/* Date */}
              <div className="flex items-center gap-1 text-red-500 text-sm">
                <Clock className="w-4 h-4" />
                <span>Rejected {model.createdAt}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 ml-4">
              <Button
                size="sm"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation()
                  onClick()
                }}
                className="text-red-600 border-red-300 hover:bg-red-100"
              >
                View
              </Button>
              <Button
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  onEdit()
                }}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                <Edit3 className="w-4 h-4 mr-1" />
                Edit & Resubmit
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}