// src/hooks/useRealtimeNotifications.ts
import { useEffect, useRef } from 'react'
import { Client } from '@stomp/stompjs'
import { useAuthStore } from '@/store/useAuthStore'
import { useAuth } from '@/hooks/useAuth'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

export const useRealtimeNotifications = () => {
  const clientRef = useRef<Client | null>(null)
  const { token } = useAuthStore()
  const { profile } = useAuth()
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!token || !profile?.id) {
      clientRef.current?.deactivate()
      return
    }

    // Prevent duplicate connections
    if (clientRef.current?.connected) {
      return
    }

    const client = new Client({
      brokerURL: 'wss://pgm-backend-1.onrender.com/ws/websocket',
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      debug: (str) => console.log('[STOMP]', str),
      reconnectDelay: 1000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      connectionTimeout: 3000,
    })

    client.onConnect = () => {
      // Subscribe to user-specific notifications
      client.subscribe('/user/queue/notifications', (msg) => {
        try {
          const n = JSON.parse(msg.body)
          toast.success(n.title || 'New Notification', {
            description: n.body,
            duration: 8000,
          })
          queryClient.invalidateQueries({ queryKey: ['notifications'] })
          queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] })
        } catch (error) {
          console.error('Error parsing notification:', error)
        }
      })

      // Subscribe to user-specific count updates
      client.subscribe('/user/queue/notification-count', () => {
        queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] })
      })

      // Subscribe to role-based notifications (e.g., /topic/role/STAFF)
      if (profile?.roles?.length > 0) {
        profile.roles.forEach((role: string) => {
          client.subscribe(`/topic/role/${role.toUpperCase()}`, (msg) => {
            try {
              const n = JSON.parse(msg.body)
              toast.success(n.title || 'New Notification', {
                description: n.body,
                duration: 8000,
              })
              queryClient.invalidateQueries({ queryKey: ['notifications'] })
              queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] })
            } catch (error) {
              console.error('Error parsing role notification:', error)
            }
          })
        })
      }

      // Subscribe to general notification updates
      client.subscribe('/topic/notifications', () => {
        queryClient.invalidateQueries({ queryKey: ['notifications'] })
        queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] })
      })

      // Subscribe to broadcast count updates
      client.subscribe('/topic/notification-count', () => {
        queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] })
      })
    }

    client.onStompError = (frame) => {
      console.error('STOMP Error:', frame.headers.message)
      toast.error('Notification service failed')
    }

    client.activate()
    clientRef.current = client

    return () => client.deactivate()
  }, [token, profile, queryClient])

  return {
    isConnected: clientRef.current?.connected ?? false,
  }
}
