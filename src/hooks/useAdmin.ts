import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/api/client'

export interface Admin {
  id: number
  name: string
  email: string
  contactNo: string
  createdAt: string
}

export interface AdminRequest {
  name: string
  email: string
  password: string
  contactNo: string
}

export interface AdminPageResponse {
  content: Admin[]
  totalElements: number
  totalPages: number
  size: number
  number: number
  first: boolean
  last: boolean
  empty: boolean
}

export interface AdminFilters {
  page?: number
  size?: number
  id?: number
}

export const useAdmin = (filters: AdminFilters = {}) => {
  const queryClient = useQueryClient()

  // Get all admins
  const adminsQuery = useQuery({
    queryKey: ['admins', filters],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (filters.page !== undefined) params.append('page', String(filters.page))
      if (filters.size) params.append('size', String(filters.size))

      const res = await api.get<{ 
        status: string
        message: string
        data: AdminPageResponse 
      }>('/api/admin', { params })
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

  // Get admin by ID
  const getByIdQuery = useQuery({
    queryKey: ['admins', 'single', filters.id],
    queryFn: async () => {
      if (!filters.id) throw new Error('ID required')
      const res = await api.get<{ 
        status: string
        message: string
        data: Admin 
      }>(`/api/admin/${filters.id}`)
      return res.data.data
    },
    enabled: !!filters.id,
  })

  // Create admin
  const createMutation = useMutation({
    mutationFn: (data: AdminRequest) => 
      api.post<{ status: string; message: string; data: Admin }>('/api/admin', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admins'] }),
  })

  // Update admin
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<AdminRequest> }) =>
      api.put<{ status: string; message: string; data: Admin }>(`/api/admin/${id}`, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admins'] }),
  })

  // Delete admin
  const deleteMutation = useMutation({
    mutationFn: (id: number) => 
      api.delete<{ status: string; message: string; data: {} }>(`/api/admin/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admins'] }),
  })

  return {
    admins: adminsQuery.data?.content || [],
    pagination: adminsQuery.data || { 
      content: [], 
      totalElements: 0, 
      totalPages: 0, 
      size: 10, 
      number: 0, 
      first: true, 
      last: true, 
      empty: true 
    },
    singleAdmin: getByIdQuery.data,
    isLoading: adminsQuery.isLoading || getByIdQuery.isLoading,
    createAdmin: createMutation.mutateAsync,
    updateAdmin: updateMutation.mutateAsync,
    deleteAdmin: deleteMutation.mutateAsync,
  }
}
