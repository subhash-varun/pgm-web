import { useQuery } from '@tanstack/react-query'
import api from '@/api/client'

export const useNotificationPermissions = () => {
  // Check if user has NOTIFICATION_CREATE permission
  const notificationCreatePermission = useQuery({
    queryKey: ['userAccess', 'NOTIFICATION_CREATE'],
    queryFn: async () => {
      const res = await api.get<{
        status: string
        message: string
        data: { allowed: boolean }
      }>('/api/admin/users/access/check', {
        params: { permission: 'NOTIFICATION_CREATE' }
      })
      return res.data.data.allowed
    },
    enabled: !!localStorage.getItem('pg_token'), // Only run if user is logged in
  })

  return {
    canCreateNotifications: notificationCreatePermission.data || false,
    isLoadingPermissions: notificationCreatePermission.isLoading,
  }
}
