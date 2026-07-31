import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/api/client'
import type { MaintenanceRequest, MaintenanceFilters } from '@/types/maintenance.types'

export const useMaintenance = (filters: MaintenanceFilters = {}) => {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ['maintenance', filters],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (filters.status) params.append('status', filters.status)
      if (filters.priority) params.append('priority', filters.priority)
      if (filters.search) params.append('search', filters.search)
      if (filters.page !== undefined) params.append('page', String(filters.page))
      if (filters.size) params.append('size', String(filters.size))

      const res = await api.get<{ data: { content: MaintenanceRequest[]; totalElements: number } }>('/api/admin/maintenance', { params })
      return res.data.data
    },
  })

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      api.patch(`/api/admin/maintenance/${id}/status`, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['maintenance'] }),
  })

  const assignStaff = useMutation({
    mutationFn: ({ id, staffName }: { id: number; staffName: string }) =>
      api.patch(`/api/admin/maintenance/${id}/assign`, { assignedTo: staffName }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['maintenance'] }),
  })

  return {
    requests: query.data?.content || [],
    total: query.data?.totalElements || 0,
    isLoading: query.isLoading,
    updateStatus: updateStatus.mutateAsync,
    assignStaff: assignStaff.mutateAsync,
  }
}