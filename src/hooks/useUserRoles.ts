import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/api/client'
import { Role } from './useRoles'

export type UserType = 'ADMIN' | 'STAFF'

export const useUserRoles = (userId?: number, userType?: UserType) => {
  const queryClient = useQueryClient()

  // Get roles for user
  const userRolesQuery = useQuery({
    queryKey: ['userRoles', userId, userType],
    queryFn: async () => {
      if (!userId || !userType) throw new Error('User ID and type required')
      const res = await api.get<{ 
        status: string
        message: string
        data: { roles: Role[] } 
      }>(`/api/admin/users/${userId}/roles`, { 
        params: { userType } 
      })
      return res.data.data.roles
    },
    enabled: !!userId && !!userType,
  })

  // Check if user has permission (query-based)
  const checkAccessQuery = useQuery({
    queryKey: ['userAccess', 'check'],
    queryFn: async (context) => {
      const permission = context.queryKey[2] as string
      if (!permission) throw new Error('Permission required')
      const res = await api.get<{ 
        status: string
        message: string
        data: { allowed: boolean } 
      }>('/api/admin/users/access/check', { 
        params: { permission } 
      })
      return res.data.data.allowed
    },
    enabled: false, // Only run when manually triggered
  })

  // Assign role to user
  const assignRoleMutation = useMutation({
    mutationFn: ({ userId, roleId, userType }: { userId: number; roleId: number; userType: UserType }) =>
      api.post<{ status: string; message: string; data: {} }>(
        `/api/admin/users/${userId}/roles/${roleId}`,
        null,
        { params: { userType } }
      ),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['userRoles', variables.userId, variables.userType] })
    },
  })

  // Remove role from user
  const removeRoleMutation = useMutation({
    mutationFn: ({ userId, roleId, userType }: { userId: number; roleId: number; userType: UserType }) =>
      api.delete<{ status: string; message: string; data: {} }>(
        `/api/admin/users/${userId}/roles/${roleId}`,
        { params: { userType } }
      ),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['userRoles', variables.userId, variables.userType] })
    },
  })

  // Helper function to check permission
  const checkPermission = async (permission: string) => {
    const res = await api.get<{ 
      status: string
      message: string
      data: { allowed: boolean } 
    }>('/api/admin/users/access/check', { 
      params: { permission } 
    })
    return res.data.data.allowed
  }

  return {
    roles: userRolesQuery.data || [],
    isLoading: userRolesQuery.isLoading,
    assignRole: assignRoleMutation.mutateAsync,
    removeRole: removeRoleMutation.mutateAsync,
    checkPermission,
  }
}
