import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/api/client'
import type { Payment, PaymentFilters, PaymentSummary } from '@/types/payment.types'
import { toast } from 'sonner'

export const usePayments = (filters: PaymentFilters = {}) => {
  const queryClient = useQueryClient()

  const paymentsQuery = useQuery({
    queryKey: ['payments', filters],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (filters.status && filters.status !== 'ALL') params.append('status', filters.status)
      if (filters.search) params.append('search', filters.search)
      if (filters.page !== undefined) params.append('page', String(filters.page))
      if (filters.size) params.append('size', String(filters.size))

      const res = await api.get<{ 
        status: string; 
        message: string; 
        data: { 
          content: Payment[]; 
          totalElements: number; 
          totalPages: number;
        } 
      }>('/api/admin/payments', { params })

      return res.data.data
    },
  })

  // Get payment by ID
  const getByIdQuery = useQuery({
    queryKey: ['payments', 'single', filters.id],
    queryFn: async () => {
      if (!filters.id) throw new Error('ID required')
      const res = await api.get<{ status: string; message: string; data: Payment }>(`/api/admin/payments/${filters.id}`)
      return res.data.data
    },
    enabled: !!filters.id,
  })

  // Get payments by tenant ID
  const byTenantQuery = useQuery({
    queryKey: ['payments', 'tenant', filters.tenantId],
    queryFn: async () => {
      if (!filters.tenantId) throw new Error('Tenant ID required')
      const params = new URLSearchParams()
      if (filters.page !== undefined) params.append('page', String(filters.page))
      if (filters.size) params.append('size', String(filters.size))
      
      const res = await api.get<{ status: string; message: string; data: { content: Payment[]; totalElements: number; totalPages: number } }>(
        `/api/admin/payments/tenant/${filters.tenantId}`,
        { params }
      )
      return res.data.data
    },
    enabled: !!filters.tenantId,
  })

  // Get payments by status
  const byStatusQuery = useQuery({
    queryKey: ['payments', 'status', filters.statusFilter],
    queryFn: async () => {
      if (!filters.statusFilter) throw new Error('Status required')
      const params = new URLSearchParams()
      if (filters.page !== undefined) params.append('page', String(filters.page))
      if (filters.size) params.append('size', String(filters.size))
      
      const res = await api.get<{ status: string; message: string; data: { content: Payment[]; totalElements: number; totalPages: number } }>(
        `/api/admin/payments/status/${filters.statusFilter}`,
        { params }
      )
      return res.data.data
    },
    enabled: !!filters.statusFilter,
  })

  // Get payments by month
  const byMonthQuery = useQuery({
    queryKey: ['payments', 'month', filters.paymentMonth],
    queryFn: async () => {
      if (!filters.paymentMonth) throw new Error('Month required')
      const params = new URLSearchParams()
      if (filters.page !== undefined) params.append('page', String(filters.page))
      if (filters.size) params.append('size', String(filters.size))
      
      const res = await api.get<{ status: string; message: string; data: { content: Payment[]; totalElements: number; totalPages: number } }>(
        `/api/admin/payments/month/${filters.paymentMonth}`,
        { params }
      )
      return res.data.data
    },
    enabled: !!filters.paymentMonth,
  })

  const summary = paymentsQuery.data?.content
    ? computeSummary(paymentsQuery.data.content)
    : null

  // Create payment
  const createMutation = useMutation({
    mutationFn: (data: any) => api.post<{ status: string; message: string; data: Payment }>('/api/admin/payments', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] })
    },
  })

  // Update payment (can be used to mark as paid)
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => 
      api.put<{ status: string; message: string; data: Payment }>(`/api/admin/payments/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] })
    },
  })

  // Delete payment
  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete<{ status: string; message: string; data: {} }>(`/api/admin/payments/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] })
    },
  })

  // Mark payment as paid helper
  const markAsPaid = async (id: number) => {
    try {
      const payment = paymentsQuery.data?.content.find(p => p.id === id)
      if (!payment) {
        toast.error('Payment not found')
        return
      }

      await updateMutation.mutateAsync({
        id,
        data: {
          ...payment,
          status: 'PAID',
          paymentDate: new Date().toISOString(),
        }
      })

      toast.success('Payment marked as paid successfully')
    } catch (error) {
      console.error('Error marking payment as paid:', error)
      toast.error('Failed to mark payment as paid')
    }
  }

  return {
    payments: paymentsQuery.data?.content || [],
    total: paymentsQuery.data?.totalElements || 0,
    totalPages: paymentsQuery.data?.totalPages || 0,
    isLoading: paymentsQuery.isLoading,
    summary,
    summaryLoading: paymentsQuery.isLoading,
    singlePayment: getByIdQuery.data,
    byTenant: byTenantQuery.data,
    byStatus: byStatusQuery.data,
    byMonth: byMonthQuery.data,
    createPayment: createMutation.mutateAsync,
    updatePayment: updateMutation.mutateAsync,
    deletePayment: deleteMutation.mutateAsync,
    markAsPaid,
  }
}

function computeSummary(payments: Payment[]): PaymentSummary {
  const paid = payments.filter(p => p.status === 'PAID')
  const pending = payments.filter(p => p.status === 'PENDING')
  const overdue = payments.filter(p => p.status === 'OVERDUE')

  const monthlyRevenue = payments
    .filter(p => p.status === 'PAID')
    .reduce((acc: any[], p) => {
      const month = p.paymentMonth || p.paymentDate.slice(0, 7)
      const existing = acc.find(x => x.month === month)
      if (existing) {
        existing.amount += p.amount
      } else {
        acc.push({ month, amount: p.amount })
      }
      return acc
    }, [])
    .sort((a, b) => a.month.localeCompare(b.month))
    .slice(-6)

  return {
    totalCollected: paid.reduce((sum, p) => sum + p.amount, 0),
    totalPending: pending.reduce((sum, p) => sum + p.amount, 0),
    totalOverdue: overdue.reduce((sum, p) => sum + p.amount, 0),
    monthlyRevenue,
  }
}
