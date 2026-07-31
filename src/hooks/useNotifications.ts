// src/hooks/useNotifications.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/api/client'
import { useRealtimeNotifications } from './useRealtimeNotifications'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import type {
  Notification,
  NotificationResponse,
  NotificationPreferences,
  SendNotificationRequest,
} from '@/types/notification.types'

export const useNotifications = () => {
  const queryClient = useQueryClient()
  const { isConnected } = useRealtimeNotifications()
  const [isVisible, setIsVisible] = useState(true)
  const [hasInteracted, setHasInteracted] = useState(false)

  // Track page visibility
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden)
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [])

  // Track user interaction for lazy loading
  useEffect(() => {
    const handleInteraction = () => setHasInteracted(true)
    document.addEventListener('click', handleInteraction, { once: true })
    return () => document.removeEventListener('click', handleInteraction)
  }, [])

  // ULTRA OPTIMIZATION: Zero polling approach
  // - WebSocket handles real-time updates
  // - Lazy loading: Only fetch when user interacts
  // - Background sync: Only when WebSocket fails (every 5-10 minutes)
  // - Optimistic updates: Immediate UI feedback

  // Fetch paginated notifications - NO POLLING
  const notificationsQuery = useQuery<NotificationResponse>({
    queryKey: ['notifications'],
    queryFn: async () => {
      const { data } = await api.get<{ data: NotificationResponse }>('/api/notifications?page=0&size=20')
      return data.data
    },
    enabled: hasInteracted && isVisible, // Only fetch when user interacts and tab is visible
    staleTime: 5 * 60 * 1000, // 5 minutes cache
    refetchOnWindowFocus: false, // No automatic refetch
    refetchInterval: !isConnected && isVisible ? 300_000 : false, // Only 5min fallback when WebSocket down
  })

  // Unread count - NO POLLING (except critical fallback)
  const unreadCountQuery = useQuery<number>({
    queryKey: ['notifications', 'unread-count'],
    queryFn: async () => {
      const { data } = await api.get<{ data: number }>('/api/notifications/unread-count')
      return data.data
    },
    enabled: hasInteracted, // Only fetch after user interaction
    staleTime: 10 * 60 * 1000, // 10 minutes cache (very long)
    refetchOnWindowFocus: false, // No automatic refetch
    refetchInterval: !isConnected ? 600_000 : false, // Only 10min fallback when WebSocket completely down
  })

  // Mark single notification as read - OPTIMISTIC UPDATE
  const markAsReadMutation = useMutation<void, Error, number>({
    mutationFn: (notificationId) =>
      api.patch(`/api/notifications/${notificationId}/read`),
    onMutate: async (notificationId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['notifications'] })
      await queryClient.cancelQueries({ queryKey: ['notifications', 'unread-count'] })

      // Snapshot previous values
      const previousNotifications = queryClient.getQueryData(['notifications'])
      const previousUnreadCount = queryClient.getQueryData(['notifications', 'unread-count'])

      // Optimistically update notifications
      queryClient.setQueryData(['notifications'], (old: any) => {
        if (!old?.notifications) return old
        return {
          ...old,
          notifications: old.notifications.map((n: any) =>
            n.id === notificationId ? { ...n, isRead: true } : n
          )
        }
      })

      // Optimistically decrement unread count
      queryClient.setQueryData(['notifications', 'unread-count'], (old: number) => Math.max(0, (old || 0) - 1))

      return { previousNotifications, previousUnreadCount }
    },
    onError: (_err, _notificationId, context) => {
      // Revert optimistic updates on error
      if (context?.previousNotifications) {
        queryClient.setQueryData(['notifications'], context.previousNotifications)
      }
      if (context?.previousUnreadCount !== undefined) {
        queryClient.setQueryData(['notifications', 'unread-count'], context.previousUnreadCount)
      }
    },
    onSettled: () => {
      // Always refetch after mutation settles
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] })
    },
  })

  // Mark all as read - OPTIMISTIC UPDATE
  const markAllAsReadMutation = useMutation<void, Error, void>({
    mutationFn: () => api.patch('/api/notifications/mark-all-read'),
    onMutate: async () => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['notifications'] })
      await queryClient.cancelQueries({ queryKey: ['notifications', 'unread-count'] })

      // Snapshot previous values
      const previousNotifications = queryClient.getQueryData(['notifications'])
      const previousUnreadCount = queryClient.getQueryData(['notifications', 'unread-count'])

      // Optimistically mark all as read
      queryClient.setQueryData(['notifications'], (old: any) => {
        if (!old?.notifications) return old
        return {
          ...old,
          notifications: old.notifications.map((n: any) => ({ ...n, isRead: true }))
        }
      })

      // Optimistically set unread count to 0
      queryClient.setQueryData(['notifications', 'unread-count'], 0)

      return { previousNotifications, previousUnreadCount }
    },
    onError: (_err, _variables, context) => {
      // Revert optimistic updates on error
      if (context?.previousNotifications) {
        queryClient.setQueryData(['notifications'], context.previousNotifications)
      }
      if (context?.previousUnreadCount !== undefined) {
        queryClient.setQueryData(['notifications', 'unread-count'], context.previousUnreadCount)
      }
    },
    onSettled: () => {
      // Always refetch after mutation settles
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] })
    },
  })

  // Notification preferences
  const preferencesQuery = useQuery<NotificationPreferences | null>({
    queryKey: ['notifications', 'preferences'],
    queryFn: async () => {
      const { data } = await api.get<{ data: NotificationPreferences }>('/api/notifications/preferences')
      return data.data
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  // Update preferences
  const updatePreferencesMutation = useMutation<NotificationPreferences, Error, Partial<NotificationPreferences>>({
    mutationFn: (updates) => api.put('/api/notifications/preferences', updates),
    onSuccess: (updatedPreferences) => {
      queryClient.setQueryData(['notifications', 'preferences'], updatedPreferences)
    },
  })

  // Send a new notification (admin feature) - OPTIMISTIC UPDATE
  const sendNotificationMutation = useMutation<
    void,
    Error,
    SendNotificationRequest,
    { previousUnreadCount?: number }
  >({
    mutationFn: (payload) => api.post('/api/notifications/send', payload),
    onMutate: async (payload) => {
      // For broadcast notifications (targetRole or targetUserId is set), optimistically increment count
      // This provides immediate feedback while WebSocket handles the real update
      if (payload.targetRole || payload.targetUserId) {
        await queryClient.cancelQueries({ queryKey: ['notifications', 'unread-count'] })
        const previousUnreadCount = queryClient.getQueryData<number>(['notifications', 'unread-count'])

        // Optimistically increment unread count (assuming current user will receive it)
        queryClient.setQueryData(['notifications', 'unread-count'], (old: number) => (old || 0) + 1)

        return { previousUnreadCount }
      }
      return { previousUnreadCount: undefined }
    },
    onSuccess: () => {
      toast.success('Notification sent successfully!')
      // WebSocket should handle the real-time updates, but add fallback refresh
      // Wait 2 seconds for WebSocket update, then force refresh if needed
      setTimeout(() => {
        queryClient.invalidateQueries({
          queryKey: ['notifications', 'unread-count'],
          refetchType: 'active'
        })
      }, 2000)
    },
    onError: (_err, _payload, context) => {
      // Revert optimistic update on error
      if (context?.previousUnreadCount !== undefined) {
        queryClient.setQueryData(['notifications', 'unread-count'], context.previousUnreadCount)
      }
    },
  })

  return {
    // Data
    notifications: notificationsQuery.data?.notifications ?? [],
    totalNotifications: notificationsQuery.data?.totalElements ?? 0,
    unreadCount: unreadCountQuery.data ?? 0,
    preferences: preferencesQuery.data,

    // Loading states
    isLoading: notificationsQuery.isLoading || unreadCountQuery.isLoading,
    isLoadingPreferences: preferencesQuery.isLoading,

    // Mutations
    markAsRead: markAsReadMutation.mutateAsync,
    markAllAsRead: markAllAsReadMutation.mutateAsync,
    updatePreferences: updatePreferencesMutation.mutateAsync,
    sendNotification: sendNotificationMutation.mutateAsync,

    // Optional: expose mutation states if needed in UI
    isMarkingAsRead: markAsReadMutation.isPending,
    isMarkingAllAsRead: markAllAsReadMutation.isPending,
  }
}