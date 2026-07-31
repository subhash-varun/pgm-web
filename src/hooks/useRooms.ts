import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/api/client'
import type { Room, RoomFilters, RoomPageResponse } from '@/types/room.types'

export const useRooms = (filters: RoomFilters = {}) => {
  const queryClient = useQueryClient()

  const queryKey = ['rooms', filters]

  const query = useQuery({
    queryKey,
    queryFn: async () => {
      const params = new URLSearchParams()
      if (filters.type) params.append('type', filters.type)
      if (filters.status) params.append('status', filters.status)
      if (filters.minRent) params.append('minRent', String(filters.minRent))
      if (filters.maxRent) params.append('maxRent', String(filters.maxRent))
      if (filters.page !== undefined) params.append('page', String(filters.page))
      if (filters.size) params.append('size', String(filters.size))

      const res = await api.get<{ data: RoomPageResponse }>('/api/admin/rooms', { params })
      return res.data.data
    },
    placeholderData: (prev) => prev,
  })

  // Get room by ID
  const getByIdQuery = useQuery({
    queryKey: ['rooms', 'single', filters.id],
    queryFn: async () => {
      if (!filters.id) throw new Error('ID required')
      const res = await api.get<{ status: string; message: string; data: Room }>(`/api/admin/rooms/${filters.id}`)
      return res.data.data
    },
    enabled: !!filters.id,
  })

  // Get rooms by type
  const byTypeQuery = useQuery({
    queryKey: ['rooms', 'type', filters.typeFilter],
    queryFn: async () => {
      if (!filters.typeFilter) throw new Error('Type required')
      const res = await api.get<{ status: string; message: string; data: Room[] }>(`/api/admin/rooms/type/${filters.typeFilter}`)
      return res.data.data
    },
    enabled: !!filters.typeFilter,
  })

  // Get rooms by status
  const byStatusQuery = useQuery({
    queryKey: ['rooms', 'status', filters.statusFilter],
    queryFn: async () => {
      if (!filters.statusFilter) throw new Error('Status required')
      const res = await api.get<{ status: string; message: string; data: Room[] }>(`/api/admin/rooms/status/${filters.statusFilter}`)
      return res.data.data
    },
    enabled: !!filters.statusFilter,
  })

  // Get room by room number
  const byRoomNumberQuery = useQuery({
    queryKey: ['rooms', 'number', filters.roomNumber],
    queryFn: async () => {
      if (!filters.roomNumber) throw new Error('Room number required')
      const res = await api.get<{ status: string; message: string; data: Room }>(`/api/admin/rooms/number/${filters.roomNumber}`)
      return res.data.data
    },
    enabled: !!filters.roomNumber,
  })

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post('/api/admin/rooms', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['rooms'] }),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      api.put(`/api/admin/rooms/${id}`, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['rooms'] }),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/api/admin/rooms/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['rooms'] }),
  })

  return {
    ...query,
    rooms: query.data?.content || [],
    pagination: {
      total: query.data?.totalElements || 0,
      pages: query.data?.totalPages || 0,
    },
    singleRoom: getByIdQuery.data,
    byType: byTypeQuery.data,
    byStatus: byStatusQuery.data,
    byRoomNumber: byRoomNumberQuery.data,
    createRoom: createMutation.mutateAsync,
    updateRoom: updateMutation.mutateAsync,
    deleteRoom: deleteMutation.mutateAsync,
  }
}
