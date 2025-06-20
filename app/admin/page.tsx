// app/admin/page.tsx
'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/navbar'
import { AdminModelCard } from '@/components/admin/admin-model-card'
import { AdminHeader } from '@/components/admin/admin-header'
import { AdminFilters } from '@/components/admin/admin-filters'
import { AdminSkeleton } from '@/components/skeletons/admin-skeleton'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

// Types for admin models
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

interface AdminStats {
  pending: number
  approved: number
  rejected: number
  total: number
}

/**
 * Admin Page Component - /app/admin/page.tsx
 * Handles model verification workflow for administrators
 * Features: Model approval/rejection, filtering, statistics
 */
export default function AdminPage() {
  // Authentication and routing
  const { data: session, status } = useSession()
  const router = useRouter()
  
  // State management
  const [models, setModels] = useState<AdminModel[]>([])
  const [stats, setStats] = useState<AdminStats>({ pending: 0, approved: 0, rejected: 0, total: 0 })
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [checkingAdmin, setCheckingAdmin] = useState(true)
  const [filter, setFilter] = useState<'all' | 'verification' | 'published' | 'rejected'>('verification')
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'category'>('newest')
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  // Check if user is admin by calling API
  const checkAdminStatus = async () => {
    try {
      setCheckingAdmin(true)
      const response = await fetch('/api/admin/check-role', {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        setIsAdmin(data.isAdmin)
      } else {
        setIsAdmin(false)
      }
    } catch (error) {
      console.error('Error checking admin status:', error)
      setIsAdmin(false)
    } finally {
      setCheckingAdmin(false)
    }
  }

  /**
   * Fetch models for admin review
   * API endpoint: /api/admin/models
   */
  const fetchAdminModels = useCallback(async () => {
    try {
      setLoading(true)
      console.log('🔄 Fetching admin models...')
      
      const queryParams = new URLSearchParams({
        filter,
        sortBy,
        limit: '20'
      })

      const response = await fetch(`/api/admin/models?${queryParams}`, {
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        console.log('✅ Admin models loaded:', data.models?.length || 0)
        
        setModels(data.models || [])
        setStats(data.stats || { pending: 0, approved: 0, rejected: 0, total: 0 })
      } else {
        const errorData = await response.json()
        console.error('❌ Failed to fetch admin models:', errorData)
        toast.error(errorData.error || 'Failed to load models')
      }
    } catch (error: any) {
      console.error('❌ Admin models fetch error:', error)
      toast.error('Failed to load admin models')
    } finally {
      setLoading(false)
    }
  }, [filter, sortBy])

  /**
   * Handle model approval
   * Updates model status to 'published'
   */
  const handleApprove = async (modelId: string, adminNotes?: string) => {
    try {
      setActionLoading(modelId)
      console.log('✅ Approving model:', modelId)

      const response = await fetch(`/api/admin/models/${modelId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          action: 'approve',
          adminNotes: adminNotes || 'Model approved for publication'
        })
      })

      if (response.ok) {
        const data = await response.json()
        console.log('✅ Model approved successfully:', data)
        
        toast.success('Model approved and published successfully')
        
        // Refresh the models list
        await fetchAdminModels()
      } else {
        const errorData = await response.json()
        console.error('❌ Failed to approve model:', errorData)
        toast.error(errorData.error || 'Failed to approve model')
      }
    } catch (error: any) {
      console.error('❌ Model approval error:', error)
      toast.error('Failed to approve model')
    } finally {
      setActionLoading(null)
    }
  }

  /**
   * Handle model rejection
   * Updates model status to 'rejected' with reason
   */
  const handleReject = async (modelId: string, rejectionReason: string, adminNotes?: string) => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a rejection reason')
      return
    }

    try {
      setActionLoading(modelId)
      console.log('❌ Rejecting model:', modelId)

      const response = await fetch(`/api/admin/models/${modelId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          action: 'reject',
          rejectionReason,
          adminNotes
        })
      })

      if (response.ok) {
        const data = await response.json()
        console.log('❌ Model rejected successfully:', data)
        
        toast.success('Model rejected and user notified')
        
        // Refresh the models list
        await fetchAdminModels()
      } else {
        const errorData = await response.json()
        console.error('❌ Failed to reject model:', errorData)
        toast.error(errorData.error || 'Failed to reject model')
      }
    } catch (error: any) {
      console.error('❌ Model rejection error:', error)
      toast.error('Failed to reject model')
    } finally {
      setActionLoading(null)
    }
  }

  // Effects
  useEffect(() => {
    if (status === 'loading') return

    if (status === 'unauthenticated') {
      router.push('/?login=true')
      return
    }

    if (status === 'authenticated') {
      checkAdminStatus()
    }
  }, [status, router])

  useEffect(() => {
    if (!checkingAdmin && isAdmin) {
      fetchAdminModels()
    } else if (!checkingAdmin && !isAdmin) {
      toast.error('Access denied. Admin privileges required.')
      router.push('/')
    }
  }, [checkingAdmin, isAdmin])

  // Show loading while checking admin status
  if (loading || status === 'loading' || checkingAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-[92px]">
          <AdminSkeleton />
        </div>
      </div>
    )
  }

  // Not authorized
  if (!session || !isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">
            You need administrator privileges to access this page.
          </p>
          <Button onClick={() => router.push('/')}>
            Go Home
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-[92px] pb-[100px] px-[32px]">
        <div className="max-w-7xl mx-auto">
          {/* Admin Header with Stats */}
          <AdminHeader stats={stats} />
          
          {/* Filters and Controls */}
          <AdminFilters
            filter={filter}
            sortBy={sortBy}
            onFilterChange={setFilter}
            onSortChange={setSortBy}
            onRefresh={fetchAdminModels}
          />
          
          {/* Models Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {models.length > 0 ? (
              models.map((model) => (
                <AdminModelCard
                  key={model.id}
                  model={model}
                  onApprove={handleApprove}
                  onReject={handleReject}
                  isLoading={actionLoading === model.id}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-6 mx-auto">
                  <span className="text-3xl">📋</span>
                </div>
                <h2 className="text-2xl font-bold mb-4 text-foreground">
                  No Models Found
                </h2>
                <p className="text-muted-foreground mb-6">
                  {filter === 'verification' 
                    ? 'No models pending verification at the moment.'
                    : `No ${filter} models found.`
                  }
                </p>
                <Button onClick={fetchAdminModels}>
                  Refresh
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}