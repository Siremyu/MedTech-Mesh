// components/profile/tabs/components/model-card.tsx
'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { CheckCircle, XCircle, Eye, Clock, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'

interface AdminModel {
  id: string
  title: string
  description: string
  category: string
  tags: string[]
  coverImageUrl: string | null
  status: 'verification' | 'published' | 'rejected'
  author: {
    id: string
    displayName: string
    username: string
    email: string
    avatarUrl: string | null
  }
  createdAt: string
  updatedAt: string
  rejectionReason?: string
  adminNotes?: string
}

interface AdminModelCardProps {
  model: AdminModel
  onApprove: (modelId: string, adminNotes?: string) => Promise<void>
  onReject: (modelId: string, rejectionReason: string, adminNotes?: string) => Promise<void>
  isLoading: boolean
}

/**
 * Admin Model Card Component - /components/admin/admin-model-card.tsx
 * Displays individual model for admin review with approve/reject actions
 */
export function AdminModelCard({ model, onApprove, onReject, isLoading }: AdminModelCardProps) {
  // Dialog states
  const [showApproveDialog, setShowApproveDialog] = useState(false)
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  
  // Form states
  const [approveNotes, setApproveNotes] = useState('')
  const [rejectReason, setRejectReason] = useState('')
  const [rejectNotes, setRejectNotes] = useState('')

  /**
   * Get status badge variant and color
   */
  const getStatusBadge = () => {
    switch (model.status) {
      case 'verification':
        return { variant: 'secondary' as const, color: 'bg-yellow-100 text-yellow-800', icon: Clock }
      case 'published':
        return { variant: 'default' as const, color: 'bg-green-100 text-green-800', icon: CheckCircle }
      case 'rejected':
        return { variant: 'destructive' as const, color: 'bg-red-100 text-red-800', icon: XCircle }
      default:
        return { variant: 'secondary' as const, color: 'bg-gray-100 text-gray-800', icon: AlertTriangle }
    }
  }

  /**
   * Handle approve action with notes
   */
  const handleApprove = async () => {
    try {
      await onApprove(model.id, approveNotes.trim() || undefined)
      setShowApproveDialog(false)
      setApproveNotes('')
    } catch (error) {
      console.error('Error approving model:', error)
    }
  }

  /**
   * Handle reject action with reason and notes
   */
  const handleReject = async () => {
    if (!rejectReason.trim()) {
      toast.error('Please provide a rejection reason')
      return
    }

    try {
      await onReject(model.id, rejectReason.trim(), rejectNotes.trim() || undefined)
      setShowRejectDialog(false)
      setRejectReason('')
      setRejectNotes('')
    } catch (error) {
      console.error('Error rejecting model:', error)
    }
  }

  /**
   * Format date to readable string
   */
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return '1 day ago'
    if (diffDays < 7) return `${diffDays} days ago`
    
    return date.toLocaleDateString()
  }

  const statusBadge = getStatusBadge()
  const StatusIcon = statusBadge.icon

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        {/* Model Image */}
        <div className="aspect-video bg-muted rounded-lg overflow-hidden mb-3">
          {model.coverImageUrl ? (
            <img
              src={model.coverImageUrl}
              alt={model.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.style.display = 'none'
                if (target.parentElement) {
                  target.parentElement.innerHTML = `
                    <div class="w-full h-full bg-muted flex items-center justify-center">
                      <span class="text-muted-foreground">No preview</span>
                    </div>
                  `
                }
              }}
            />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <span className="text-muted-foreground">No preview</span>
            </div>
          )}
        </div>

        {/* Status Badge */}
        <div className="flex items-center justify-between mb-2">
          <Badge variant={statusBadge.variant} className="flex items-center gap-1">
            <StatusIcon className="w-3 h-3" />
            {model.status.charAt(0).toUpperCase() + model.status.slice(1)}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {formatDate(model.createdAt)}
          </span>
        </div>

        {/* Model Title */}
        <h3 className="font-semibold text-lg line-clamp-2">{model.title}</h3>
      </CardHeader>

      <CardContent className="flex-1 pb-3">
        {/* Category and Tags */}
        <div className="space-y-2 mb-4">
          <Badge variant="outline">{model.category}</Badge>
          {model.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {model.tags.slice(0, 3).map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {model.tags.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{model.tags.length - 3}
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Author Information */}
        <div className="flex items-center gap-2 mb-4">
          <Avatar className="w-8 h-8">
            {model.author.avatarUrl && (
              <AvatarImage src={model.author.avatarUrl} alt={model.author.displayName} />
            )}
            <AvatarFallback className="text-xs">
              {model.author.displayName.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{model.author.displayName}</p>
            <p className="text-xs text-muted-foreground truncate">@{model.author.username}</p>
          </div>
        </div>

        {/* Description Preview */}
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
          {model.description}
        </p>

        {/* Previous Rejection Reason (if applicable) */}
        {model.status === 'rejected' && model.rejectionReason && (
          <div className="p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700 mb-4">
            <strong>Rejected:</strong> {model.rejectionReason}
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-3 space-y-2">
        {/* View Details Button */}
        <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="w-full">
              <Eye className="w-4 h-4 mr-2" />
              View Details
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{model.title}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {/* Model Image */}
              {model.coverImageUrl && (
                <div className="aspect-video rounded-lg overflow-hidden">
                  <img
                    src={model.coverImageUrl}
                    alt={model.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              
              {/* Model Information */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="font-medium">Category</Label>
                  <p>{model.category}</p>
                </div>
                <div>
                  <Label className="font-medium">Status</Label>
                  <p className="capitalize">{model.status}</p>
                </div>
                <div>
                  <Label className="font-medium">Author</Label>
                  <p>{model.author.displayName} (@{model.author.username})</p>
                </div>
                <div>
                  <Label className="font-medium">Submitted</Label>
                  <p>{formatDate(model.createdAt)}</p>
                </div>
              </div>

              {/* Tags */}
              {model.tags.length > 0 && (
                <div>
                  <Label className="font-medium">Tags</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {model.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Description */}
              <div>
                <Label className="font-medium">Description</Label>
                <p className="mt-1 text-sm text-muted-foreground whitespace-pre-wrap">
                  {model.description}
                </p>
              </div>

              {/* Previous Admin Notes */}
              {model.adminNotes && (
                <div>
                  <Label className="font-medium">Admin Notes</Label>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {model.adminNotes}
                  </p>
                </div>
              )}

              {/* Previous Rejection Reason */}
              {model.rejectionReason && (
                <div>
                  <Label className="font-medium">Rejection Reason</Label>
                  <p className="mt-1 text-sm text-red-600">
                    {model.rejectionReason}
                  </p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Action Buttons for Pending Models */}
        {model.status === 'verification' && (
          <div className="flex gap-2 w-full">
            {/* Approve Dialog */}
            <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
              <DialogTrigger asChild>
                <Button 
                  size="sm" 
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  disabled={isLoading}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approve
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Approve Model</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <p>Are you sure you want to approve "{model.title}" for publication?</p>
                  
                  <div>
                    <Label htmlFor="approve-notes">Admin Notes (Optional)</Label>
                    <Textarea
                      id="approve-notes"
                      placeholder="Add any notes for the approval..."
                      value={approveNotes}
                      onChange={(e) => setApproveNotes(e.target.value)}
                      rows={3}
                    />
                  </div>
                  
                  <div className="flex gap-2 justify-end">
                    <Button 
                      variant="outline" 
                      onClick={() => setShowApproveDialog(false)}
                      disabled={isLoading}
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleApprove}
                      disabled={isLoading}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {isLoading ? 'Approving...' : 'Confirm Approval'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* Reject Dialog */}
            <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
              <DialogTrigger asChild>
                <Button 
                  size="sm" 
                  variant="destructive" 
                  className="flex-1"
                  disabled={isLoading}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Reject Model</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <p>Please provide a reason for rejecting "{model.title}":</p>
                  
                  <div>
                    <Label htmlFor="reject-reason">Rejection Reason *</Label>
                    <Textarea
                      id="reject-reason"
                      placeholder="Explain why this model is being rejected..."
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      rows={3}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="reject-notes">Additional Notes (Optional)</Label>
                    <Textarea
                      id="reject-notes"
                      placeholder="Any additional feedback for the creator..."
                      value={rejectNotes}
                      onChange={(e) => setRejectNotes(e.target.value)}
                      rows={2}
                    />
                  </div>
                  
                  <div className="flex gap-2 justify-end">
                    <Button 
                      variant="outline" 
                      onClick={() => setShowRejectDialog(false)}
                      disabled={isLoading}
                    >
                      Cancel
                    </Button>
                    <Button 
                      variant="destructive"
                      onClick={handleReject}
                      disabled={isLoading || !rejectReason.trim()}
                    >
                      {isLoading ? 'Rejecting...' : 'Confirm Rejection'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        )}

        {/* Status for Non-Pending Models */}
        {model.status !== 'verification' && (
          <div className={`text-center p-2 rounded text-sm ${statusBadge.color}`}>
            <StatusIcon className="w-4 h-4 inline mr-2" />
            {model.status === 'published' ? 'Published' : 'Rejected'}
          </div>
        )}
      </CardFooter>
    </Card>
  )
}