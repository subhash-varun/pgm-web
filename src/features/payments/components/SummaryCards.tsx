import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { IndianRupee, AlertCircle, CheckCircle } from 'lucide-react'

interface Props {
  summary?: any
  loading: boolean
}

export default function SummaryCards({ summary, loading }: Props) {
  if (loading) return <div className="grid grid-cols-1 md:grid-cols-3 gap-6"><Card><CardContent className="p-6">Loading...</CardContent></Card></div>

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Total Collected</CardTitle>
          <CheckCircle className="w-5 h-5 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">₹{summary?.totalCollected?.toLocaleString() || 0}</div>
          <p className="text-xs text-muted-foreground">This month</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Pending</CardTitle>
          <AlertCircle className="w-5 h-5 text-yellow-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">₹{summary?.totalPending?.toLocaleString() || 0}</div>
          <p className="text-xs text-muted-foreground">{summary?.totalPendingCount || 0} tenants</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Overdue</CardTitle>
          <AlertCircle className="w-5 h-5 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">₹{summary?.totalOverdue?.toLocaleString() || 0}</div>
          <p className="text-xs text-muted-foreground">Requires attention</p>
        </CardContent>
      </Card>
    </div>
  )
}