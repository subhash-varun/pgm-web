import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/api/client'

export interface Role {
  id: number
  name: string
  description: string
  isDefault: boolean
  createdAt: string
}

export interface Permission {
  id: number
  key: string
  name: string
  description: string
  createdAt: string
}

export interface RolePageResponse {
  content: Role[]
  totalElements: number
  totalPages: number
  size: number
  number: number
  first: boolean
  last: boolean
  empty: boolean
}

export interface RoleFilters {
  page?: number
  size?: number
  id?: number
}

export const useRoles = (filters: RoleFilters = {}) => {
  const queryClient = useQueryClient()

  // Get all roles
  const rolesQuery = useQuery({
    queryKey: ['roles', filters],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (filters.page !== undefined) params.append('page', String(filters.page))
      if (filters.size) params.append('size', String(filters.size))

      const res = await api.get<{ 
        status: string
        message: string
        data: RolePageResponse 
      }>('/api/admin/roles', { params })
      return res.data.data
    },
    placeholderData: { 
      content: [], 
      totalElements: 0, 
      totalPages: 0, 
      size: 10, 
      number: 0, 
      first: true, 
      last: true, 
      empty: true 
    },
  })

  // Get role by ID
  const getByIdQuery = useQuery({
    queryKey: ['roles', 'single', filters.id],
    queryFn: async () => {
      if (!filters.id) throw new Error('ID required')
      const res = await api.get<{ 
        status: string
        message: string
        data: Role 
      }>(`/api/admin/roles/${filters.id}`)
      return res.data.data
    },
    enabled: !!filters.id,
  })

  // Get permissions for role
  const permissionsQuery = useQuery({
    queryKey: ['roles', filters.id, 'permissions'],
    queryFn: async () => {
      if (!filters.id) throw new Error('Role ID required')
      const res = await api.get<{ 
        status: string
        message: string
        data: { permissions: Permission[] } 
      }>(`/api/admin/roles/${filters.id}/permissions`)
      return res.data.data.permissions
    },
    enabled: !!filters.id,
  })

  // Create role
  const createMutation = useMutation({
    mutationFn: (data: { name: string; description: string }) => 
      api.post<{ status: string; message: string; data: Role }>('/api/admin/roles', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['roles'] }),
  })

  // Update role
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: { name: string; description: string } }) =>
      api.put<{ status: string; message: string; data: Role }>(`/api/admin/roles/${id}`, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['roles'] }),
  })

  // Delete role
  const deleteMutation = useMutation({
    mutationFn: (id: number) => 
      api.delete<{ status: string; message: string; data: {} }>(`/api/admin/roles/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['roles'] }),
  })

  // Assign permissions to role
  const assignPermissionsMutation = useMutation({
    mutationFn: ({ roleId, permissionIds }: { roleId: number; permissionIds: number[] }) =>
      api.post<{ status: string; message: string; data: {} }>(`/api/admin/roles/${roleId}/permissions`, { permissionIds }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['roles', variables.roleId, 'permissions'] })
    },
  })

  // Remove permission from role
  const removePermissionMutation = useMutation({
    mutationFn: ({ roleId, permissionId }: { roleId: number; permissionId: number }) =>
      api.delete<{ status: string; message: string; data: {} }>(`/api/admin/roles/${roleId}/permissions/${permissionId}`),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['roles', variables.roleId, 'permissions'] })
    },
  })

  return {
    roles: rolesQuery.data?.content || [],
    pagination: rolesQuery.data || { 
      content: [], 
      totalElements: 0, 
      totalPages: 0, 
      size: 10, 
      number: 0, 
      first: true, 
      last: true, 
      empty: true 
    },
    singleRole: getByIdQuery.data,
    permissions: permissionsQuery.data || [],
    isLoading: rolesQuery.isLoading || getByIdQuery.isLoading,
    createRole: createMutation.mutateAsync,
    updateRole: updateMutation.mutateAsync,
    deleteRole: deleteMutation.mutateAsync,
    assignPermissions: assignPermissionsMutation.mutateAsync,
    removePermission: removePermissionMutation.mutateAsync,
  }
}
