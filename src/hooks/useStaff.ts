import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/api/client'
import type { Staff, StaffFilters, StaffPageResponse } from '@/types/staff.types'

export const useStaff = (filters: StaffFilters = {}) => {
  const queryClient = useQueryClient()

  const staffQuery = useQuery({
    queryKey: ['staff', filters],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (filters.adminId) params.append('adminId', String(filters.adminId))
      if (filters.page !== undefined) params.append('page', String(filters.page))
      if (filters.size) params.append('size', String(filters.size))

      const endpoint = filters.adminId ? `/api/admin/staff/admin/${filters.adminId}` : '/api/admin/staff'
      const res = await api.get<{ status: string; message: string; data: StaffPageResponse }>(endpoint, { params })
      return res.data.data
    },
    placeholderData: { content: [], totalElements: 0, totalPages: 0, size: 10, number: 0, first: true, last: true, empty: true },
  })

  const createMutation = useMutation({
    mutationFn: (data: Omit<Staff, 'id' | 'createdAt'>) => api.post<{ status: string; message: string; data: Staff }>('/api/admin/staff', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['staff'] }),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Staff> }) =>
      api.put<{ status: string; message: string; data: Staff }>(`/api/admin/staff/${id}`, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['staff'] }),
  })

  // ✅ FIXED: Using template literal instead of literal string
  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete<{ status: string; message: string; data: {} }>(`/api/admin/staff/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['staff'] }),
  })

  // ✅ FIXED: Using path parameter instead of query params
  const getByIdQuery = useQuery({
    queryKey: ['staff', 'single', filters.id],
    queryFn: async () => {
      if (!filters.id) throw new Error('ID required')
      const res = await api.get<{ status: string; message: string; data: Staff }>(`/api/admin/staff/${filters.id}`)
      return res.data.data
    },
    enabled: !!filters.id,
  })

  return {
    staff: staffQuery.data?.content || [],
    pagination: staffQuery.data || { content: [], totalElements: 0, totalPages: 0, size: 10, number: 0, first: true, last: true, empty: true },
    singleStaff: getByIdQuery.data,
    isLoading: staffQuery.isLoading || getByIdQuery.isLoading,
    createStaff: createMutation.mutateAsync,
    updateStaff: updateMutation.mutateAsync,
    deleteStaff: deleteMutation.mutateAsync,
  }
}
