import { useQuery } from '@tanstack/react-query'
import api from '@/api/client'

export interface DashboardSummary {
  occupancy: {
    totalRooms: number
    occupiedRooms: number
    availableRooms: number
    maintenanceRooms: number
  }
  tenants: {
    total: number
    newThisMonth: number
    checkoutsThisMonth: number
  }
  revenue: {
    rentCollected: number
    pendingRent: number
    deposits: number
    expectedMonthlyRevenue: number
  }
  payments: {
    onTime: number
    late: number
    averageDelayDays: number
  }
  maintenance: {
    totalRequests: number
    pending: number
    resolved: number
  }
  recentActivities: Array<{
    type: string
    tenant: string
    amount: number
    room: string
    date: string
  }>
  revenueChart: Array<{
    month: string
    amount: number
  }>
}

export const useDashboard = () => {
  const summaryQuery = useQuery({
    queryKey: ['dashboard', 'summary'],
    queryFn: async () => {
      const res = await api.get<{ 
        status: string
        message: string
        data: DashboardSummary 
      }>('/api/admin/dashboard/summary')
      return res.data.data
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  })

  return {
    summary: summaryQuery.data,
    isLoading: summaryQuery.isLoading,
    error: summaryQuery.error,
    refetch: summaryQuery.refetch,
  }
}
