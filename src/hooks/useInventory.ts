import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/api/client'
import type { InventoryItem, InventoryFilters, InventoryPageResponse } from '@/types/inventory.types'
import { useToast } from '@/hooks/use-toast'

export const useInventory = (filters: InventoryFilters = {}) => {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const queryKey = ['inventory', filters]

  const query = useQuery({
    queryKey,
    queryFn: async () => {
      const params = new URLSearchParams()
      
      // Add pagination params
      if (filters.page !== undefined) params.append('page', String(filters.page))
      if (filters.size) params.append('size', String(filters.size))
      
      // Add filter params
      if (filters.search) params.append('search', filters.search)

      const res = await api.get<{ status: string; message: string; data: InventoryPageResponse }>(
        '/api/admin/inventory',
        { params }
      )
      return res.data.data
    },
  })

  // Get inventory item by ID
  const getByIdQuery = (id?: number) => useQuery({
    queryKey: ['inventory', 'single', id],
    queryFn: async () => {
      if (!id) throw new Error('ID required')
      const res = await api.get<{ status: string; message: string; data: InventoryItem }>(
        `/api/admin/inventory/${id}`
      )
      return res.data.data
    },
    enabled: !!id,
  })

  // Get inventory by room ID
  const byRoomQuery = (roomId?: number, page = 0, size = 10) => useQuery({
    queryKey: ['inventory', 'room', roomId, page, size],
    queryFn: async () => {
      if (!roomId) throw new Error('Room ID required')
      const params = new URLSearchParams()
      params.append('page', String(page))
      params.append('size', String(size))
      
      const res = await api.get<{ status: string; message: string; data: InventoryPageResponse }>(
        `/api/admin/inventory/room/${roomId}`,
        { params }
      )
      return res.data.data
    },
    enabled: !!roomId,
  })

  // Get inventory by item name
  const byItemNameQuery = (itemName?: string, page = 0, size = 10) => useQuery({
    queryKey: ['inventory', 'item', itemName, page, size],
    queryFn: async () => {
      if (!itemName) throw new Error('Item name required')
      const params = new URLSearchParams()
      params.append('page', String(page))
      params.append('size', String(size))
      
      const res = await api.get<{ status: string; message: string; data: InventoryPageResponse }>(
        `/api/admin/inventory/item/${encodeURIComponent(itemName)}`,
        { params }
      )
      return res.data.data
    },
    enabled: !!itemName,
  })

  // Get inventory by condition
  const byConditionQuery = (condition?: string, page = 0, size = 10) => useQuery({
    queryKey: ['inventory', 'condition', condition, page, size],
    queryFn: async () => {
      if (!condition) throw new Error('Condition required')
      const params = new URLSearchParams()
      params.append('page', String(page))
      params.append('size', String(size))
      
      const res = await api.get<{ status: string; message: string; data: InventoryPageResponse }>(
        `/api/admin/inventory/condition/${condition}`,
        { params }
      )
      return res.data.data
    },
    enabled: !!condition,
  })

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post('/api/admin/inventory', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
      toast({
        title: 'Success',
        description: 'Inventory item created successfully',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to create item',
        variant: 'destructive',
      })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      api.put(`/api/admin/inventory/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
      toast({
        title: 'Success',
        description: 'Inventory item updated successfully',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update item',
        variant: 'destructive',
      })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/api/admin/inventory/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
      toast({
        title: 'Success',
        description: 'Inventory item deleted successfully',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to delete item',
        variant: 'destructive',
      })
    },
  })

  return {
    ...query,
    items: query.data?.content || [],
    pagination: {
      total: query.data?.totalElements || 0,
      pages: query.data?.totalPages || 0,
      currentPage: query.data?.number || 0,
      size: query.data?.size || 10,
    },
    getByIdQuery,
    byRoomQuery,
    byItemNameQuery,
    byConditionQuery,
    createItem: createMutation.mutateAsync,
    updateItem: updateMutation.mutateAsync,
    deleteItem: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  }
}
