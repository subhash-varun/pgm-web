import { useState } from 'react'
import { useMaintenance } from '@/hooks/useMaintenance'
import MaintenanceTable from './components/MaintenanceTable'
import SubmitRequestDialog from './components/SubmitRequestDialog'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Search } from 'lucide-react'

export default function MaintenancePage() {
  const [status, setStatus] = useState<string>('ALL')
  const [priority, setPriority] = useState<string>('ALL')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const [openDialog, setOpenDialog] = useState(false)

  const { requests, total, isLoading, updateStatus, assignStaff } = useMaintenance({
    status: status === 'ALL' ? undefined : status,
    priority: priority === 'ALL' ? undefined : priority,
    search,
    page,
    size: 10,
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Maintenance Requests</h1>
        <Button onClick={() => setOpenDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Report Issue
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search tenant or issue..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(0) }}
                className="pl-10"
              />
            </div>
            <Select value={status} onValueChange={(v) => { setStatus(v); setPage(0) }}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All</SelectItem>
                <SelectItem value="OPEN">Open</SelectItem>
                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                <SelectItem value="RESOLVED">Resolved</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priority} onValueChange={(v) => { setPriority(v); setPage(0) }}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All</SelectItem>
                <SelectItem value="LOW">Low</SelectItem>
                <SelectItem value="MEDIUM">Medium</SelectItem>
                <SelectItem value="HIGH">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <MaintenanceTable
            data={requests}
            isLoading={isLoading}
            pagination={{ pageIndex: page, pageSize: 10, total, pageCount: Math.ceil(total / 10) }}
            onPageChange={setPage}
            onStatusChange={updateStatus}
            onAssign={assignStaff}
          />
        </CardContent>
      </Card>

      <SubmitRequestDialog open={openDialog} onOpenChange={setOpenDialog} />
    </div>
  )
}