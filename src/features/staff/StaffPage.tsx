import { useState } from 'react'
import { useStaff } from '@/hooks/useStaff'
import StaffTable from './components/StaffTable'
import CreateStaffDialog from './components/CreateStaffDialog'
import EditStaffDialog from './components/EditStaffDialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Search, Users } from 'lucide-react'

export default function StaffPage() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<string>('ALL')
  const [page, setPage] = useState(0)
  const [editingStaff, setEditingStaff] = useState<number | null>(null)
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  const { staff, pagination, isLoading, createStaff, updateStaff, deleteStaff, singleStaff } = useStaff({ 
    page, 
    size: 10 
  })

  // Client-side filtering for search and status
  const filteredStaff = staff.filter(member => {
    const matchesSearch = search === '' || 
      member.name.toLowerCase().includes(search.toLowerCase()) ||
      member.email.toLowerCase().includes(search.toLowerCase())
    
    const matchesStatus = status === 'ALL' || member.status === status
    
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Staff Management</h1>
          <p className="text-gray-600 mt-1">Manage your staff members and their roles</p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Add Staff
        </Button>
      </div>

      {/* Stats Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pagination.totalElements}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Staff</CardTitle>
            <div className="h-2 w-2 bg-green-500 rounded-full"></div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {staff.filter(s => s.status === 'ACTIVE').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactive Staff</CardTitle>
            <div className="h-2 w-2 bg-gray-400 rounded-full"></div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">
              {staff.filter(s => s.status === 'INACTIVE').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Staff ({pagination.totalElements})</CardTitle>
          <div className="flex flex-col md:flex-row gap-4 mt-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Status Filter */}
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Status</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="INACTIVE">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <StaffTable
            data={filteredStaff}
            isLoading={isLoading}
            pagination={pagination}
            onPageChange={(page) => setPage(page)}
            onEdit={setEditingStaff}
            onDelete={deleteStaff}
          />
        </CardContent>
      </Card>

      <CreateStaffDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} onCreate={createStaff} />
      {editingStaff && (
        <EditStaffDialog
          staffId={editingStaff}
          open={!!editingStaff}
          onOpenChange={() => setEditingStaff(null)}
          onUpdate={updateStaff}
        />
      )}
    </div>
  )
}