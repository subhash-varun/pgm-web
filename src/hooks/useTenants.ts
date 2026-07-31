import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/api/client'
import type { Tenant, TenantFilters, TenantPageResponse } from '@/types/tenant.types'

export const useTenants = (filters: TenantFilters = {}) => {
  const queryClient = useQueryClient()

  const queryKey = ['tenants', filters]

  const query = useQuery({
    queryKey,
    queryFn: async () => {
      // If status filter is provided, use the status-specific endpoint
      if (filters.status && filters.status !== '') {
        const params = new URLSearchParams()
        if (filters.page !== undefined) params.append('page', String(filters.page))
        if (filters.size) params.append('size', String(filters.size))

        const res = await api.get<{ status: string; message: string; data: TenantPageResponse }>(
          `/api/admin/tenants/status/${filters.status}`,
          { params }
        )
        return res.data.data
      }

      // Otherwise, use the general endpoint with search
      const params = new URLSearchParams()
      if (filters.search) params.append('search', filters.search)
      if (filters.page !== undefined) params.append('page', String(filters.page))
      if (filters.size) params.append('size', String(filters.size))

      const res = await api.get<{ data: TenantPageResponse }>('/api/admin/tenants', { params })
      return res.data.data
    },
    placeholderData: (prev) => prev,
  })

  // Get tenant by ID
  const getByIdQuery = useQuery({
    queryKey: ['tenants', 'single', filters.id],
    queryFn: async () => {
      if (!filters.id) throw new Error('ID required')
      const res = await api.get<{ status: string; message: string; data: Tenant }>(`/api/admin/tenants/${filters.id}`)
      return res.data.data
    },
    enabled: !!filters.id,
  })

  // Get tenants by status
  const byStatusQuery = useQuery({
    queryKey: ['tenants', 'status', filters.statusFilter],
    queryFn: async () => {
      if (!filters.statusFilter) throw new Error('Status required')
      const params = new URLSearchParams()
      if (filters.page !== undefined) params.append('page', String(filters.page))
      if (filters.size) params.append('size', String(filters.size))
      
      const res = await api.get<{ status: string; message: string; data: TenantPageResponse }>(
        `/api/admin/tenants/status/${filters.statusFilter}`,
        { params }
      )
      return res.data.data
    },
    enabled: !!filters.statusFilter,
  })

  // Get tenants by room ID
  const byRoomQuery = useQuery({
    queryKey: ['tenants', 'room', filters.roomId],
    queryFn: async () => {
      if (!filters.roomId) throw new Error('Room ID required')
      const params = new URLSearchParams()
      if (filters.page !== undefined) params.append('page', String(filters.page))
      if (filters.size) params.append('size', String(filters.size))
      
      const res = await api.get<{ status: string; message: string; data: TenantPageResponse }>(
        `/api/admin/tenants/room/${filters.roomId}`,
        { params }
      )
      return res.data.data
    },
    enabled: !!filters.roomId,
  })

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post('/api/admin/tenants', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tenants'] }),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      api.put(`/api/admin/tenants/${id}`, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tenants'] }),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/api/admin/tenants/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tenants'] }),
  })

  return {
    ...query,
    tenants: query.data?.content || [],
    pagination: {
      total: query.data?.totalElements || 0,
      pages: query.data?.totalPages || 0,
    },
    singleTenant: getByIdQuery.data,
    byStatus: byStatusQuery.data,
    byRoom: byRoomQuery.data,
    createTenant: createMutation.mutateAsync,
    updateTenant: updateMutation.mutateAsync,
    deleteTenant: deleteMutation.mutateAsync,
  }
}
