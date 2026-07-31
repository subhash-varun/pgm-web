// src/hooks/useUserPermissions.ts
import { useQuery } from '@tanstack/react-query'
import api from '@/api/client'

/**
 * Hook to check if user has specific permission
 * @param permission - Permission name to check (e.g., 'DASHBOARD_READ', 'ROOM_CREATE')
 * @returns Object with permission status and loading state
 */
export const useUserPermission = (permission: string) => {
  const query = useQuery({
    queryKey: ['userAccess', permission],
    queryFn: async () => {
      const res = await api.get<{
        status: string
        message: string
        data: { allowed: boolean }
      }>('/api/admin/users/access/check', {
        params: { permission }
      })
      return res.data.data.allowed
    },
    enabled: !!localStorage.getItem('pg_token') && !!permission,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  })

  return {
    hasPermission: query.data || false,
    isLoading: query.isLoading,
  }
}

/**
 * Hook to check multiple permissions at once
 * @param permissions - Array of permission names
 * @returns Object with permissions map and loading state
 */
export const useUserPermissions = (permissions: string[]) => {
  const queries = permissions.map(permission => 
    useQuery({
      queryKey: ['userAccess', permission],
      queryFn: async () => {
        const res = await api.get<{
          status: string
          message: string
          data: { allowed: boolean }
        }>('/api/admin/users/access/check', {
          params: { permission }
        })
        return { permission, allowed: res.data.data.allowed }
      },
      enabled: !!localStorage.getItem('pg_token'),
      staleTime: 5 * 60 * 1000,
    })
  )

  const permissionsMap: Record<string, boolean> = {}
  queries.forEach(query => {
    if (query.data) {
      permissionsMap[query.data.permission] = query.data.allowed
    }
  })

  return {
    permissions: permissionsMap,
    isLoading: queries.some(q => q.isLoading),
    isReady: queries.every(q => !q.isLoading),
  }
}

/**
 * Predefined permission sets for different sections
 */
export const SECTION_PERMISSIONS = {
  DASHBOARD: 'DASHBOARD_READ',
  TENANTS: 'TENANT_READ',
  ROOMS: 'ROOM_READ',
  PAYMENTS: 'PAYMENT_READ',
  INVENTORY: 'INVENTORY_READ',
  STAFF: 'STAFF_READ',
  ADMINS: 'ADMIN_READ',
  ROLES: 'ROLE_READ',
  NOTIFICATIONS: 'NOTIFICATION_CREATE',
} as const
