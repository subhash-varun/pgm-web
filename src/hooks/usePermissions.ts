import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/api/client'

export interface Permission {
  id: number
  key: string
  name: string
  description: string
  createdAt: string
}

export interface PermissionPageResponse {
  content: Permission[]
  totalElements: number
  totalPages: number
  size: number
  number: number
  first: boolean
  last: boolean
  empty: boolean
}

export interface PermissionFilters {
  page?: number
  size?: number
  id?: number
}

export const usePermissions = (filters: PermissionFilters = {}) => {
  const queryClient = useQueryClient()

  // Get all permissions
  const permissionsQuery = useQuery({
    queryKey: ['permissions', filters],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (filters.page !== undefined) params.append('page', String(filters.page))
      if (filters.size) params.append('size', String(filters.size))

      const res = await api.get<{ 
        status: string
        message: string
        data: PermissionPageResponse 
      }>('/api/admin/permissions', { params })
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

  // Get permission by ID
  const getByIdQuery = useQuery({
    queryKey: ['permissions', 'single', filters.id],
    queryFn: async () => {
      if (!filters.id) throw new Error('ID required')
      const res = await api.get<{ 
        status: string
        message: string
        data: Permission 
      }>(`/api/admin/permissions/${filters.id}`)
      return res.data.data
    },
    enabled: !!filters.id,
  })

  // Create permission
  const createMutation = useMutation({
    mutationFn: (data: { key: string; name: string; description: string }) => 
      api.post<{ status: string; message: string; data: Permission }>('/api/admin/permissions', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['permissions'] }),
  })

  // Update permission
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: { key: string; name: string; description: string } }) =>
      api.put<{ status: string; message: string; data: Permission }>(`/api/admin/permissions/${id}`, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['permissions'] }),
  })

  // Delete permission
  const deleteMutation = useMutation({
    mutationFn: (id: number) => 
      api.delete<{ status: string; message: string; data: {} }>(`/api/admin/permissions/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['permissions'] }),
  })

  return {
    permissions: permissionsQuery.data?.content || [],
    pagination: permissionsQuery.data || { 
      content: [], 
      totalElements: 0, 
      totalPages: 0, 
      size: 10, 
      number: 0, 
      first: true, 
      last: true, 
      empty: true 
    },
    singlePermission: getByIdQuery.data,
    isLoading: permissionsQuery.isLoading || getByIdQuery.isLoading,
    createPermission: createMutation.mutateAsync,
    updatePermission: updateMutation.mutateAsync,
    deletePermission: deleteMutation.mutateAsync,
  }
}
