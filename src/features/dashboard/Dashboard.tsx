// src/features/dashboard/Dashboard.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  Users,
  Receipt,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  ArrowUp,
  Activity,
  Calendar,
  DollarSign,
  Building,
  UserCheck,
  AlertTriangle,
  Eye,
  MoreHorizontal,
} from 'lucide-react'
import { useDashboard } from '@/hooks/useDashboard'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

// Professional color palette
const COLORS = {
  primary: '#1f2937', // gray-800
  secondary: '#6b7280', // gray-500
  accent: '#3b82f6', // blue-500
  success: '#10b981', // emerald-500
  warning: '#f59e0b', // amber-500
  danger: '#ef4444', // red-500
  info: '#06b6d4', // cyan-500
  light: '#f9fafb', // gray-50
  dark: '#111827', // gray-900
}
const formatCurrency = (value: number | null | undefined): string => {
  return `₹${(value ?? 0).toLocaleString('en-IN')}`
}

const formatNumber = (value: number | null | undefined): string => {
  return (value ?? 0).toLocaleString('en-IN')
}

const formatPercentage = (value: number | null | undefined): string => {
  return `${(value ?? 0).toFixed(1)}%`
}

export default function Dashboard() {
  const { summary, isLoading } = useDashboard()

  const occupancyRate = summary?.occupancy?.totalRooms
    ? ((summary.occupancy.occupiedRooms / summary.occupancy.totalRooms) * 100)
    : 0

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
          {/* Header Skeleton */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <Skeleton className="h-10 w-48 mb-2" />
              <Skeleton className="h-5 w-96" />
            </div>
            <Skeleton className="h-10 w-32" />
          </div>

          {/* KPI Cards Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="bg-white border border-gray-200">
                <CardHeader className="pb-3">
                  <Skeleton className="h-4 w-24" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16 mb-2" />
                  <Skeleton className="h-4 w-20" />
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Charts and Tables Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-white border border-gray-200">
              <CardHeader>
                <Skeleton className="h-6 w-40" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-64 w-full" />
              </CardContent>
            </Card>
            <Card className="bg-white border border-gray-200">
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  // Empty state
  if (!summary) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Activity className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No data available</h3>
          <p className="text-gray-500">Unable to load dashboard data at this time.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6 space-y-6 md:space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">Monitor your PG operations</p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="px-2 sm:px-3 py-1 text-xs sm:text-sm">
              <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">
                {new Date().toLocaleDateString('en-IN', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
              <span className="sm:hidden">
                {new Date().toLocaleDateString('en-IN', {
                  month: 'short',
                  day: 'numeric'
                })}
              </span>
            </Badge>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-white border border-gray-200 hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Tenants</CardTitle>
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{formatNumber(summary.tenants.total)}</div>
              <div className="flex items-center mt-2">
                <ArrowUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600 font-medium">
                  +{formatNumber(summary.tenants.newThisMonth)} this month
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200 hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Occupancy Rate</CardTitle>
              <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                <Building className="w-5 h-5 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{formatPercentage(occupancyRate)}</div>
              <div className="mt-2">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>{summary.occupancy.occupiedRooms} occupied</span>
                  <span>{summary.occupancy.totalRooms} total</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${occupancyRate}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200 hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Revenue</CardTitle>
              <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{formatCurrency(summary.revenue.rentCollected)}</div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-sm text-gray-600">This month</span>
                <Badge variant="outline" className="text-orange-600 border-orange-200">
                  {formatCurrency(summary.revenue.pendingRent)} pending
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200 hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Maintenance</CardTitle>
              <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{formatNumber(summary.maintenance.pending)}</div>
              <div className="flex items-center mt-2">
                <span className="text-sm text-gray-600">
                  {formatNumber(summary.maintenance.totalRequests)} total requests
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts and Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Chart */}
          {summary.revenueChart && summary.revenueChart.length > 0 && (
            <Card className="bg-white border border-gray-200">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  Revenue Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={summary.revenueChart}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                      dataKey="month"
                      stroke="#6b7280"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="#6b7280"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                    />
                    <Tooltip
                      formatter={(value: number) => [formatCurrency(value), 'Revenue']}
                      labelFormatter={(label) => `${label}`}
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      }}
                    />
                    <Bar
                      dataKey="amount"
                      fill="#3b82f6"
                      radius={[4, 4, 0, 0]}
                      stroke="#2563eb"
                      strokeWidth={1}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Room Status Breakdown */}
          <Card className="bg-white border border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Building className="w-5 h-5 text-green-600" />
                Room Status Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium text-gray-700">Available</span>
                  </div>
                  <span className="text-lg font-bold text-green-600">
                    {formatNumber(summary.occupancy.availableRooms)}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-sm font-medium text-gray-700">Occupied</span>
                  </div>
                  <span className="text-lg font-bold text-blue-600">
                    {formatNumber(summary.occupancy.occupiedRooms)}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                    <span className="text-sm font-medium text-gray-700">Maintenance</span>
                  </div>
                  <span className="text-lg font-bold text-orange-600">
                    {formatNumber(summary.occupancy.maintenanceRooms)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Data Tables Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Payment Performance Table */}
          <Card className="bg-white border border-gray-200">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Receipt className="w-5 h-5 text-blue-600" />
                Payment Performance
              </CardTitle>
              <Button variant="ghost" size="sm">
                <Eye className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-200">
                    <TableHead className="text-gray-600 font-medium">Metric</TableHead>
                    <TableHead className="text-gray-600 font-medium text-right">Count</TableHead>
                    <TableHead className="text-gray-600 font-medium text-right">Rate</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow className="border-gray-100">
                    <TableCell className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="font-medium">On Time</span>
                    </TableCell>
                    <TableCell className="text-right font-semibold text-green-600">
                      {formatNumber(summary.payments.onTime)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant="outline" className="text-green-600 border-green-200">
                        {summary.tenants.total > 0
                          ? formatPercentage((summary.payments.onTime / summary.tenants.total) * 100)
                          : '0%'
                        }
                      </Badge>
                    </TableCell>
                  </TableRow>
                  <TableRow className="border-gray-100">
                    <TableCell className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-orange-500" />
                      <span className="font-medium">Late</span>
                    </TableCell>
                    <TableCell className="text-right font-semibold text-orange-600">
                      {formatNumber(summary.payments.late)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant="outline" className="text-orange-600 border-orange-200">
                        {summary.tenants.total > 0
                          ? formatPercentage((summary.payments.late / summary.tenants.total) * 100)
                          : '0%'
                        }
                      </Badge>
                    </TableCell>
                  </TableRow>
                  <TableRow className="border-gray-100">
                    <TableCell className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-gray-500" />
                      <span className="font-medium">Avg Delay</span>
                    </TableCell>
                    <TableCell className="text-right font-semibold text-gray-600" colSpan={2}>
                      {formatNumber(summary.payments.averageDelayDays)} days
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Financial Overview Table */}
          <Card className="bg-white border border-gray-200">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-purple-600" />
                Financial Summary
              </CardTitle>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-200">
                    <TableHead className="text-gray-600 font-medium">Category</TableHead>
                    <TableHead className="text-gray-600 font-medium text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow className="border-gray-100">
                    <TableCell className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="font-medium">Rent Collected</span>
                    </TableCell>
                    <TableCell className="text-right font-semibold text-green-600">
                      {formatCurrency(summary.revenue.rentCollected)}
                    </TableCell>
                  </TableRow>
                  <TableRow className="border-gray-100">
                    <TableCell className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                      <span className="font-medium">Security Deposits</span>
                    </TableCell>
                    <TableCell className="text-right font-semibold text-purple-600">
                      {formatCurrency(summary.revenue.deposits)}
                    </TableCell>
                  </TableRow>
                  <TableRow className="border-gray-100">
                    <TableCell className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                      <span className="font-medium">Pending Rent</span>
                    </TableCell>
                    <TableCell className="text-right font-semibold text-orange-600">
                      {formatCurrency(summary.revenue.pendingRent)}
                    </TableCell>
                  </TableRow>
                  <TableRow className="border-gray-100 bg-gray-50">
                    <TableCell className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                      <span className="font-medium">Expected Monthly</span>
                    </TableCell>
                    <TableCell className="text-right font-bold text-gray-900">
                      {formatCurrency(summary.revenue.expectedMonthlyRevenue)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activities */}
        {summary.recentActivities && summary.recentActivities.length > 0 && (
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center">
                    <Activity className="w-4 h-4 text-indigo-600" />
                  </div>
                  Recent Activities
                </CardTitle>
                <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700">
                  <Eye className="w-4 h-4 mr-2" />
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-4">
                {summary.recentActivities.slice(0, 8).map((activity: any, idx: number) => {
                  // Determine activity type and styling
                  const getActivityConfig = (type: string) => {
                    switch (type?.toLowerCase()) {
                      case 'payment':
                      case 'rent':
                        return {
                          icon: Receipt,
                          bgColor: 'bg-green-50',
                          iconColor: 'text-green-600',
                          badgeColor: 'bg-green-100 text-green-700',
                          badgeText: 'Payment'
                        }
                      case 'check-in':
                      case 'checkin':
                        return {
                          icon: UserCheck,
                          bgColor: 'bg-blue-50',
                          iconColor: 'text-blue-600',
                          badgeColor: 'bg-blue-100 text-blue-700',
                          badgeText: 'Check-in'
                        }
                      case 'check-out':
                      case 'checkout':
                        return {
                          icon: UserCheck,
                          bgColor: 'bg-orange-50',
                          iconColor: 'text-orange-600',
                          badgeColor: 'bg-orange-100 text-orange-700',
                          badgeText: 'Check-out'
                        }
                      case 'maintenance':
                        return {
                          icon: AlertTriangle,
                          bgColor: 'bg-yellow-50',
                          iconColor: 'text-yellow-600',
                          badgeColor: 'bg-yellow-100 text-yellow-700',
                          badgeText: 'Maintenance'
                        }
                      default:
                        return {
                          icon: Activity,
                          bgColor: 'bg-indigo-50',
                          iconColor: 'text-indigo-600',
                          badgeColor: 'bg-indigo-100 text-indigo-700',
                          badgeText: 'Activity'
                        }
                    }
                  }

                  const config = getActivityConfig(activity.type)
                  const IconComponent = config.icon

                  // Format date to be more readable
                  const formatDate = (dateStr: string) => {
                    if (!dateStr) return 'N/A'
                    try {
                      const date = new Date(dateStr)
                      const now = new Date()
                      const diffTime = Math.abs(now.getTime() - date.getTime())
                      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

                      if (diffDays === 1) return 'Today'
                      if (diffDays === 2) return 'Yesterday'
                      if (diffDays <= 7) return `${diffDays - 1} days ago`
                      return date.toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
                      })
                    } catch {
                      return dateStr
                    }
                  }

                  return (
                    <div
                      key={idx}
                      className="group flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all duration-200 hover:bg-gray-50/50"
                    >
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        {/* Activity Icon */}
                        <div className={`w-12 h-12 ${config.bgColor} rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform duration-200`}>
                          <IconComponent className={`w-5 h-5 ${config.iconColor}`} />
                        </div>

                        {/* Activity Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold text-gray-900 truncate">
                              {activity.tenant || 'Unknown Tenant'}
                            </p>
                            <Badge variant="outline" className={`text-xs px-2 py-0.5 ${config.badgeColor} border-0`}>
                              {config.badgeText}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3 text-sm text-gray-600">
                            {activity.room && (
                              <span className="flex items-center gap-1">
                                <Building className="w-3 h-3" />
                                Room {activity.room}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatDate(activity.date)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Amount */}
                      <div className="text-right ml-4">
                        <div className="text-lg font-bold text-green-600 group-hover:text-green-700 transition-colors">
                          {formatCurrency(activity.amount)}
                        </div>
                        {activity.status && (
                          <div className="text-xs text-gray-500 mt-0.5">
                            {activity.status}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Load More Button */}
              {summary.recentActivities.length > 8 && (
                <div className="mt-6 text-center">
                  <Button variant="outline" className="text-gray-600 border-gray-300 hover:bg-gray-50">
                    Load More Activities
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}