// src/features/payments/PaymentsPage.tsx
import { useState } from 'react'
import { usePayments } from '@/hooks/usePayments'
import PaymentsTable from './components/PaymentsTable'
import RevenueChart from './components/RevenueChart'
import SummaryCards from './components/SummaryCards'
import GenerateReceipt from './components/GenerateReceipt'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'

export default function PaymentsPage() {
  const [status, setStatus] = useState<string>('ALL')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)

  const { payments, total, isLoading, summary, summaryLoading, markAsPaid } = usePayments({
    status: status === 'ALL' ? undefined : status,
    search,
    page,
    size: 10,
  })

  return (
    <div className="space-y-4" data-testid="payments-page">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
          <p className="text-sm text-gray-600 mt-0.5">Manage and track payment records</p>
        </div>
        <GenerateReceipt />
      </div>

      {/* Summary Cards - More Compact */}
      <SummaryCards summary={summary} loading={summaryLoading} />

      {/* Revenue Chart - Reduced Height */}
      <Card className="shadow-sm border-blue-100/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Revenue Trend (Last 6 Months)</CardTitle>
        </CardHeader>
        <CardContent className="pb-4">
          <div className="h-[250px]">
            <RevenueChart data={summary?.monthlyRevenue || []} />
          </div>
        </CardContent>
      </Card>

      {/* Filters + Table */}
      <Card className="shadow-sm border-blue-100/50">
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search tenant name or receipt..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setPage(0)
                }}
                className="pl-10 h-9 bg-white border-blue-100/50 focus-visible:ring-blue-500/20"
              />
            </div>

            <Select value={status} onValueChange={(v) => { setStatus(v); setPage(0) }}>
              <SelectTrigger className="w-44 h-9 bg-white border-blue-100/50">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Status</SelectItem>
                <SelectItem value="PAID">Paid</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="OVERDUE">Overdue</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <PaymentsTable
            data={payments}
            isLoading={isLoading}
            pagination={{
              pageIndex: page,
              pageSize: 10,
              total,
              pageCount: Math.ceil(total / 10),
            }}
            onPageChange={setPage}
            onMarkPaid={markAsPaid}
          />
        </CardContent>
      </Card>
    </div>
  )
}
